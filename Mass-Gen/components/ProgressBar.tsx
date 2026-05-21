'use client'
import type { PageId } from '@/app/page'

interface Props {
  activePage: PageId
  arcStep: 0 | 1 | 2 | 3
  setActivePage: (p: PageId) => void
}

interface Step {
  id: PageId
  label: string
  /** Step index — Welcome=0, Readiness=1, Arc1=2, Arc2=3, Arc3=4. */
  idx: number
}

const STEPS: Step[] = [
  { id: 'hub',       label: 'Welcome',        idx: 0 },
  { id: 'readiness', label: 'Readiness',      idx: 1 },
  { id: 'arc1',      label: 'Clinical care',  idx: 2 },
  { id: 'arc2',      label: 'Care model',     idx: 3 },
  { id: 'arc3',      label: 'Choose',         idx: 4 },
]

function currentIdx(activePage: PageId): number {
  return STEPS.find(s => s.id === activePage)?.idx ?? 0
}

/** Max step index the user is allowed to jump to.
 *  arcStep 0 → only Welcome + Readiness reachable (1)
 *  arcStep 1 → through Arc1 (2)
 *  arcStep 2 → through Arc2 (3)
 *  arcStep 3 → through Arc3 (4) */
function maxReachable(arcStep: 0 | 1 | 2 | 3): number {
  return arcStep + 1
}

export default function ProgressBar({ activePage, arcStep, setActivePage }: Props) {
  const current = currentIdx(activePage)
  const ceiling = maxReachable(arcStep)

  return (
    <div className="bg-white border border-gray-200-ban rounded-[10px] px-6 py-4 mb-6">
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((step, i) => {
          const isCurrent = current === step.idx
          const done = step.idx < current
          // Clickable: never jump beyond what the team has unlocked, and
          // never re-trigger the active step.
          const clickable = !isCurrent && step.idx <= ceiling

          return (
            <button
              key={step.id}
              onClick={() => clickable && setActivePage(step.id)}
              disabled={!clickable}
              className={`flex-1 flex flex-col items-center gap-1.5 ${
                clickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="w-full">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    isCurrent ? 'bg-green-mid'
                      : done ? 'bg-green-deep'
                      : 'bg-gray-200-ban'
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center transition-colors ${
                    isCurrent ? 'bg-green-mid text-white'
                      : done ? 'bg-green-deep text-white'
                      : 'bg-gray-100-ban text-gray-400-ban'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isCurrent ? 'text-gray-900-ban'
                      : done ? 'text-green-deep'
                      : 'text-gray-400-ban'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
