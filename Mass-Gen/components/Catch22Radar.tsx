'use client'
import { useState } from 'react'
import { catch22s } from '@/data/catch22s'
import DocModal, { buildDocBody, findDocByName } from './DocModal'

export default function Catch22Radar() {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null)

  function toggle(i: number) {
    setOpen(prev => ({ ...prev, [i]: !prev[i] }))
  }

  function openDocChip(name: string) {
    const d = findDocByName(name)
    if (!d) return
    const body = buildDocBody(d)
    if (body) setModal(body)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Catch-22 radar</h1>
        <p className="text-gray-600-ban leading-relaxed">
          These are the most common institutional dependency loops that stall BAN onboarding. Reviewing them early gives you the best chance of navigating through before they stop your momentum.
        </p>
      </div>

      <div className="space-y-3">
        {catch22s.map((c, i) => (
          <div key={i} className="bg-white rounded-[10px] border border-gray-200-ban overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50-ban transition-colors"
            >
              <span className={c.sev === 'hi' ? 'sev-hi' : 'sev-md'}>
                {c.sev === 'hi' ? 'High risk' : 'Medium risk'}
              </span>
              <span className="flex-1 text-[13px] font-medium text-gray-900-ban">{c.t}</span>
              <span className={`text-gray-400-ban transition-transform ${open[i] ? 'rotate-90' : ''}`}>▶</span>
            </button>

            {open[i] && (
              <div className="px-5 pb-5 border-t border-gray-100-ban">
                <p className="text-[13px] text-gray-600-ban leading-relaxed pt-4 mb-4">{c.b}</p>
                <div className="bg-green-pale rounded-lg p-4 text-[13px] text-green-deep leading-relaxed">
                  <strong>Field guide tip:</strong> {c.tip}
                </div>
                {((c.docs && c.docs.length) || (c.links && c.links.length)) && (
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2">Related</div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.docs?.map(name => (
                        <button
                          key={name}
                          onClick={() => openDocChip(name)}
                          className="text-[11px] bg-green-pale text-green-deep px-2 py-0.5 rounded hover:bg-green-light hover:text-white transition-colors"
                        >
                          📄 {name}
                        </button>
                      ))}
                      {c.links?.map(l => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] bg-gray-100-ban text-gray-600-ban px-2 py-0.5 rounded hover:bg-green-mid hover:text-white transition-colors"
                        >
                          ↗ {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {modal && <DocModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
    </div>
  )
}
