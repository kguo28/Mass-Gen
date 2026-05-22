'use client'
import { useSyncExternalStore } from 'react'
import type { RegionId } from '@/data/regions'
import type { ModuleId, ModuleState } from '@/data/modules'
import type { ReadinessLevel } from '@/data/readinessDomains'

export interface ReadinessAnswer {
  level: ReadinessLevel
  notes?: string
}

export type HubState = 'basecamp' | 'emerging' | 'practicing'

export interface TeamState {
  region: RegionId
  hubState: HubState
  arcStep: 0 | 1 | 2 | 3
  arcCompleted: boolean
  readiness: Record<string, ReadinessAnswer> | null
  synthesis: string | null
  selectedModules: ModuleId[]
  moduleStates: Partial<Record<ModuleId, ModuleState>>
  /** Transient flag — set true the moment Arc Step 3 commits modules.
   *  Hub reads it once to render the post-commit CompletionScreen, then
   *  clears it on dismiss. Persisted to survive the redirect to /hub. */
  justCommitted?: boolean
}

export const INITIAL_TEAM_STATE: TeamState = {
  region: 'basecamp',
  hubState: 'basecamp',
  arcStep: 0,
  arcCompleted: false,
  readiness: null,
  synthesis: null,
  selectedModules: [],
  moduleStates: {},
  justCommitted: false,
}

export type RequiredStep = 'welcome' | 'readiness' | 'arc1' | 'arc2' | 'arc3' | null

/** Single source of truth for the basecamp gate. Returns the step the
 *  user is required to be on, or null once the arc is complete. */
export function requiredStep(state: TeamState): RequiredStep {
  if (state.arcCompleted) return null
  if (!state.readiness) return 'welcome'
  if (state.arcStep < 1) return 'readiness'
  if (state.arcStep < 2) return 'arc1'
  if (state.arcStep < 3) return 'arc2'
  return 'arc3'
}

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
  }
  emit()
}

function hydrateForSite(nextSiteKey?: string) {
  if (typeof window === 'undefined') return
  const { site, reset } = readQuery()
  const requestedSiteKey = nextSiteKey || (storeHydrated ? siteKey : site)
  if (storeHydrated && siteKey === requestedSiteKey) return
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
  emit()
}

function subscribe(listener: () => void, requestedSiteKey?: string) {
  // Lazy hydrate on first subscription. Safe to call repeatedly.
  hydrateForSite(requestedSiteKey)
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

export function useTeamState(requestedSiteKey?: string) {
  const state = useSyncExternalStore(
    listener => subscribe(listener, requestedSiteKey),
    getSnapshot,
    getServerSnapshot,
  )
  const hydrated = useSyncExternalStore(
    listener => subscribe(listener, requestedSiteKey),
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
