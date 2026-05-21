'use client'
import { useMemo } from 'react'
import { useTeamState } from '@/hooks/useTeamState'
import {
  findModule,
  operationalModules,
  type FoundationalModule,
  type ModuleId,
} from '@/data/modules'

interface Props {
  /** id of the module the user is currently "working on" (the unit they last
   *  navigated into, or one explicitly switched to). */
  activeModuleId: ModuleId | null
  /** Set active module and route to its unit. */
  onSwitch: (id: ModuleId) => void
  /** Clear active module — user is on a non-module page (Hub, Map, arc, etc). */
  onClear: () => void
}

export default function ModuleSwitcher({ activeModuleId, onSwitch, onClear }: Props) {
  const { state, hydrated } = useTeamState()

  const chips: FoundationalModule[] = useMemo(() => {
    const selectedClinical = state.selectedModules
      .map(id => findModule(id))
      .filter((m): m is FoundationalModule => !!m && m.kind === 'clinical')
    const ops = operationalModules.filter(m => m.alwaysPresent)
    return [...selectedClinical, ...ops]
  }, [state.selectedModules])

  if (!hydrated) return null
  if (chips.length === 0) return null

  return (
    <div className="bg-white border border-gray-200-ban rounded-[10px] px-4 py-2 mb-5 flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mr-1">
        Working on
      </span>
      {chips.map(m => {
        const active = activeModuleId === m.id
        const isOp = m.kind === 'operational'
        return (
          <button
            key={m.id}
            onClick={() => onSwitch(m.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border transition-all ${
              active
                ? isOp
                  ? 'bg-amber-pale text-amber-ban border-amber-ban'
                  : 'bg-green-deep text-white border-green-deep'
                : isOp
                  ? 'bg-white text-amber-ban border-amber-ban/40 hover:border-amber-ban'
                  : 'bg-white text-green-deep border-green-light/50 hover:border-green-deep'
            }`}
            title={m.oneLiner}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? (isOp ? 'bg-amber-ban' : 'bg-white') : isOp ? 'bg-amber-ban/40' : 'bg-green-deep/40'}`} />
            {m.name}
            {isOp && <span className="text-[9px] uppercase tracking-wider opacity-70">op</span>}
          </button>
        )
      })}
      <div className="flex-1" />
      {activeModuleId && (
        <button
          onClick={onClear}
          className="text-[11px] text-gray-400-ban hover:text-gray-600-ban underline"
        >
          Clear focus
        </button>
      )}
    </div>
  )
}
