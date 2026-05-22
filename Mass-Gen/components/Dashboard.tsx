'use client'
import { useEffect, useState } from 'react'
import { DEMO_SITE_ROLLUPS, type AuthSession } from '@/data/demoAccounts'
import { phases } from '@/data/phases'

interface Props {
  checks: Record<string, boolean>
  session: AuthSession
}

const PHASE_NAMES = ['Joining', 'Training', 'Registering', 'Activation']

export default function Dashboard({ checks, session }: Props) {
  const [view, setView] = useState<'site' | 'ban'>(session.role === 'ban' ? 'ban' : 'site')
  const showBan = session.role === 'ban'

  useEffect(() => {
    setView(session.role === 'ban' ? 'ban' : 'site')
  }, [session.role])

  let done = 0, tot = 0
  let curPh = 'Joining'
  const phaseStats = phases.map((p, pi) => {
    let pd = 0, pt = 0
    p.groups.forEach(g => g.tasks.forEach((_, ti) => {
      tot++; pt++
      if (checks[`${pi}-${g.lbl}-${ti}`]) { done++; pd++ }
    }))
    if (pd === pt && pt > 0) curPh = PHASE_NAMES[Math.min(pi + 1, 3)]
    return { name: PHASE_NAMES[pi], done: pd, total: pt }
  })

  const pct = tot ? Math.round(done / tot * 100) : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Progress dashboard</h1>
        <p className="text-gray-600-ban leading-relaxed">
          Track onboarding progress for {session.role === 'ban' ? 'the network demo' : session.siteName}.
        </p>
      </div>

      {/* Toggle (BAN-internal only). */}
      {showBan && (
        <div className="flex gap-2 mb-6">
          {(['site', 'ban'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-[13px] rounded-lg font-medium transition-all ${
                view === v
                  ? 'bg-green-deep text-white'
                  : 'bg-white border border-gray-200-ban text-gray-600-ban hover:border-green-mid'
              }`}
            >
              {v === 'site' ? 'Site view' : 'BAN team view'}
            </button>
          ))}
        </div>
      )}

      {(!showBan || view === 'site') && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { num: done,    lbl: 'Tasks completed' },
              { num: tot,     lbl: 'Total tasks' },
              { num: curPh,   lbl: 'Current phase' },
              { num: `${pct}%`, lbl: 'Overall progress' },
            ].map(s => (
              <div key={s.lbl} className="bg-white rounded-[10px] border border-gray-200-ban p-5 text-center">
                <div className="font-serif text-3xl text-green-deep mb-1">{s.num}</div>
                <div className="text-[11px] text-gray-400-ban uppercase tracking-wider">{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Phase progress bars */}
          <div className="bg-white rounded-[10px] border border-gray-200-ban p-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-5">Phase progress</div>
            <div className="space-y-4">
              {phaseStats.map(ph => {
                const p = ph.total ? Math.round(ph.done / ph.total * 100) : 0
                return (
                  <div key={ph.name}>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="text-gray-900-ban font-medium">{ph.name}</span>
                      <span className="text-gray-400-ban">{ph.done}/{ph.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100-ban rounded-full overflow-hidden">
                      <div className="pbar-fill" style={{ width: `${p}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showBan && view === 'ban' && (
        <div className="bg-white rounded-[10px] border border-gray-200-ban p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-4">Active sites</div>
          <div className="space-y-4">
            {DEMO_SITE_ROLLUPS.map(site => (
              <div key={site.n} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="font-medium text-gray-900-ban">{site.n}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${site.pc}`}>{site.ph}</span>
                  </div>
                  <div className="h-2 bg-gray-100-ban rounded-full overflow-hidden">
                    <div className="pbar-fill" style={{ width: `${site.pct}%` }} />
                  </div>
                </div>
                <span className="text-[12px] text-gray-400-ban w-8 text-right">{site.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
