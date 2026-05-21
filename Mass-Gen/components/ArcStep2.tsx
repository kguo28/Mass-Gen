'use client'
import type { PageId } from '@/app/page'
import { useTeamState } from '@/hooks/useTeamState'
import {
  ccmComponents,
  CCM_FRAMING,
  CCM_SUBSET_NOTE,
  CCM_OUTCOMES_LINE,
} from '@/data/ccmComponents'
import { findModule } from '@/data/modules'
import RangerPanel from './RangerPanel'

interface Props {
  setActivePage: (p: PageId) => void
}

const ARC2_RANGER_NOTES = [
  {
    title: 'A subset on purpose',
    body: 'Seven foundational modules sit inside the six CCM components — that\'s the BAN starting set. Other CCM components aren\'t skipped, they follow.',
  },
  {
    title: 'Aligned payment',
    body: 'Sits in Health care organization. Uses Principal Care Management codes — designed to be actionable for a dyadic psychiatric practice without restructuring.',
  },
]

export default function ArcStep2({ setActivePage }: Props) {
  const { update } = useTeamState()

  function next() {
    update({ arcStep: 3 })
    setActivePage('arc3')
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-green-mid mb-1">
            Orientation arc · Step 2 of 3
          </div>
          <h1 className="font-serif text-3xl text-gray-900-ban mb-2">How care delivery is organized</h1>
          <p className="text-gray-600-ban leading-relaxed max-w-[640px] mt-2">The Chronic Care Model — with BAN&apos;s seven foundational modules placed inside it.</p>
        </div>
        <button
          onClick={() => setActivePage('arc1')}
          className="text-[12px] text-gray-400-ban hover:text-gray-600-ban underline flex-shrink-0 mt-1"
        >
          ← Back to Step 1
        </button>
      </div>

      <div className="grid grid-cols-[1fr_240px] gap-5 items-start">
        <div className="space-y-4">
          <div className="bg-white border border-gray-200-ban rounded-[10px] p-5">
            <p className="text-[13px] text-gray-700 leading-relaxed">{CCM_FRAMING}</p>
          </div>

          <div className="bg-white border border-gray-200-ban rounded-[10px] overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100-ban text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban">
              CCM component → foundational module(s)
            </div>
            <div>
              {ccmComponents.map(c => {
                const modules = c.moduleIds.map(id => findModule(id)).filter(Boolean)
                const empty = modules.length === 0
                return (
                  <div
                    key={c.id}
                    className="px-5 py-4 border-b border-gray-100-ban last:border-0"
                  >
                    <div className="grid grid-cols-[200px_1fr] gap-4">
                      <div className="font-medium text-[13px] text-gray-900-ban">{c.name}</div>
                      <div>
                        {empty ? (
                          <div className="text-[12px] text-gray-400-ban italic leading-relaxed">{c.note}</div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-1.5 mb-1.5">
                              {modules.map(m => (
                                <span
                                  key={m!.id}
                                  className="text-[11px] bg-green-pale text-green-deep px-2 py-0.5 rounded font-medium"
                                >
                                  {m!.name}
                                </span>
                              ))}
                            </div>
                            {c.note && (
                              <div className="text-[11px] text-gray-400-ban leading-relaxed">{c.note}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-green-pale border border-green-light/40 rounded-[10px] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-green-deep mb-1.5">
              Why a subset
            </div>
            <div className="text-[13px] text-gray-700 leading-relaxed">{CCM_SUBSET_NOTE}</div>
          </div>

          <div className="border-t border-gray-200-ban pt-4">
            <div className="text-[12px] text-gray-600-ban leading-relaxed italic">{CCM_OUTCOMES_LINE}</div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={next}
              className="bg-green-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors"
            >
              Next: choose where to start →
            </button>
          </div>
        </div>

        <RangerPanel notes={ARC2_RANGER_NOTES} />
      </div>
    </div>
  )
}
