'use client'
import { useEffect, useMemo, useState } from 'react'
import type { PageId } from '@/app/page'
import { useTeamState } from '@/hooks/useTeamState'
import {
  readinessDomains,
  LEVEL_LABEL,
  buildSynthesis,
  READINESS_INTRO,
  type ReadinessLevel,
} from '@/data/readinessDomains'
import RangerPanel from './RangerPanel'

interface Props {
  setActivePage: (p: PageId) => void
}

const READINESS_RANGER_NOTES = [
  {
    title: 'Take this together',
    body: 'A 25-minute team conversation. One person captures answers. There are no wrong answers — Opening is a normal place to be.',
  },
  {
    title: 'What it produces',
    body: 'A short synthesis paragraph that the orientation arc uses to suggest where you might begin. You can revisit and re-take any time.',
  },
]

const LEVELS: ReadinessLevel[] = ['opening', 'building', 'strong']

export default function Readiness({ setActivePage }: Props) {
  const { state, update, hydrated } = useTeamState()

  const [answers, setAnswers] = useState<Record<string, ReadinessLevel | undefined>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // Seed from saved readiness on first hydration
  useEffect(() => {
    if (!hydrated) return
    if (state.readiness) {
      const a: Record<string, ReadinessLevel> = {}
      const n: Record<string, string> = {}
      Object.entries(state.readiness).forEach(([id, v]) => {
        a[id] = v.level
        if (v.notes) n[id] = v.notes
      })
      setAnswers(a)
      setNotes(n)
      setSubmitted(true)
    }
  }, [hydrated, state.readiness])

  const answered = useMemo(
    () => readinessDomains.filter(d => answers[d.id]).length,
    [answers],
  )
  const allAnswered = answered === readinessDomains.length

  function setLevel(id: string, lvl: ReadinessLevel) {
    setAnswers(prev => ({ ...prev, [id]: lvl }))
  }

  function setNote(id: string, txt: string) {
    setNotes(prev => ({ ...prev, [id]: txt }))
  }

  function submit() {
    if (!allAnswered) return
    const readiness: Record<string, { level: ReadinessLevel; notes?: string }> = {}
    readinessDomains.forEach(d => {
      readiness[d.id] = {
        level: answers[d.id]!,
        notes: notes[d.id]?.trim() || undefined,
      }
    })
    const levels: Record<string, ReadinessLevel> = {}
    Object.entries(readiness).forEach(([id, v]) => { levels[id] = v.level })
    const synthesis = buildSynthesis(levels, notes)
    update({ readiness, synthesis, arcStep: 1 })
    setSubmitted(true)
  }

  if (!hydrated) return <div className="text-[13px] text-gray-400-ban">Loading…</div>

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-green-mid mb-1">
          Basecamp · before the orientation arc
        </div>
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Readiness check</h1>
        <p className="text-gray-600-ban leading-relaxed max-w-[640px]">{READINESS_INTRO}</p>
      </div>

      <div className="grid grid-cols-[1fr_240px] gap-5 items-start">
        <div className="space-y-4">
          {readinessDomains.map(d => (
            <div key={d.id} className="bg-white border border-gray-200-ban rounded-[10px] p-5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="font-medium text-[14px] text-gray-900-ban">{d.name}</div>
                {answers[d.id] && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-green-deep bg-green-pale px-2 py-0.5 rounded">
                    {LEVEL_LABEL[answers[d.id]!]}
                  </span>
                )}
              </div>
              <div className="text-[12px] text-gray-600-ban leading-relaxed mb-3">{d.prompt}</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {LEVELS.map(lvl => {
                  const picked = answers[d.id] === lvl
                  return (
                    <button
                      key={lvl}
                      onClick={() => setLevel(d.id, lvl)}
                      className={`text-left p-3 rounded-lg border text-[12px] leading-snug transition-all ${
                        picked
                          ? 'border-green-deep bg-green-pale text-gray-900-ban'
                          : 'border-gray-200-ban bg-white text-gray-600-ban hover:border-green-mid'
                      }`}
                    >
                      <div className="font-semibold text-[11px] uppercase tracking-wider text-green-deep mb-1">
                        {LEVEL_LABEL[lvl]}
                      </div>
                      {d.levels[lvl]}
                    </button>
                  )
                })}
              </div>
              <textarea
                value={notes[d.id] || ''}
                onChange={e => setNote(d.id, e.target.value)}
                placeholder="Optional notes for the team (e.g. specific context, who's involved)"
                className="w-full border border-gray-200-ban rounded-lg p-2.5 text-[12px] resize-none h-14 focus:outline-none focus:border-green-mid"
              />
            </div>
          ))}

          {submitted && state.synthesis && (
            <div className="bg-green-pale border border-green-light/40 rounded-[10px] p-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-green-deep mb-2">
                Your readiness profile (synthesis)
              </div>
              <div className="text-[13px] text-gray-900-ban leading-relaxed">{state.synthesis}</div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-[12px] text-gray-600-ban">
              {answered}/{readinessDomains.length} domains answered
            </div>
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={!allAnswered}
                className="bg-green-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitted ? 'Update profile' : 'Generate readiness profile'}
              </button>
              {submitted && (
                <button
                  onClick={() => setActivePage('arc1')}
                  className="bg-white border border-green-deep text-green-deep text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-pale transition-colors"
                >
                  Continue to orientation arc →
                </button>
              )}
            </div>
          </div>
        </div>

        <RangerPanel notes={READINESS_RANGER_NOTES} />
      </div>
    </div>
  )
}
