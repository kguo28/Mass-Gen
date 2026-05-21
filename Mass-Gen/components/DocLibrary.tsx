'use client'
import { useState } from 'react'
import { docs } from '@/data/docs'
import DocModal, { buildDocBody } from './DocModal'

const FILTERS = ['All documents', 'Joining', 'Training', 'Registering', 'Activation', 'Reference']

const PHASE_ICONS: Record<string, string> = {
  Joining: '📋',
  Training: '📚',
  Registering: '📄',
  Activation: '🚀',
  Reference: '📰',
}

export default function DocLibrary() {
  const [filter, setFilter] = useState('All documents')
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null)

  const filtered = docs.filter(d => filter === 'All documents' || d.ph === filter)

  function openDoc(i: number) {
    const body = buildDocBody(docs[i])
    if (body) setModal(body)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Document library</h1>
        <p className="text-gray-600-ban leading-relaxed">
          Key documents for BAN onboarding. BAN provides all of these — your team will review, route for signature, or act on each at the appropriate phase. Click any document to view it.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[12px] rounded-full border transition-all ${
              filter === f
                ? 'bg-green-deep text-white border-green-deep'
                : 'border-gray-200-ban text-gray-600-ban hover:border-green-mid hover:text-green-deep'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Doc grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((d, i) => {
          const globalIdx = docs.indexOf(d)
          const clickable = d.type !== 'placeholder' || true
          return (
            <div
              key={i}
              onClick={() => openDoc(globalIdx)}
              className="bg-white rounded-[10px] border border-gray-200-ban p-5 cursor-pointer hover:border-green-mid hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-3">{PHASE_ICONS[d.ph] || '📄'}</div>
              <div className="font-medium text-[13px] text-gray-900-ban mb-1.5">{d.n}</div>
              <div className="text-[12px] text-gray-600-ban leading-relaxed mb-3">{d.d}</div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${d.pc}`}>{d.ph}</span>
                <span className="text-[11px] text-green-mid font-medium">{d.action}</span>
              </div>
            </div>
          )
        })}
      </div>

      {modal && <DocModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
    </div>
  )
}
