'use client'
import { useEffect, useState } from 'react'
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

export function useTeamState() {
  const [state, setState] = useState<TeamState>(INITIAL_TEAM_STATE)
  const [hydrated, setHydrated] = useState(false)
  const [siteKey, setSiteKey] = useState('default')

  useEffect(() => {
    const { site, reset } = readQuery()
    const key = `${BASE_KEY}:${site}`
    setSiteKey(site)
    if (reset) {
      window.localStorage.removeItem(key)
      setState(INITIAL_TEAM_STATE)
      setHydrated(true)
      return
    }
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) setState({ ...INITIAL_TEAM_STATE, ...JSON.parse(raw) })
    } catch {}
    setHydrated(true)
  }, [])

  const persist = (next: TeamState) => {
    setState(next)
    try {
      window.localStorage.setItem(`${BASE_KEY}:${siteKey}`, JSON.stringify(next))
    } catch {}
  }

  const update = (patch: Partial<TeamState> | ((prev: TeamState) => Partial<TeamState>)) => {
    setState(prev => {
      const p = typeof patch === 'function' ? patch(prev) : patch
      const next = { ...prev, ...p }
      try {
        window.localStorage.setItem(`${BASE_KEY}:${siteKey}`, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const reset = () => persist(INITIAL_TEAM_STATE)

  return { state, update, reset, hydrated, siteKey }
}
