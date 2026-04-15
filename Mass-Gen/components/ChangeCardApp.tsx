'use client'
import { useState, useMemo } from 'react'
import type { ChangeCard } from '@/data/changeCards'

interface Props { card: ChangeCard }

type Phase = 'assess' | 'plan' | 'test' | 'sustain'
type TeamType = 'clinical' | 'admin' | 'solo' | 'other'
type ReadinessScore = 'yes' | 'partly' | 'no' | null
type VisitStatus = 'completed' | 'partial' | 'skipped' | 'na' | null
type ActDecision = 'adopt' | 'adapt' | 'abandon' | 'expand' | null

interface ChangeCardState {
  currentPhase: Phase
  phasesCompleted: Phase[]
  teamComposition: TeamType | null
  readinessScores: Record<string, ReadinessScore>
  selectedBarriers: string[]
  currentWorkflow: string
  aimStatement: string
  pdsa: { what: string; who: string; whoReview: string; patientCount: number; timeframe: string; predict: string }
  visitStatuses: Record<number, VisitStatus>
  study: { worked: string; surprised: string; newBarriers: string }
  actDecision: ActDecision
  actNotes: string
  sustainChecks: Record<number, boolean>
  selectedThreats: string[]
}

const TEAM_OPTIONS: { value: TeamType; label: string; desc: string }[] = [
  { value: 'clinical', label: 'Full clinical team', desc: 'Provider + clinical support staff (MA, RN, care coordinator)' },
  { value: 'admin',    label: 'Provider + admin support', desc: 'Provider + receptionist/scheduler only — no clinical staff' },
  { value: 'solo',     label: 'Solo / near-solo', desc: 'Primarily or entirely you, with minimal support' },
  { value: 'other',    label: 'Other', desc: 'Describe your team context in the workflow field below' },
]

const ACT_OPTIONS: { value: ActDecision; label: string; desc: string; color: string }[] = [
  { value: 'adopt',   label: 'Adopt', desc: 'Worked well — implement as standard practice', color: 'bg-green-100 border-green-500 text-green-800' },
  { value: 'adapt',   label: 'Adapt', desc: 'Partially worked — refine and run another cycle', color: 'bg-yellow-100 border-yellow-500 text-yellow-800' },
  { value: 'abandon', label: 'Abandon', desc: 'Did not work — try a different approach', color: 'bg-red-100 border-red-500 text-red-800' },
  { value: 'expand',  label: 'Expand', desc: 'Worked well — scale to more patients or sites', color: 'bg-blue-100 border-blue-500 text-blue-800' },
]

function readinessScore(scores: Record<string, ReadinessScore>, total: number) {
  let pts = 0, answered = 0
  Object.values(scores).forEach(s => {
    if (s === 'yes')    { pts += 1; answered++ }
    if (s === 'partly') { pts += 0.5; answered++ }
    if (s === 'no')     { answered++ }
  })
  if (answered === 0) return { pct: 0, profile: null as null | string, answered }
  const pct = (pts / total) * 100
  const profile = pct >= 80 ? 'ready' : pct >= 50 ? 'mostly' : 'not-ready'
  return { pct, profile, answered }
}

function visibleBarriers(card: ChangeCard, team: TeamType | null) {
  const result: { cat: string; barriers: typeof card.barriers[string] }[] = []
  for (const [cat, barriers] of Object.entries(card.barriers)) {
    const filtered = barriers.filter(b => !team || !b.hideFor?.includes(team))
    if (filtered.length) result.push({ cat, barriers: filtered })
  }
  return result
}

function autoSelectedBarriers(card: ChangeCard, team: TeamType | null): string[] {
  if (!team) return []
  const auto: string[] = []
  for (const barriers of Object.values(card.barriers)) {
    barriers.forEach(b => { if (b.autoFor?.includes(team)) auto.push(b.id) })
  }
  return auto
}

function derivedStrategies(card: ChangeCard, selectedBarriers: string[]) {
  const nums = new Set<number>()
  for (const barriers of Object.values(card.barriers)) {
    barriers.forEach(b => { if (selectedBarriers.includes(b.id)) b.strategies.forEach(s => nums.add(s)) })
  }
  return [...nums].sort().map(n => ({ num: n, ...card.strategies[n] }))
}

function reliability(visitStatuses: Record<number, VisitStatus>, total: number) {
  let completed = 0, na = 0
  for (let i = 1; i <= total; i++) {
    const s = visitStatuses[i]
    if (s === 'completed') completed++
    if (s === 'na') na++
  }
  const denom = total - na
  return denom > 0 ? Math.round((completed / denom) * 100) : 0
}

export default function ChangeCardApp({ card }: Props) {
  const [state, setState] = useState<ChangeCardState>({
    currentPhase: 'assess',
    phasesCompleted: [],
    teamComposition: null,
    readinessScores: {},
    selectedBarriers: [],
    currentWorkflow: '',
    aimStatement: '',
    pdsa: { what: '', who: '', whoReview: '', patientCount: 0, timeframe: '', predict: '' },
    visitStatuses: {},
    study: { worked: '', surprised: '', newBarriers: '' },
    actDecision: null,
    actNotes: '',
    sustainChecks: {},
    selectedThreats: [],
  })

  const set = (patch: Partial<ChangeCardState>) => setState(s => ({ ...s, ...patch }))

  // derived
  const { pct: rPct, profile: rProfile, answered: rAnswered } = readinessScore(state.readinessScores, card.readiness.length)
  const allReadinessAnswered = rAnswered === card.readiness.length
  const visBarriers = useMemo(() => visibleBarriers(card, state.teamComposition), [card, state.teamComposition])
  const autoIds = useMemo(() => autoSelectedBarriers(card, state.teamComposition), [card, state.teamComposition])
  const strategies = useMemo(() => derivedStrategies(card, state.selectedBarriers), [card, state.selectedBarriers])
  const pcInfo = state.teamComposition ? card.patientCounts[state.teamComposition] : card.patientCounts.other
  const visitCount = state.pdsa.patientCount || pcInfo.suggested
  const rel = reliability(state.visitStatuses, visitCount)

  function selectTeam(team: TeamType) {
    const auto = autoSelectedBarriers(card, team)
    set({ teamComposition: team, selectedBarriers: auto })
  }

  function toggleBarrier(id: string) {
    const auto = autoIds
    if (auto.includes(id)) return // can't deselect auto barriers
    setState(s => {
      const sel = s.selectedBarriers
      if (sel.includes(id)) return { ...s, selectedBarriers: sel.filter(x => x !== id) }
      if (sel.length >= 3) return s
      return { ...s, selectedBarriers: [...sel, id] }
    })
  }

  function scoreReadiness(id: string, val: ReadinessScore) {
    setState(s => ({ ...s, readinessScores: { ...s.readinessScores, [id]: val } }))
  }

  function completeAssess() {
    if (state.selectedBarriers.length < 1) return
    set({ currentPhase: 'plan', phasesCompleted: [...state.phasesCompleted, 'assess'] })
    if (!state.aimStatement) {
      const team = state.teamComposition
      let who = 'our team'
      if (team === 'solo') who = 'I'
      else if (team === 'admin') who = 'myself and my admin support'
      set({ aimStatement: `By [date], ${who} will complete pre-visit planning for [X]% of eligible visits, reducing care gaps by [Y]%.` })
    }
  }

  function completePlan() {
    if (!state.pdsa.what || !state.pdsa.who) return
    const pc = state.teamComposition ? card.patientCounts[state.teamComposition] : card.patientCounts.other
    setState(s => ({
      ...s,
      currentPhase: 'test',
      phasesCompleted: [...s.phasesCompleted, 'plan'],
      pdsa: { ...s.pdsa, patientCount: s.pdsa.patientCount || pc.suggested },
    }))
  }

  function completeTest() {
    if (!state.actDecision) return
    set({ currentPhase: 'sustain', phasesCompleted: [...state.phasesCompleted, 'test'] })
  }

  function toggleThreat(id: string) {
    setState(s => ({
      ...s,
      selectedThreats: s.selectedThreats.includes(id)
        ? s.selectedThreats.filter(x => x !== id)
        : [...s.selectedThreats, id],
    }))
  }

  const PHASES: { id: Phase; label: string; num: number }[] = [
    { id: 'assess',  label: 'Assess',  num: 1 },
    { id: 'plan',    label: 'Plan',    num: 2 },
    { id: 'test',    label: 'Test',    num: 3 },
    { id: 'sustain', label: 'Sustain', num: 4 },
  ]

  function isUnlocked(phase: Phase) {
    if (phase === 'assess') return true
    const order: Phase[] = ['assess', 'plan', 'test', 'sustain']
    const idx = order.indexOf(phase)
    return state.phasesCompleted.includes(order[idx - 1])
  }

  return (
    <div className="max-w-[860px]">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-[#5a7f5a] mb-1">{card.ccmComponent}</div>
        <h1 className="font-serif text-2xl text-[#1a3a1a] mb-1">{card.name}</h1>
        <p className="text-sm text-[#555]">{card.changeConcept}</p>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-0 mb-8 border border-[#c8d8c8] rounded-lg overflow-hidden">
        {PHASES.map(p => {
          const unlocked = isUnlocked(p.id)
          const completed = state.phasesCompleted.includes(p.id)
          const active = state.currentPhase === p.id
          return (
            <button
              key={p.id}
              onClick={() => unlocked && set({ currentPhase: p.id })}
              disabled={!unlocked}
              className={`flex-1 py-3 text-sm font-medium border-r last:border-r-0 border-[#c8d8c8] transition-all ${
                active
                  ? 'bg-[#2d5a2d] text-white'
                  : completed
                  ? 'bg-[#e8f5e8] text-[#2d5a2d]'
                  : unlocked
                  ? 'bg-white text-[#555] hover:bg-[#f5faf5]'
                  : 'bg-[#f5f5f5] text-[#aaa] cursor-not-allowed'
              }`}
            >
              <span className="mr-1.5">{completed && !active ? '✓' : p.num + '.'}</span>
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Assess Phase */}
      {state.currentPhase === 'assess' && (
        <div className="space-y-6">
          {/* Team composition */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">Team composition</h2>
            <p className="text-sm text-[#666] mb-4">Select the option that best describes your practice context. This determines which barriers are relevant and the recommended starting patient count.</p>
            <div className="grid grid-cols-2 gap-3">
              {TEAM_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => selectTeam(opt.value)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    state.teamComposition === opt.value
                      ? 'border-[#2d5a2d] bg-[#e8f5e8]'
                      : 'border-[#ddd] hover:border-[#9ab89a]'
                  }`}
                >
                  <div className="font-medium text-sm text-[#1a3a1a]">{opt.label}</div>
                  <div className="text-xs text-[#666] mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Readiness */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">Readiness check</h2>
            <p className="text-sm text-[#666] mb-4">Score each prerequisite to understand your starting position.</p>
            <div className="space-y-2">
              {card.readiness.map(item => {
                const score = state.readinessScores[item.id]
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-[#e8e8e8] rounded-lg bg-[#fafafa]">
                    <div className="flex-1 text-sm text-[#333] leading-snug">{item.text}</div>
                    <div className="flex gap-1 shrink-0">
                      {(['yes', 'partly', 'no'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => scoreReadiness(item.id, v)}
                          className={`px-3 py-1 text-xs font-semibold rounded border-2 transition-all ${
                            score === v
                              ? v === 'yes'    ? 'bg-green-100 border-green-500 text-green-800'
                              : v === 'partly' ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                              :                  'bg-red-100 border-red-500 text-red-800'
                              : 'bg-white border-[#ddd] text-[#555] hover:border-[#999]'
                          }`}
                        >
                          {v === 'yes' ? 'Yes' : v === 'partly' ? 'Partly' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            {allReadinessAnswered && (
              <div className={`mt-4 p-3 rounded-lg border ${
                rProfile === 'ready'     ? 'bg-green-50 border-green-300'
                : rProfile === 'mostly'  ? 'bg-yellow-50 border-yellow-300'
                :                          'bg-red-50 border-red-300'
              }`}>
                <span className="font-medium text-sm">
                  Readiness: {Math.round(rPct)}% —{' '}
                  {rProfile === 'ready' ? 'Ready to proceed' : rProfile === 'mostly' ? 'Mostly ready — note gaps' : 'Significant gaps — plan accordingly'}
                </span>
              </div>
            )}
          </div>

          {/* Barriers */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">Barrier selection</h2>
            <p className="text-sm text-[#666] mb-4">
              Select up to <strong>3 barriers</strong> to address in your first PDSA cycle.
              {state.selectedBarriers.length >= 3 && <span className="text-[#c47a00]"> Maximum reached.</span>}
            </p>
            {visBarriers.map(({ cat, barriers }) => (
              <div key={cat} className="mb-4">
                <div className="text-xs uppercase tracking-widest text-[#5a7f5a] mb-2">{cat}</div>
                <div className="space-y-1.5">
                  {barriers.map(b => {
                    const isAuto = autoIds.includes(b.id)
                    const isSelected = state.selectedBarriers.includes(b.id)
                    const isDisabled = !isSelected && state.selectedBarriers.length >= 3
                    return (
                      <button
                        key={b.id}
                        onClick={() => toggleBarrier(b.id)}
                        disabled={isDisabled && !isAuto}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border-2 text-sm transition-all flex items-start gap-2 ${
                          isSelected
                            ? 'border-[#2d5a2d] bg-[#e8f5e8] text-[#1a3a1a]'
                            : isDisabled
                            ? 'border-[#eee] bg-[#fafafa] text-[#aaa] cursor-not-allowed'
                            : 'border-[#ddd] hover:border-[#9ab89a] text-[#333]'
                        }`}
                      >
                        <span className={`w-4 h-4 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#2d5a2d] bg-[#2d5a2d]' : 'border-[#ccc]'
                        }`}>
                          {isSelected && <span className="text-white text-[10px]">✓</span>}
                        </span>
                        <span className="flex-1">{b.text}</span>
                        {isAuto && <span className="text-[10px] bg-[#c8d8c8] text-[#2d5a2d] px-1.5 py-0.5 rounded shrink-0 mt-0.5">auto</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Current workflow */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">Current workflow</h2>
            <p className="text-sm text-[#666] mb-3">Briefly describe how visits happen now — before any PVP change. This becomes your baseline.</p>
            <textarea
              value={state.currentWorkflow}
              onChange={e => set({ currentWorkflow: e.target.value })}
              rows={3}
              placeholder="e.g. Chart is pulled by front desk morning of visit. Provider reviews while patient is in waiting room..."
              className="w-full border border-[#ddd] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#2d5a2d]"
            />
          </div>

          <button
            onClick={completeAssess}
            disabled={state.selectedBarriers.length < 1}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
              state.selectedBarriers.length >= 1
                ? 'bg-[#2d5a2d] text-white hover:bg-[#1a3a1a]'
                : 'bg-[#ddd] text-[#999] cursor-not-allowed'
            }`}
          >
            Continue to Plan →
          </button>
        </div>
      )}

      {/* Plan Phase */}
      {state.currentPhase === 'plan' && (
        <div className="space-y-6">
          {/* Strategies */}
          {strategies.length > 0 && (
            <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
              <h2 className="font-semibold text-[#1a3a1a] mb-1">Recommended strategies</h2>
              <p className="text-sm text-[#666] mb-4">Based on your selected barriers, these strategies will help.</p>
              <div className="space-y-3">
                {strategies.map(s => (
                  <div key={s.num} className="flex gap-3 p-3 bg-[#f5faf5] border border-[#c8d8c8] rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-[#2d5a2d] text-white flex items-center justify-center text-xs font-bold shrink-0">{s.num}</div>
                    <div>
                      <div className="font-medium text-sm text-[#1a3a1a]">{s.name}</div>
                      <div className="text-xs text-[#666] mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aim statement */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">Aim statement</h2>
            <p className="text-sm text-[#666] mb-3">Edit the template to match your specific targets.</p>
            <textarea
              value={state.aimStatement}
              onChange={e => set({ aimStatement: e.target.value })}
              rows={3}
              className="w-full border border-[#ddd] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#2d5a2d]"
            />
          </div>

          {/* PDSA Plan card */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">PDSA plan</h2>
            <p className="text-sm text-[#666] mb-4">Based on the PVP Change Concept Card — adapt to your context.</p>

            {/* Action steps */}
            <div className="mb-4 p-3 bg-[#f5faf5] border border-[#c8d8c8] rounded-lg">
              <div className="text-xs uppercase tracking-widest text-[#5a7f5a] mb-2">Card action steps</div>
              {card.firstPDSA.actionSteps.map((step, i) => (
                <div key={i} className="flex gap-2 text-sm text-[#333] mb-1">
                  <span className="font-semibold text-[#2d5a2d] shrink-0">{i + 1}.</span>
                  {step}
                </div>
              ))}
              {(state.teamComposition === 'solo' || state.teamComposition === 'admin') && (
                <div className="mt-2 pt-2 border-t border-[#c8d8c8] text-xs text-[#555]">
                  {state.teamComposition === 'solo' ? card.firstPDSA.soloVariant : card.firstPDSA.adminVariant}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">What will you test?</label>
                <textarea
                  value={state.pdsa.what}
                  onChange={e => setState(s => ({ ...s, pdsa: { ...s.pdsa, what: e.target.value } }))}
                  rows={2}
                  placeholder="Describe the specific change you'll test..."
                  className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:border-[#2d5a2d]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Who does PVP prep?</label>
                  <input
                    type="text"
                    value={state.pdsa.who}
                    onChange={e => setState(s => ({ ...s, pdsa: { ...s.pdsa, who: e.target.value } }))}
                    placeholder="e.g. Medical assistant"
                    className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#2d5a2d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Who reviews?</label>
                  <input
                    type="text"
                    value={state.pdsa.whoReview}
                    onChange={e => setState(s => ({ ...s, pdsa: { ...s.pdsa, whoReview: e.target.value } }))}
                    placeholder="e.g. Provider"
                    className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#2d5a2d]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">
                    Patient count <span className="text-[#999] font-normal">(suggested: {pcInfo.range})</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={state.pdsa.patientCount || pcInfo.suggested}
                    onChange={e => setState(s => ({ ...s, pdsa: { ...s.pdsa, patientCount: parseInt(e.target.value) || 0 } }))}
                    className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#2d5a2d]"
                  />
                  <div className="text-xs text-[#666] mt-1">{pcInfo.hint}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Timeframe</label>
                  <input
                    type="text"
                    value={state.pdsa.timeframe}
                    onChange={e => setState(s => ({ ...s, pdsa: { ...s.pdsa, timeframe: e.target.value } }))}
                    placeholder="e.g. 2 weeks, starting Mon"
                    className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#2d5a2d]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">Prediction — what do you expect?</label>
                <textarea
                  value={state.pdsa.predict}
                  onChange={e => setState(s => ({ ...s, pdsa: { ...s.pdsa, predict: e.target.value } }))}
                  rows={2}
                  placeholder="e.g. We predict PVP will reduce care gaps by 20% but prep time will exceed 10 min..."
                  className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:border-[#2d5a2d]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={completePlan}
            disabled={!state.pdsa.what || !state.pdsa.who}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
              state.pdsa.what && state.pdsa.who
                ? 'bg-[#2d5a2d] text-white hover:bg-[#1a3a1a]'
                : 'bg-[#ddd] text-[#999] cursor-not-allowed'
            }`}
          >
            Start Testing →
          </button>
        </div>
      )}

      {/* Test Phase */}
      {state.currentPhase === 'test' && (
        <div className="space-y-6">
          {/* Visit tracker */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-[#1a3a1a]">Visit tracker</h2>
              <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                rel >= 80 ? 'bg-green-100 text-green-800' : rel >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                Reliability: {rel}%
              </div>
            </div>
            <p className="text-sm text-[#666] mb-4">Track PVP completion for each visit.</p>
            <div className="space-y-2">
              {Array.from({ length: visitCount }, (_, i) => i + 1).map(n => {
                const status = state.visitStatuses[n]
                return (
                  <div key={n} className="flex items-center gap-3 p-2.5 border border-[#e8e8e8] rounded-lg">
                    <span className="text-sm font-medium text-[#555] w-16 shrink-0">Visit {n}</span>
                    <div className="flex gap-1.5">
                      {(['completed', 'partial', 'skipped', 'na'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setState(st => ({ ...st, visitStatuses: { ...st.visitStatuses, [n]: st.visitStatuses[n] === s ? null : s } }))}
                          className={`px-2.5 py-1 text-xs font-medium rounded border transition-all ${
                            status === s
                              ? s === 'completed' ? 'bg-green-100 border-green-500 text-green-800'
                              : s === 'partial'   ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                              : s === 'skipped'   ? 'bg-red-100 border-red-500 text-red-800'
                              :                     'bg-gray-100 border-gray-400 text-gray-600'
                              : 'bg-white border-[#ddd] text-[#555] hover:border-[#999]'
                          }`}
                        >
                          {s === 'na' ? 'N/A' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Study */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-4">Study — what did you learn?</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">What worked?</label>
                <textarea
                  value={state.study.worked}
                  onChange={e => setState(s => ({ ...s, study: { ...s.study, worked: e.target.value } }))}
                  rows={2}
                  placeholder="What went as planned or better than expected?"
                  className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:border-[#2d5a2d]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">What surprised you?</label>
                <textarea
                  value={state.study.surprised}
                  onChange={e => setState(s => ({ ...s, study: { ...s.study, surprised: e.target.value } }))}
                  rows={2}
                  placeholder="What was harder than expected? What barriers appeared that you didn't anticipate?"
                  className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:border-[#2d5a2d]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#444] mb-1">Discovered barriers</label>
                <div className="text-xs text-[#888] mb-1">New barriers feed into your next cycle.</div>
                <textarea
                  value={state.study.newBarriers}
                  onChange={e => setState(s => ({ ...s, study: { ...s.study, newBarriers: e.target.value } }))}
                  rows={2}
                  placeholder="Any new obstacles you discovered during testing?"
                  className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:border-[#2d5a2d]"
                />
              </div>
            </div>
          </div>

          {/* Act */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">Act — what's next?</h2>
            <p className="text-sm text-[#666] mb-4">Based on reliability ({rel}%) and what you learned:</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {ACT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set({ actDecision: opt.value })}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    state.actDecision === opt.value ? opt.color + ' border-current' : 'border-[#ddd] hover:border-[#999]'
                  }`}
                >
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs mt-0.5 text-[#555]">{opt.desc}</div>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1">Notes on your decision</label>
              <textarea
                value={state.actNotes}
                onChange={e => set({ actNotes: e.target.value })}
                rows={2}
                placeholder="What will you change or carry forward?"
                className="w-full border border-[#ddd] rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:border-[#2d5a2d]"
              />
            </div>
          </div>

          <button
            onClick={completeTest}
            disabled={!state.actDecision}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
              state.actDecision
                ? 'bg-[#2d5a2d] text-white hover:bg-[#1a3a1a]'
                : 'bg-[#ddd] text-[#999] cursor-not-allowed'
            }`}
          >
            Continue to Sustain →
          </button>
        </div>
      )}

      {/* Sustain Phase */}
      {state.currentPhase === 'sustain' && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-4">Progress summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#f5faf5] border border-[#c8d8c8] rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2d5a2d]">{rel}%</div>
                <div className="text-xs text-[#666] mt-1">Visit reliability</div>
              </div>
              <div className="p-4 bg-[#f5faf5] border border-[#c8d8c8] rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2d5a2d]">{visitCount}</div>
                <div className="text-xs text-[#666] mt-1">Patients tested</div>
              </div>
              <div className="p-4 bg-[#f5faf5] border border-[#c8d8c8] rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2d5a2d]">{state.selectedBarriers.length}</div>
                <div className="text-xs text-[#666] mt-1">Barriers addressed</div>
              </div>
              <div className="p-4 bg-[#f5faf5] border border-[#c8d8c8] rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2d5a2d] capitalize">{state.actDecision ?? '—'}</div>
                <div className="text-xs text-[#666] mt-1">Act decision</div>
              </div>
            </div>
          </div>

          {/* Sustainability checklist */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">Sustainability checklist</h2>
            <p className="text-sm text-[#666] mb-4">Complete these steps to protect the change you made.</p>
            <div className="space-y-2">
              {card.sustainabilityChecklist.map((item, i) => (
                <label key={i} className="flex items-start gap-3 p-3 border border-[#e8e8e8] rounded-lg cursor-pointer hover:bg-[#fafafa]">
                  <input
                    type="checkbox"
                    checked={!!state.sustainChecks[i]}
                    onChange={e => setState(s => ({ ...s, sustainChecks: { ...s.sustainChecks, [i]: e.target.checked } }))}
                    className="mt-0.5 accent-[#2d5a2d]"
                  />
                  <span className={`text-sm ${state.sustainChecks[i] ? 'line-through text-[#999]' : 'text-[#333]'}`}>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Threats */}
          <div className="bg-white border border-[#c8d8c8] rounded-xl p-6">
            <h2 className="font-semibold text-[#1a3a1a] mb-1">Sustainability threats</h2>
            <p className="text-sm text-[#666] mb-4">Select any threats that apply — they become your monitoring focus.</p>
            <div className="space-y-1.5">
              {card.sustainabilityThreats.map(t => {
                const sel = state.selectedThreats.includes(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleThreat(t.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border-2 text-sm transition-all flex items-start gap-2 ${
                      sel ? 'border-[#c47a00] bg-yellow-50 text-[#7a4a00]' : 'border-[#ddd] hover:border-[#c47a00] text-[#333]'
                    }`}
                  >
                    <span className={`w-4 h-4 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center ${
                      sel ? 'border-[#c47a00] bg-[#c47a00]' : 'border-[#ccc]'
                    }`}>
                      {sel && <span className="text-white text-[10px]">✓</span>}
                    </span>
                    {t.text}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-[#e8f5e8] border border-[#9ab89a] rounded-xl p-5 text-center">
            <div className="text-lg font-semibold text-[#1a3a1a] mb-1">PDSA cycle complete</div>
            <p className="text-sm text-[#2d5a2d]">Your findings are ready to share with the BAN network. Start a new cycle to continue improving.</p>
          </div>
        </div>
      )}
    </div>
  )
}
