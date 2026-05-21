'use client'
import type { PageId } from '@/app/page'
import { useTeamState } from '@/hooks/useTeamState'
import {
  clinicalElements,
  FRAMING_INTRO,
  FRAMING_TREATMENT_GAP,
  FRAMING_CLOSE,
} from '@/data/clinicalElements'
import RangerPanel from './RangerPanel'

interface Props {
  setActivePage: (p: PageId) => void
}

const ARC1_RANGER_NOTES = [
  {
    title: 'Why before how',
    body: "We name the standard of care before we talk about how to organize care delivery. Otherwise you'd be choosing modules without a target to aim at.",
  },
  {
    title: 'About the seven',
    body: 'No element is sufficient alone. The point of naming all seven is to make the gaps visible — including the gaps the network as a whole still has to close.',
  },
]

export default function ArcStep1({ setActivePage }: Props) {
  const { update } = useTeamState()

  function next() {
    update({ arcStep: 2 })
    setActivePage('arc2')
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-green-mid mb-1">
            Orientation arc · Step 1 of 3
          </div>
          <h1 className="font-serif text-3xl text-gray-900-ban mb-2">What good bipolar care looks like</h1>
        </div>
        <button
          onClick={() => setActivePage('readiness')}
          className="text-[12px] text-gray-400-ban hover:text-gray-600-ban underline flex-shrink-0 mt-1"
        >
          ← Back to readiness
        </button>
      </div>

      <div className="grid grid-cols-[1fr_240px] gap-5 items-start">
        <div className="space-y-4">
          <div className="bg-white border border-gray-200-ban rounded-[10px] p-5">
            <p className="text-[13px] text-gray-700 leading-relaxed mb-3">{FRAMING_INTRO}</p>
            <p className="text-[13px] text-gray-700 leading-relaxed">{FRAMING_TREATMENT_GAP}</p>
          </div>

          <div className="bg-white border border-gray-200-ban rounded-[10px] overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100-ban text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban">
              The seven elements
            </div>
            <div>
              {clinicalElements.map(el => (
                <div
                  key={el.n}
                  className="flex gap-4 px-5 py-4 border-b border-gray-100-ban last:border-0"
                >
                  <div className="w-7 h-7 flex-shrink-0 rounded-full bg-green-pale text-green-deep flex items-center justify-center font-semibold text-[13px]">
                    {el.n}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[13px] text-gray-900-ban mb-1">{el.name}</div>
                    <div className="text-[12px] text-gray-600-ban leading-relaxed">{el.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-pale border border-green-light/40 rounded-[10px] p-4">
            <div className="text-[13px] text-gray-700 leading-relaxed italic">{FRAMING_CLOSE}</div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={next}
              className="bg-green-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors"
            >
              Next: how care is organized →
            </button>
          </div>
        </div>

        <RangerPanel notes={ARC1_RANGER_NOTES} />
      </div>
    </div>
  )
}
