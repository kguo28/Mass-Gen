import type { ModuleId, ModuleState } from '@/data/modules'
import type { ReadinessLevel } from '@/data/readinessDomains'
import type { RegionId } from '@/data/regions'

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

export function requiredStep(state: TeamState): RequiredStep {
  if (state.arcCompleted) return null
  if (!state.readiness) return 'welcome'
  if (state.arcStep < 1) return 'readiness'
  if (state.arcStep < 2) return 'arc1'
  if (state.arcStep < 3) return 'arc2'
  return 'arc3'
}
