'use client'
import { useSyncExternalStore } from 'react'
import { INITIAL_TEAM_STATE, type TeamState } from '@/data/teamState'

export { requiredStep } from '@/data/teamState'
export type { HubState, ReadinessAnswer, RequiredStep, TeamState } from '@/data/teamState'

const BASE_KEY = 'ban_team_state'

function readQuery(): { site: string; reset: boolean } {
  if (typeof window === 'undefined') return { site: 'default', reset: false }
  const p = new URLSearchParams(window.location.search)
  return {
    site: p.get('site') || 'default',
    reset: p.get('reset') === '1',
  }
}

function freshInitialState(): TeamState {
  return {
    ...INITIAL_TEAM_STATE,
    readiness: null,
    synthesis: null,
    selectedModules: [],
    moduleStates: {},
    justCommitted: false,
  }
}

// ---- Module-level shared store ----
//
// Earlier we used local `useState` inside `useTeamState`, which gave every
// component its own copy of the state. When one component called `update()`,
// the others kept rendering against stale snapshots — most visibly: after
// ArcStep3.begin(), the parent <Home> still thought the gate was active and
// re-rendered the basecamp welcome. The fix is a single subscribable store
// that all `useTeamState()` callers read from via useSyncExternalStore.

let storeState: TeamState = freshInitialState()
let storeHydrated = false
let siteKey = 'default'
let sessionToken: string | null = null
let remoteLoadKey: string | null = null
let remoteLoadInFlight = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach(l => l())
}

function persist(next: TeamState) {
  storeState = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(`${BASE_KEY}:${siteKey}`, JSON.stringify(next))
    } catch {}
    persistRemote(siteKey, next)
  }
  emit()
}

function persistRemote(activeSiteKey: string, next: TeamState) {
  if (!sessionToken || activeSiteKey === 'default') return
  fetch(`/api/progress?siteId=${encodeURIComponent(activeSiteKey)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-ban-session': sessionToken,
    },
    body: JSON.stringify({ state: next }),
  }).catch(() => {})
}

function loadRemote(activeSiteKey: string) {
  if (!sessionToken || activeSiteKey === 'default') return
  const key = `${activeSiteKey}:${sessionToken}`
  if (remoteLoadKey === key || remoteLoadInFlight) return
  remoteLoadKey = key
  remoteLoadInFlight = true

  fetch(`/api/progress?siteId=${encodeURIComponent(activeSiteKey)}`, {
    headers: { 'x-ban-session': sessionToken },
  })
    .then(response => response.ok ? response.json() : null)
    .then(payload => {
      if (!payload?.state || siteKey !== activeSiteKey) return
      storeState = { ...freshInitialState(), ...payload.state }
      try {
        window.localStorage.setItem(`${BASE_KEY}:${activeSiteKey}`, JSON.stringify(storeState))
      } catch {}
      emit()
    })
    .catch(() => {})
    .finally(() => {
      remoteLoadInFlight = false
    })
}

function hydrateForSite(nextSiteKey?: string, nextSessionToken?: string) {
  if (typeof window === 'undefined') return
  if (nextSessionToken) sessionToken = nextSessionToken
  const { site, reset } = readQuery()
  const requestedSiteKey = nextSiteKey || (storeHydrated ? siteKey : site)
  if (storeHydrated && siteKey === requestedSiteKey) {
    loadRemote(siteKey)
    return
  }
  siteKey = requestedSiteKey
  const key = `${BASE_KEY}:${siteKey}`
  if (reset) {
    window.localStorage.removeItem(key)
    storeState = freshInitialState()
  } else {
    try {
      const raw = window.localStorage.getItem(key)
      storeState = raw ? { ...freshInitialState(), ...JSON.parse(raw) } : freshInitialState()
    } catch {
      storeState = freshInitialState()
    }
  }
  storeHydrated = true
  loadRemote(siteKey)
  emit()
}

function subscribe(listener: () => void, requestedSiteKey?: string, nextSessionToken?: string) {
  // Lazy hydrate on first subscription. Safe to call repeatedly.
  hydrateForSite(requestedSiteKey, nextSessionToken)
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): TeamState {
  return storeState
}

function getHydratedSnapshot(): boolean {
  return storeHydrated
}

// SSR: return INITIAL_TEAM_STATE / false. Component will re-render on hydrate.
function getServerSnapshot(): TeamState { return INITIAL_TEAM_STATE }
function getServerHydratedSnapshot(): boolean { return false }

export function useTeamState(requestedSiteKey?: string, nextSessionToken?: string) {
  const state = useSyncExternalStore(
    listener => subscribe(listener, requestedSiteKey, nextSessionToken),
    getSnapshot,
    getServerSnapshot,
  )
  const hydrated = useSyncExternalStore(
    listener => subscribe(listener, requestedSiteKey, nextSessionToken),
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  )

  const update = (patch: Partial<TeamState> | ((prev: TeamState) => Partial<TeamState>)) => {
    const p = typeof patch === 'function' ? patch(storeState) : patch
    persist({ ...storeState, ...p })
  }

  const reset = () => persist(freshInitialState())

  return { state, update, reset, hydrated, siteKey }
}
