'use client'
import { useMemo } from 'react'
import { foundationalModules, findModule } from '@/data/modules'
import {
  measures,
  measuresForModule,
  statusFor,
  STATUS_LABEL,
  STATUS_COLOR,
  type Measure,
  type MeasureStatus,
} from '@/data/measures'

const MODULE_ORDER = foundationalModules.map(m => m.id)

export default function MeasurementPage() {
  // Rollup counts by status, across all measures
  const rollup = useMemo(() => {
    const counts: Record<MeasureStatus, number> = {
      on_target: 0, progressing: 0, lagging: 0, not_started: 0, flat: 0,
    }
    measures.forEach(m => { counts[statusFor(m)]++ })
    return counts
  }, [])

  // Group measures by module, in canonical module order
  const byModule = useMemo(() => {
    return MODULE_ORDER
      .map(mid => ({ module: findModule(mid)!, list: measuresForModule(mid) }))
      .filter(g => g.list.length > 0)
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Measurement</h1>
        <p className="text-gray-600-ban leading-relaxed max-w-[640px]">
          The Platform layer&apos;s measurement framework. Each module declares its measures (clinical, operational, or process). Numbers below are <em>placeholder</em> demo data — replace with your site&apos;s real values from Phlox / chart audit / revenue cycle data.
        </p>
      </div>

      {/* Rollup */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {([
          { k: 'on_target',   lbl: 'On target' },
          { k: 'progressing', lbl: 'Progressing' },
          { k: 'lagging',     lbl: 'Lagging' },
          { k: 'flat',        lbl: 'Flat' },
          { k: 'not_started', lbl: 'Not started' },
        ] as { k: MeasureStatus; lbl: string }[]).map(({ k, lbl }) => (
          <div key={k} className="bg-white border border-gray-200-ban rounded-[10px] p-4 text-center">
            <div className="font-serif text-3xl text-green-deep mb-1">{rollup[k]}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400-ban">{lbl}</div>
          </div>
        ))}
      </div>

      {/* By module */}
      <div className="space-y-4">
        {byModule.map(({ module, list }) => (
          <div key={module.id} className="bg-white border border-gray-200-ban rounded-[10px] overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100-ban flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban">
                  {module.kind === 'operational' ? 'Operational' : 'Clinical'}
                </div>
                <div className="font-medium text-[14px] text-gray-900-ban">{module.name}</div>
              </div>
              <div className="text-[11px] text-gray-400-ban">{list.length} measure{list.length === 1 ? '' : 's'}</div>
            </div>
            <div>
              {list.map(m => <MeasureRow key={m.id} m={m} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-gray-400-ban italic mt-6 text-center">
        Measure schema lives in <code>data/measures.ts</code>. Network configurations supply their own measure set.
      </div>
    </div>
  )
}

function MeasureRow({ m }: { m: Measure }) {
  const status = statusFor(m)
  const lowerBetter = m.target === 0 && m.unit === 'days'
  const pct = lowerBetter
    ? Math.max(0, Math.min(100, 100 - (m.current / 90) * 100))  // arbitrary 90-day window for visualization
    : Math.max(0, Math.min(100, (m.current / Math.max(m.target, 1)) * 100))

  const trendIcon = m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : m.trend === 'flat' ? '→' : '·'
  const trendColor = m.trend === 'up' ? 'text-green-deep'
    : m.trend === 'down' ? 'text-red-mid'
    : m.trend === 'flat' ? 'text-amber-ban'
    : 'text-gray-400-ban'

  return (
    <div className="px-5 py-3 border-b border-gray-100-ban last:border-0">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex-1">
          <div className="font-medium text-[13px] text-gray-900-ban">{m.name}</div>
          {m.description && <div className="text-[11px] text-gray-600-ban leading-snug mt-0.5">{m.description}</div>}
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-1.5 bg-gray-100-ban rounded-full overflow-hidden">
            <div className="h-full bg-green-mid" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="text-[12px] text-gray-700 tabular-nums">
          <span className="font-semibold text-gray-900-ban">{m.current}</span>
          <span className="text-gray-400-ban"> / {lowerBetter ? '↓' : m.target} {m.unit}</span>
        </div>
        <div className={`text-[14px] ${trendColor} tabular-nums w-4 text-center`} title={`Trend: ${m.trend}`}>
          {trendIcon}
        </div>
      </div>
      {(m.baseline !== undefined || m.source) && (
        <div className="text-[10px] text-gray-400-ban mt-1">
          {m.baseline !== undefined && <>Baseline {m.baseline} {m.unit} · </>}
          {m.source && <>Source: {m.source} · </>}
          {m.type}
        </div>
      )}
    </div>
  )
}
