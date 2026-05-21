'use client'
import { useState } from 'react'
import { useTeamState } from '@/hooks/useTeamState'
import { regions, findRegion, type RegionId } from '@/data/regions'
import { crossCuttingThemes } from '@/data/crossCutting'

const TERRITORY_ORDER: RegionId[] = ['basecamp', 'provisioning', 'expedition', 'deep_terrain']

export default function TerritoryMap() {
  const { state, hydrated } = useTeamState()
  const [selected, setSelected] = useState<RegionId | null>(null)

  if (!hydrated) return <div className="text-[13px] text-gray-400-ban">Loading…</div>

  const current = state.region
  const newGround = findRegion('new_ground')
  const detail = selected ? findRegion(selected) : findRegion(current)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Territory map</h1>
        <p className="text-gray-600-ban leading-relaxed max-w-[640px]">
          The schema BAN modules and tools hang on. Your team moves through Basecamp into Provisioning, Expedition, and Deep terrain over time — innovation can branch into New ground from any region.
        </p>
      </div>

      {/* New ground — full-width band above */}
      <div
        onClick={() => setSelected('new_ground')}
        className={`bg-amber-pale border-2 rounded-[10px] p-5 mb-3 cursor-pointer transition-all ${
          (selected ?? current) === 'new_ground' ? 'border-amber-ban' : 'border-amber-ban/30 hover:border-amber-ban/60'
        }`}
      >
        <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-ban mb-1">
          {newGround.name}
        </div>
        <div className="font-medium text-[14px] text-gray-900-ban">{newGround.tagline}</div>
      </div>

      {/* Vertical dotted connectors visual hint */}
      <div className="text-center text-gray-400-ban text-[11px] tracking-wider mb-1">┊  ┊  ┊  ┊</div>

      {/* 4 main regions in a row */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-2 items-stretch mb-4">
        {TERRITORY_ORDER.map((rid, i) => {
          const r = findRegion(rid)
          const isCurrent = current === rid
          const isSelected = (selected ?? current) === rid
          return (
            <>
              <div
                key={rid}
                onClick={() => setSelected(rid)}
                className={`rounded-[10px] p-4 cursor-pointer transition-all border-2 ${
                  rid === 'basecamp'
                    ? isSelected
                      ? 'bg-gray-100-ban border-gray-400-ban'
                      : 'bg-gray-50-ban border-gray-200-ban hover:border-gray-400-ban'
                    : isSelected
                      ? 'bg-green-pale border-green-mid'
                      : 'bg-green-pale/40 border-green-light/40 hover:border-green-mid'
                }`}
              >
                <div className="text-[15px] font-semibold text-gray-900-ban">{r.name}</div>
                <div className="text-[12px] text-gray-600-ban mt-0.5">{r.tagline}</div>
                {isCurrent && (
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-green-deep bg-white border border-green-deep px-1.5 py-0.5 rounded inline-block mt-2">
                    You are here
                  </div>
                )}
              </div>
              {i < TERRITORY_ORDER.length - 1 && (
                <div key={`arrow-${rid}`} className="self-center text-gray-400-ban text-lg">→</div>
              )}
            </>
          )
        })}
      </div>

      {/* Selected region detail */}
      {detail && (
        <div className="bg-white border border-gray-200-ban rounded-[10px] p-5 mb-6">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-1">
            {detail.tagline}
          </div>
          <div className="font-serif text-xl text-gray-900-ban mb-2">{detail.name}</div>
          <p className="text-[13px] text-gray-700 leading-relaxed">{detail.description}</p>
        </div>
      )}

      {/* Cross-cutting themes — below */}
      <div>
        <div className="text-center text-[11px] text-gray-600-ban mb-3 italic">
          Cross-cutting themes — present in every region
        </div>
        <div className="grid grid-cols-3 gap-3">
          {crossCuttingThemes.map(t => (
            <div key={t.id} className="bg-purple-pale border border-purple-mid/20 rounded-[10px] p-4">
              <div className="text-[13px] font-semibold text-purple-mid mb-1">{t.name}</div>
              <div className="text-[11px] text-gray-600-ban leading-relaxed">{t.blurb}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend / hint */}
      <div className="text-[11px] text-gray-400-ban mt-6 italic text-center">
        Click a region to read more. &quot;You are here&quot; reflects your current team state — finishing the orientation arc moves the marker from Basecamp into Provisioning.
      </div>
    </div>
  )
}
