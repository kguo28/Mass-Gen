'use client'
import { useEffect, useState } from 'react'
import type { AuthSession } from '@/data/demoAccounts'
import { phases } from '@/data/phases'

interface Props {
  checks: Record<string, boolean>
  session: AuthSession
}

const PHASE_NAMES = ['Joining', 'Training', 'Registering', 'Activation']

interface AdminSite {
  siteId: string
  siteName: string
  phase: string
  phaseClass: string
  checklistDone: number
  checklistTotal: number
  checklistPct: number
  arcCompleted: boolean
  readinessComplete: boolean
  selectedModules: string[]
  moduleInputCount: number
  lastActivityAt: string | null
}

interface AdminAnalytics {
  sites: AdminSite[]
  totals: {
    totalSites: number
    readinessComplete: number
    arcComplete: number
    moduleInputs: number
    averageChecklistPct: number
  }
}

function formatDate(value: string | null) {
  if (!value) return 'No activity yet'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function Dashboard({ checks, session }: Props) {
  const [view, setView] = useState<'site' | 'ban'>(session.role === 'ban' ? 'ban' : 'site')
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const showBan = session.role === 'ban'

  useEffect(() => {
    setView(session.role === 'ban' ? 'ban' : 'site')
  }, [session.role])

  useEffect(() => {
    if (session.role !== 'ban') return
    fetch('/api/admin/analytics', {
      headers: { 'x-ban-session': session.sessionToken },
    })
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (payload?.sites && payload?.totals) setAnalytics(payload)
      })
      .catch(() => {})
  }, [session.role, session.sessionToken])

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
        <div>
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { num: analytics?.totals.totalSites ?? '—', lbl: 'Sites' },
              { num: analytics?.totals.readinessComplete ?? '—', lbl: 'Readiness done' },
              { num: analytics?.totals.arcComplete ?? '—', lbl: 'Arc complete' },
              { num: analytics?.totals.moduleInputs ?? '—', lbl: 'Module inputs' },
              { num: analytics ? `${analytics.totals.averageChecklistPct}%` : '—', lbl: 'Avg checklist' },
            ].map(s => (
              <div key={s.lbl} className="bg-white rounded-[10px] border border-gray-200-ban p-4 text-center">
                <div className="font-serif text-2xl text-green-deep mb-1">{s.num}</div>
                <div className="text-[10px] text-gray-400-ban uppercase tracking-wider">{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[10px] border border-gray-200-ban p-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-4">Active sites</div>
            {!analytics && (
              <div className="text-[13px] text-gray-400-ban">Loading network analytics…</div>
            )}
            {analytics && (
              <div className="space-y-4">
                {analytics.sites.map(site => (
                  <div key={site.siteId} className="border border-gray-100-ban rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="font-medium text-gray-900-ban">{site.siteName}</div>
                        <div className="text-[11px] text-gray-400-ban mt-0.5">
                          Last activity: {formatDate(site.lastActivityAt)}
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${site.phaseClass}`}>
                        {site.phase}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-[12px] mb-3">
                      <div>
                        <div className="text-gray-400-ban">Readiness</div>
                        <div className="font-medium text-gray-900-ban">{site.readinessComplete ? 'Complete' : 'Not started'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400-ban">Orientation</div>
                        <div className="font-medium text-gray-900-ban">{site.arcCompleted ? 'Complete' : 'In progress'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400-ban">Modules</div>
                        <div className="font-medium text-gray-900-ban">{site.selectedModules.length || 0} selected</div>
                      </div>
                      <div>
                        <div className="text-gray-400-ban">Inputs</div>
                        <div className="font-medium text-gray-900-ban">{site.moduleInputCount} saved</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100-ban rounded-full overflow-hidden">
                        <div className="pbar-fill" style={{ width: `${site.checklistPct}%` }} />
                      </div>
                      <span className="text-[12px] text-gray-400-ban w-20 text-right">
                        {site.checklistDone}/{site.checklistTotal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
