'use client'
import { useMemo, useState } from 'react'
import type { PageId } from '@/app/page'
import { useTeamState } from '@/hooks/useTeamState'
import { useNetwork } from '@/hooks/useNetwork'
import { findRegion } from '@/data/regions'
import {
  findModule,
  clinicalModules,
  operationalModules,
  type FoundationalModule,
  type ModuleId,
} from '@/data/modules'
import { ccmComponents } from '@/data/ccmComponents'
import { headlineMeasure, statusFor, STATUS_LABEL, STATUS_COLOR } from '@/data/measures'
import CrossCuttingStrip from './CrossCuttingStrip'
import RangerPanel from './RangerPanel'

interface OpenModuleResult { handled: boolean; module: FoundationalModule | undefined }

interface Props {
  setActivePage: (p: PageId) => void
  openModule: (id: ModuleId) => OpenModuleResult
}

const BASECAMP_RANGER_NOTES = [
  {
    title: 'Welcome',
    body: "You're in Basecamp — the region where every BAN site starts. Nothing here commits you to a clinical change yet. The arc walks you to that choice deliberately.",
  },
  {
    title: 'Why readiness first',
    body: "The readiness check is a 25-minute team conversation. It surfaces where your site is right now so the module suggestions later in the arc actually fit you.",
  },
  {
    title: 'Pace',
    body: "Take this at your team's pace. Pause and return. The arc isn't a gate.",
  },
]

const EMERGING_RANGER_NOTES = [
  {
    title: "You're in Preparing",
    body: 'Each of your chosen clinical modules is in Preparing — team formation, infrastructure setup, and initial training before active improvement work begins.',
  },
  {
    title: 'Operational runs in parallel',
    body: 'Site onboarding (PDUA, IRB, Phlox) runs as its own operational module alongside the clinical work — it doesn\'t block your module choices.',
  },
  {
    title: 'Adding more later',
    body: 'Most sites add their third clinical module around the three-to-six-month mark, once the starting work is established.',
  },
]

export default function Hub({ setActivePage, openModule }: Props) {
  const { state, hydrated, reset } = useTeamState()
  const { network, networkId, hydrated: netHydrated } = useNetwork()
  const region = findRegion(state.region)

  if (!hydrated || !netHydrated) return <div className="text-[13px] text-gray-400-ban">Loading…</div>

  const showEmerging = state.hubState === 'emerging' && state.arcCompleted
  const isStub = networkId === 'icn-stub'

  return (
    <div>
      {isStub && (
        <div className="bg-amber-pale border border-amber-ban/40 rounded-[10px] px-4 py-2 mb-4 text-[12px] text-amber-ban">
          <strong>Demo network swap:</strong> active network is <code>{networkId}</code> (the stub). Remove <code>?network=icn-stub</code> from the URL to switch back to BAN.
        </div>
      )}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-green-mid mb-1">
            {region.name} · {region.tagline}
          </div>
          <h1 className="font-serif text-3xl text-gray-900-ban mb-2">
            {showEmerging ? 'Your starting work' : `Welcome to ${network.name}`}
          </h1>
          <p className="text-gray-600-ban leading-relaxed max-w-[600px]">
            {showEmerging
              ? "You've left Basecamp. Your selected clinical modules are in Preparing — and the operational module (site onboarding) runs alongside them."
              : network.welcomeBody}
          </p>
        </div>
        <button
          onClick={reset}
          className="text-[11px] text-gray-400-ban hover:text-gray-600-ban underline flex-shrink-0 mt-1"
          title="Clear all team state and start over"
        >
          Reset demo
        </button>
      </div>

      {showEmerging ? (
        <EmergingLayout setActivePage={setActivePage} openModule={openModule} />
      ) : (
        <BasecampLayout setActivePage={setActivePage} openModule={openModule} />
      )}

      <CrossCuttingStrip />
    </div>
  )
}

function BasecampLayout({ setActivePage, openModule }: Props) {
  const opModules = operationalModules.filter(m => m.alwaysPresent)

  return (
    <div className="grid grid-cols-[1fr_240px] gap-5">
      <div className="space-y-4">
        <div className="bg-white border border-gray-200-ban rounded-[10px] p-6">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2">
            First step
          </div>
          <div className="font-serif text-xl text-gray-900-ban mb-1.5">Start your readiness check</div>
          <p className="text-[13px] text-gray-600-ban leading-relaxed mb-4">
            A 25-minute structured conversation across seven domains. Your team rates each one Opening / Building / Strong. The result becomes your readiness profile — the input the orientation arc uses to suggest where you might start.
          </p>
          <button
            onClick={() => setActivePage('readiness')}
            className="bg-green-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors"
          >
            Begin readiness check →
          </button>
        </div>

        <div className="bg-white border border-gray-200-ban rounded-[10px] p-6">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-3">
            What comes after
          </div>
          <div className="font-serif text-lg text-gray-900-ban mb-2">The orientation arc (3 steps)</div>
          <ol className="text-[13px] text-gray-600-ban leading-relaxed space-y-1.5 mb-3 list-decimal pl-4">
            <li>What good bipolar care looks like — the seven clinical care elements</li>
            <li>How care delivery is organized — the Chronic Care Model with foundational modules placed inside it</li>
            <li>Choose one or two clinical modules to begin with — that choice moves your team out of Basecamp</li>
          </ol>
          <p className="text-[12px] text-gray-400-ban italic">The arc isn&apos;t a gate. Take it at your pace.</p>
        </div>

        {opModules.length > 0 && (
          <ModuleTrackRow
            label="Operational track — runs in parallel"
            modules={opModules}
            openModule={openModule}
            ariaHint="Operational modules are always present — every site does them alongside the arc."
          />
        )}
      </div>

      <RangerPanel notes={BASECAMP_RANGER_NOTES} />
    </div>
  )
}

function EmergingLayout({ setActivePage, openModule }: Props) {
  const { state } = useTeamState()
  const [comingSoon, setComingSoon] = useState<{ name: string; ccm: string } | null>(null)

  const selectedClinical = useMemo(
    () => state.selectedModules
      .map(id => findModule(id))
      .filter((m): m is FoundationalModule => !!m && m.kind === 'clinical'),
    [state.selectedModules],
  )
  const opModules = useMemo(() => operationalModules.filter(m => m.alwaysPresent), [])

  // "What might come next" — suggest 2 clinical modules NOT yet selected, weighted toward CCM diversity
  const followUps = useMemo(() => {
    const picked = new Set(state.selectedModules)
    const ccmsPicked = new Set(selectedClinical.map(m => m.ccmComponent))
    const others = clinicalModules.filter(m => !picked.has(m.id))
    const fresh = others.filter(m => !ccmsPicked.has(m.ccmComponent))
    return (fresh.length ? fresh : others).slice(0, 2)
  }, [state.selectedModules, selectedClinical])

  const heroModule = selectedClinical[0]

  function clickModule(id: ModuleId) {
    const { handled, module } = openModule(id)
    if (handled || !module) return
    const ccm = ccmComponents.find(c => c.id === module.ccmComponent)?.name ?? ''
    setComingSoon({ name: module.name, ccm })
  }

  return (
    <div className="grid grid-cols-[1fr_240px] gap-5 items-start">
      <div className="space-y-4">
        {heroModule && (
          <div className="bg-green-deep rounded-[10px] p-6 text-white">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-green-light mb-2">
              Next action
            </div>
            <div className="font-serif text-xl mb-1.5">Begin Preparing: {heroModule.name}</div>
            <p className="text-[13px] text-white/80 leading-relaxed mb-4">{heroModule.oneLiner}</p>
            <button
              onClick={() => clickModule(heroModule.id)}
              className="bg-white text-green-deep text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-pale transition-colors"
            >
              {heroModule.unitType === 'change_card' ? 'Open the unit →' : 'See what comes next →'}
            </button>
          </div>
        )}

        <ModuleTrackRow
          label={`Clinical modules — Preparing (${selectedClinical.length})`}
          modules={selectedClinical}
          openModule={openModule}
          onUnhandled={(m) => {
            const ccm = ccmComponents.find(c => c.id === m.ccmComponent)?.name ?? ''
            setComingSoon({ name: m.name, ccm })
          }}
        />

        {opModules.length > 0 && (
          <ModuleTrackRow
            label="Operational track — runs alongside"
            modules={opModules}
            openModule={openModule}
          />
        )}

        {followUps.length > 0 && (
          <div className="bg-white border border-gray-200-ban rounded-[10px] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2">
              What might come next
            </div>
            <p className="text-[12px] text-gray-600-ban leading-relaxed mb-3">
              Once your starting work is established (typically 3–6 months), these clinical modules tend to be the natural next steps for your shape:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {followUps.map(m => (
                <span key={m.id} className="text-[12px] bg-gray-50-ban border border-gray-200-ban text-gray-600-ban px-2.5 py-1 rounded">
                  {m.name}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <button
                onClick={() => setActivePage('arc3')}
                className="text-[11px] text-green-deep hover:text-green-mid underline"
              >
                Reconsider module choice ↻
              </button>
            </div>
          </div>
        )}
      </div>

      <RangerPanel notes={EMERGING_RANGER_NOTES} />

      {comingSoon && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
          onClick={e => { if (e.target === e.currentTarget) setComingSoon(null) }}
        >
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2">{comingSoon.ccm}</div>
            <div className="font-serif text-xl text-gray-900-ban mb-3">{comingSoon.name}</div>
            <p className="text-[13px] text-gray-600-ban leading-relaxed mb-4">
              The module unit for this module isn&apos;t in the system yet — when it&apos;s added it will land here, scoped to your team&apos;s preparing work on {comingSoon.name}.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setComingSoon(null)}
                className="bg-green-deep text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-green-mid transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface TrackProps {
  label: string
  modules: FoundationalModule[]
  openModule: (id: ModuleId) => OpenModuleResult
  ariaHint?: string
  onUnhandled?: (m: FoundationalModule) => void
}

function ModuleTrackRow({ label, modules, openModule, ariaHint, onUnhandled }: TrackProps) {
  if (modules.length === 0) return null

  function handle(m: FoundationalModule) {
    const { handled, module } = openModule(m.id)
    if (!handled && module && onUnhandled) onUnhandled(module)
  }

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2 px-1">
        {label}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {modules.map(m => {
          const ccm = m.ccmComponent ? ccmComponents.find(c => c.id === m.ccmComponent)?.name ?? '' : (m.kind === 'operational' ? 'Operational' : '')
          const cta = m.unitType === 'change_card' ? 'Open unit →'
            : m.unitType === 'phase_navigator' ? 'Open phase navigator →'
            : 'Module unit coming soon'
          const ctaColor = m.unitType === 'none' ? 'text-gray-400-ban italic' : 'text-green-deep'
          return (
            <button
              key={m.id}
              onClick={() => handle(m)}
              className="bg-white border border-gray-200-ban rounded-[10px] p-4 text-left hover:border-green-mid hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban">{ccm}</div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  m.kind === 'operational' ? 'text-amber-ban bg-amber-pale' : 'text-green-deep bg-green-pale'
                }`}>
                  {m.kind === 'operational' ? 'always on' : 'preparing'}
                </span>
              </div>
              <div className="font-medium text-[13px] text-gray-900-ban mb-1">{m.name}</div>
              <div className="text-[11px] text-gray-600-ban leading-relaxed">{m.oneLiner}</div>
              {(() => {
                const hm = headlineMeasure(m.id)
                if (!hm) return null
                const status = statusFor(hm)
                return (
                  <div className="mt-2 pt-2 border-t border-gray-100-ban flex items-center justify-between gap-2">
                    <div className="text-[11px] text-gray-600-ban">
                      <span className="font-semibold text-gray-900-ban tabular-nums">{hm.current}</span>
                      <span className="text-gray-400-ban tabular-nums"> / {hm.target} {hm.unit}</span>
                      <span className="text-gray-400-ban"> — {hm.shortName ?? hm.name}</span>
                    </div>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${STATUS_COLOR[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                )
              })()}
              <div className={`text-[11px] mt-2 ${ctaColor}`}>{cta}</div>
            </button>
          )
        })}
      </div>
      {ariaHint && (
        <div className="text-[11px] text-gray-400-ban italic mt-2 px-1">{ariaHint}</div>
      )}
    </div>
  )
}
