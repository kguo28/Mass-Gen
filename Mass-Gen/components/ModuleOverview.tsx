'use client'
import { useState } from 'react'
import { findModule, type ModuleId } from '@/data/modules'
import { moduleOverviews, type DriverNode } from '@/data/moduleOverviews'
import { ccmComponents } from '@/data/ccmComponents'
import { getChangeCard } from '@/data/changeCardRegistry'
import {
  getModuleResources,
  KIND_LABEL,
  type ModuleResource,
} from '@/data/moduleResources'

interface Props {
  moduleId: ModuleId
  onLaunchUnit: () => void
  onBack: () => void
}

type Tab = 'overview' | 'evidence' | 'theory' | 'media' | 'resources'

export default function ModuleOverview({ moduleId, onLaunchUnit, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const module = findModule(moduleId)
  const overview = moduleOverviews[moduleId]

  if (!module) {
    return (
      <div className="text-[13px] text-gray-400-ban">Module not found.</div>
    )
  }

  const ccmName = module.ccmComponent
    ? ccmComponents.find(c => c.id === module.ccmComponent)?.name ?? ''
    : module.kind === 'operational' ? 'Operational' : ''

  const cardId = module.changeCardId
  const card = cardId ? getChangeCard(cardId) : null
  const hasUnit = module.unitType !== 'none'
  const launchLabel =
    module.unitType === 'change_card' ? 'Begin implementation work →'
      : module.unitType === 'phase_navigator' ? 'Open phase navigator →'
      : 'Unit coming soon'

  const resources = getModuleResources(moduleId)

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'evidence',  label: 'Evidence summary' },
    { id: 'theory',    label: 'Theory of improvement' },
    { id: 'media',     label: 'Media' },
    { id: 'resources', label: 'Resources' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-[12px] text-gray-400-ban hover:text-gray-600-ban underline mb-3"
        >
          ← Back to hub
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-green-mid mb-1">
              {ccmName}
            </div>
            <h1 className="font-serif text-3xl text-gray-900-ban mb-2">{module.name}</h1>
            <p className="text-gray-600-ban leading-relaxed max-w-[640px]">{module.oneLiner}</p>
          </div>
          {hasUnit && (
            <button
              onClick={onLaunchUnit}
              className="bg-green-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors flex-shrink-0"
            >
              {launchLabel}
            </button>
          )}
        </div>

        {/* Card-citation row (if card exists) */}
        {card && (
          <div className="mt-3 text-[11px] text-gray-400-ban">
            Change Card: <code className="text-gray-600-ban">{card.header.cardId}</code> · v{card.header.version.replace(/^v/, '')} · {card.header.status}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border border-gray-200-ban rounded-lg overflow-hidden bg-white">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-[12px] font-medium border-r last:border-r-0 border-gray-200-ban transition-colors ${
              tab === t.id
                ? 'bg-green-deep text-white'
                : 'text-gray-600-ban hover:bg-gray-50-ban'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white border border-gray-200-ban rounded-[10px] p-6">
        {tab === 'overview' && (
          overview?.overview ? (
            <p className="text-[14px] text-gray-700 leading-relaxed">{overview.overview}</p>
          ) : (
            <Placeholder section="Overview" />
          )
        )}

        {tab === 'evidence' && (
          overview?.evidenceSummary ? (
            <div>
              <p className="text-[14px] text-gray-700 leading-relaxed mb-4">{overview.evidenceSummary}</p>
              <div className="text-[11px] text-gray-400-ban">
                Degree of belief: <span className="font-semibold uppercase tracking-wider text-green-deep">{overview.degreeOfBelief}</span>
              </div>
            </div>
          ) : (
            <Placeholder section="Evidence summary" />
          )
        )}

        {tab === 'theory' && (
          overview?.theoryOfImprovement ? (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-3">
                Key driver outline
              </div>
              <DriverTree node={overview.theoryOfImprovement} root />
            </div>
          ) : (
            <Placeholder section="Theory of improvement" />
          )
        )}

        {tab === 'media' && (
          overview?.media && overview.media.length > 0 ? (
            <div className="space-y-3">
              {overview.media.map((m, i) => (
                <div key={i} className="border border-gray-100-ban rounded p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-1">
                    {m.kind}
                  </div>
                  <div className="font-medium text-[13px] text-gray-900-ban">{m.title}</div>
                  <div className="text-[12px] text-gray-600-ban">{m.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <Placeholder section="Media" body="Video overview, podcast, and team stories will appear here once authored." />
          )
        )}

        {tab === 'resources' && (
          resources.length > 0 ? (
            <div>
              <p className="text-[12px] text-gray-600-ban leading-relaxed mb-4">
                Source documents, tools, and training aids that back this module. Available items download directly; items in development will land here once authored.
              </p>
              <div className="space-y-3">
                {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
              </div>
            </div>
          ) : (
            <Placeholder section="Resources" body="No source documents cataloged for this module yet." />
          )
        )}
      </div>
    </div>
  )
}

function ResourceCard({ resource: r }: { resource: ModuleResource }) {
  const available = r.status === 'available'
  return (
    <div className="border border-gray-100-ban rounded-[10px] p-4 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-green-mid">
            {KIND_LABEL[r.kind]}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban bg-gray-50-ban border border-gray-100-ban px-1.5 py-0.5 rounded">
            {r.format}
          </span>
          {r.authoredAt && (
            <span className="text-[10px] text-gray-400-ban">· authored {r.authoredAt}</span>
          )}
        </div>
        <div className="font-medium text-[13px] text-gray-900-ban mb-1">{r.title}</div>
        <div className="text-[12px] text-gray-600-ban leading-relaxed">{r.description}</div>
      </div>
      <div className="flex-shrink-0">
        {available ? (
          <a
            href={`/api/resources/${r.id}`}
            download
            className="inline-flex items-center gap-1.5 bg-green-deep text-white text-[12px] font-medium px-3 py-2 rounded-lg hover:bg-green-mid transition-colors"
          >
            Download
            <span aria-hidden>↓</span>
          </a>
        ) : (
          <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban bg-gray-50-ban border border-gray-100-ban px-2.5 py-1.5 rounded">
            In development
          </span>
        )}
      </div>
    </div>
  )
}

function DriverTree({ node, root }: { node: DriverNode; root?: boolean }) {
  return (
    <div className={root ? '' : 'ml-5 mt-1'}>
      <div
        className={`text-[13px] leading-relaxed ${
          root ? 'font-semibold text-gray-900-ban mb-2 italic' : 'text-gray-700'
        }`}
      >
        {root ? `Aim — ${node.label}` : `· ${node.label}`}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="space-y-0.5">
          {node.children.map((child, i) => (
            <DriverTree key={i} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}

function Placeholder({ section, body }: { section: string; body?: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2">
        {section}
      </div>
      <p className="text-[13px] text-gray-400-ban italic max-w-[480px] mx-auto leading-relaxed">
        {body ?? `${section} content for this module hasn't been authored yet. It will appear here once the module steward adds it.`}
      </p>
    </div>
  )
}
