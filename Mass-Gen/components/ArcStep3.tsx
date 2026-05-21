'use client'
import { useEffect, useMemo, useState } from 'react'
import type { PageId } from '@/app/page'
import { useTeamState } from '@/hooks/useTeamState'
import { ccmComponents } from '@/data/ccmComponents'
import { findModule, type ModuleId, type ModuleState } from '@/data/modules'
import { suggestModules, type ReadinessLevel } from '@/data/readinessDomains'
import RangerPanel from './RangerPanel'

interface Props {
  setActivePage: (p: PageId) => void
}

const ARC3_RANGER_NOTES = [
  {
    title: 'Two at most',
    body: "Sites that try to begin three or more in parallel typically stall on all of them. You can add the next module once your starting work is established — most sites do that around the three-to-six-month mark.",
  },
  {
    title: 'You decide',
    body: 'Suggestions explain their reasoning. If your team has context the system doesn\'t, override and pick what you know fits.',
  },
]

export default function ArcStep3({ setActivePage }: Props) {
  const { state, update, hydrated } = useTeamState()
  const [selected, setSelected] = useState<Set<ModuleId>>(new Set())
  const [showProfile, setShowProfile] = useState(false)

  // Seed selection from team state on hydration (lets user revisit and edit)
  useEffect(() => {
    if (!hydrated) return
    if (state.selectedModules.length) setSelected(new Set(state.selectedModules))
  }, [hydrated, state.selectedModules])

  const levels = useMemo<Record<string, ReadinessLevel> | null>(() => {
    if (!state.readiness) return null
    const out: Record<string, ReadinessLevel> = {}
    Object.entries(state.readiness).forEach(([id, v]) => { out[id] = v.level })
    return out
  }, [state.readiness])

  const suggestion = useMemo(() => (levels ? suggestModules(levels) : null), [levels])
  const suggestedSet = useMemo(() => new Set(suggestion?.modules ?? []), [suggestion])

  function toggle(id: ModuleId) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function begin() {
    if (selected.size === 0) return
    const selectedModules = Array.from(selected)
    const moduleStates: Partial<Record<ModuleId, ModuleState>> = {}
    selectedModules.forEach(id => { moduleStates[id] = 'preparing' })
    update({
      region: 'provisioning',
      hubState: 'emerging',
      selectedModules,
      moduleStates,
      arcCompleted: true,
      arcStep: 3,
      justCommitted: true,
    })
    setActivePage('hub')
  }

  if (!hydrated) return <div className="text-[13px] text-gray-400-ban">Loading…</div>

  const overLimit = selected.size > 2
  const visibleCcm = ccmComponents.filter(c => c.moduleIds.length > 0)

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-green-mid mb-1">
            Orientation arc · Step 3 of 3
          </div>
          <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Choose where to start</h1>
          <p className="text-gray-600-ban leading-relaxed max-w-[640px] mt-2">
            Pick one or two foundational elements to begin with. Choosing moves your team from Basecamp into Preparing on the modules you&apos;ve selected — that&apos;s where you&apos;ll do team formation, infrastructure setup, and initial training before the active improvement work begins.
          </p>
        </div>
        <button
          onClick={() => setActivePage('arc2')}
          className="text-[12px] text-gray-400-ban hover:text-gray-600-ban underline flex-shrink-0 mt-1"
        >
          ← Back to Step 2
        </button>
      </div>

      <div className="grid grid-cols-[1fr_240px] gap-5 items-start">
        <div className="space-y-4">
          {/* Readiness profile reference */}
          {state.synthesis ? (
            <div className="bg-white border border-gray-200-ban rounded-[10px] p-4">
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban">Your readiness profile</div>
                <button
                  onClick={() => setShowProfile(s => !s)}
                  className="text-[11px] text-green-deep hover:text-green-mid underline"
                >
                  {showProfile ? 'Hide details' : 'Review full profile'}
                </button>
              </div>
              <div className="text-[12px] text-gray-700 leading-relaxed">{state.synthesis}</div>
              {showProfile && state.readiness && (
                <div className="mt-3 pt-3 border-t border-gray-100-ban grid grid-cols-2 gap-2">
                  {Object.entries(state.readiness).map(([id, v]) => (
                    <div key={id} className="text-[11px] text-gray-600-ban">
                      <span className="font-medium text-gray-900-ban">{id}</span>: <span className="text-green-deep font-semibold uppercase tracking-wider">{v.level}</span>
                      {v.notes && <div className="text-gray-400-ban italic mt-0.5">{v.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-pale border border-amber-ban/30 rounded-[10px] p-4">
              <div className="text-[12px] text-gray-700 leading-relaxed">
                You haven&apos;t completed the readiness check yet — suggestions below use a sensible default.{' '}
                <button onClick={() => setActivePage('readiness')} className="underline text-green-deep hover:text-green-mid">Take the readiness check first →</button>
              </div>
            </div>
          )}

          {/* Suggestion banner */}
          {suggestion && (
            <div className="bg-green-pale border border-green-light/40 rounded-[10px] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-green-deep mb-1.5">
                Suggested starting modules
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {suggestion.modules.map(id => (
                  <span key={id} className="text-[12px] bg-white border border-green-light/50 text-green-deep px-2.5 py-1 rounded font-medium">
                    {findModule(id)?.name}
                  </span>
                ))}
              </div>
              <div className="text-[12px] text-gray-700 italic leading-relaxed">{suggestion.rationale}</div>
            </div>
          )}

          {/* Modules grouped by CCM */}
          <div className="space-y-3">
            {visibleCcm.map(c => (
              <div key={c.id} className="bg-white border border-gray-200-ban rounded-[10px] overflow-hidden">
                <div className="px-5 py-2.5 border-b border-gray-100-ban text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban bg-gray-50-ban">
                  {c.name}
                </div>
                <div>
                  {c.moduleIds.map(id => {
                    const m = findModule(id)!
                    const isSelected = selected.has(m.id)
                    const isSuggested = suggestedSet.has(m.id)
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggle(m.id)}
                        className={`w-full text-left px-5 py-4 border-b border-gray-100-ban last:border-0 flex gap-3 transition-colors ${
                          isSelected ? 'bg-green-pale/60' : 'hover:bg-gray-50-ban'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border text-[11px] ${
                            isSelected
                              ? 'bg-green-mid border-green-mid text-white'
                              : 'border-gray-200-ban'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[13px] text-gray-900-ban">{m.name}</span>
                            {isSuggested && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-green-deep bg-white border border-green-light/40 px-1.5 py-0.5 rounded">
                                Suggested
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-gray-600-ban leading-relaxed">{m.oneLiner}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Over-limit warning (soft) */}
          {overLimit && (
            <div className="bg-amber-pale border border-amber-ban/30 rounded-[10px] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-ban mb-1.5">
                Two modules at most — recommended
              </div>
              <div className="text-[12px] text-gray-700 leading-relaxed">
                Sites that try to begin three or more in parallel typically stall on all of them. You can add the next module once your starting work is established — most sites do that around the three-to-six-month mark. You can still proceed if your team has decided.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-[12px] text-gray-600-ban">
              {selected.size} of 2 selected{overLimit && ' (over recommended)'}
            </div>
            <button
              onClick={begin}
              disabled={selected.size === 0}
              className="bg-green-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Begin with selected modules →
            </button>
          </div>
        </div>

        <RangerPanel notes={ARC3_RANGER_NOTES} />
      </div>
    </div>
  )
}
