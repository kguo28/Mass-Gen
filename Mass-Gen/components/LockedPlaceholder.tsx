'use client'
import type { PageId } from '@/app/page'
import type { RequiredStep } from '@/hooks/useTeamState'

interface Props {
  currentStep: RequiredStep
  setActivePage: (p: PageId) => void
}

const STEP_LABEL: Record<Exclude<RequiredStep, null>, string> = {
  welcome:   'Welcome',
  readiness: 'Readiness check',
  arc1:      'Step 1 — Clinical care elements',
  arc2:      'Step 2 — Chronic Care Model',
  arc3:      'Step 3 — Choose modules',
}

const STEP_PAGE: Record<Exclude<RequiredStep, null>, PageId> = {
  welcome:   'hub',
  readiness: 'readiness',
  arc1:      'arc1',
  arc2:      'arc2',
  arc3:      'arc3',
}

export default function LockedPlaceholder({ currentStep, setActivePage }: Props) {
  if (!currentStep) return null

  const stepLabel = STEP_LABEL[currentStep]
  const targetPage = STEP_PAGE[currentStep]

  return (
    <div className="max-w-[560px] mx-auto py-16">
      <div className="bg-white border border-gray-200-ban rounded-[10px] p-8 text-center">
        <div className="text-3xl mb-3">🔒</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2">
          Available after orientation
        </div>
        <h2 className="font-serif text-2xl text-gray-900-ban mb-3">
          Finish setup to unlock this section
        </h2>
        <p className="text-[13px] text-gray-600-ban leading-relaxed mb-6">
          New sites complete a short readiness check and three-step orientation arc before the rest of the hub opens up. Pick up where you left off below.
        </p>
        <button
          onClick={() => setActivePage(targetPage)}
          className="bg-green-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors"
        >
          Continue: {stepLabel} →
        </button>
      </div>
    </div>
  )
}
