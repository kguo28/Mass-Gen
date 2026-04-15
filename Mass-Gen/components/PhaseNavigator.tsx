'use client'
import { useState } from 'react'
import { phases } from '@/data/phases'

const TAG_LABELS: Record<string, string> = {
  tl: 'Legal', ti: 'IRB', tt: 'IT/Data', tf: 'Finance', tm: 'Team', tb: 'BAN',
}

interface Props {
  checks: Record<string, boolean>
  setChecks: (v: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void
}

function getBadge(pi: number, checks: Record<string, boolean>) {
  const p = phases[pi]
  let done = 0, tot = 0
  p.groups.forEach(g => g.tasks.forEach((_, ti) => {
    tot++
    if (checks[`${pi}-${g.lbl}-${ti}`]) done++
  }))
  return `${done}/${tot}`
}

export default function PhaseNavigator({ checks, setChecks }: Props) {
  const [activePhase, setActivePhase] = useState(0)
  const p = phases[activePhase]

  function toggle(key: string) {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Your onboarding journey</h1>
        <p className="text-gray-600-ban leading-relaxed">
          BAN onboarding moves through four phases: Joining, Training, Registering, and Activation. These phases are flexible and can overlap. Check off tasks as you complete them — progress is shared with the BAN team.
        </p>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-200-ban">
        {phases.map((ph, pi) => (
          <button
            key={pi}
            onClick={() => setActivePhase(pi)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-all ${
              activePhase === pi
                ? 'border-green-mid text-green-deep'
                : 'border-transparent text-gray-400-ban hover:text-gray-600-ban'
            }`}
          >
            {ph.name}{' '}
            <span className={`text-[11px] px-1.5 py-0.5 rounded ml-1 ${
              activePhase === pi ? 'bg-green-pale text-green-deep' : 'bg-gray-100-ban text-gray-400-ban'
            }`}>
              {getBadge(pi, checks)}
            </span>
          </button>
        ))}
      </div>

      {/* Phase content */}
      <div className="bg-white rounded-[10px] border border-gray-200-ban p-6">
        <div
          className="text-[13px] text-gray-600-ban leading-relaxed mb-6 pb-6 border-b border-gray-100-ban"
          dangerouslySetInnerHTML={{ __html: p.intro }}
        />

        {p.groups.map(group => (
          <div key={group.lbl} className="mb-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-3">{group.lbl}</div>
            {group.tasks.map((task, ti) => {
              const key = `${activePhase}-${group.lbl}-${ti}`
              const done = !!checks[key]
              return (
                <div key={ti} className="flex gap-3 mb-3">
                  <button
                    onClick={() => toggle(key)}
                    className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border text-[11px] transition-all ${
                      done
                        ? 'bg-green-mid border-green-mid text-white'
                        : 'border-gray-200-ban hover:border-green-mid'
                    }`}
                  >
                    {done ? '✓' : ''}
                  </button>
                  <div>
                    <div className={`text-[13px] leading-snug mb-1 ${done ? 'line-through text-gray-400-ban' : 'text-gray-900-ban'}`}>
                      {task.t}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-gray-400-ban">
                      {task.tags.map(tag => (
                        <span key={tag} className={`tag ${tag}`}>{TAG_LABELS[tag] || tag}</span>
                      ))}
                      {task.meta && <span>{task.meta}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
