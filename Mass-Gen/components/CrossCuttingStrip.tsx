import { crossCuttingThemes } from '@/data/crossCutting'

export default function CrossCuttingStrip() {
  return (
    <div className="mt-6">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2">
        Cross-cutting themes — present in every region
      </div>
      <div className="grid grid-cols-3 gap-3">
        {crossCuttingThemes.map(t => (
          <div
            key={t.id}
            className="bg-white border border-gray-200-ban rounded-lg px-3 py-2.5"
          >
            <div className="text-[12px] font-medium text-gray-900-ban">{t.name}</div>
            <div className="text-[11px] text-gray-400-ban leading-snug mt-0.5">{t.blurb}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
