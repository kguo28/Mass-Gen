'use client'
import { useState } from 'react'
import type { PageId } from '@/app/page'
import type { AuthSession } from '@/data/demoAccounts'
import { useTeamState } from '@/hooks/useTeamState'
import {
  findModule,
  operationalModules,
  type FoundationalModule,
  type ModuleId,
} from '@/data/modules'

interface OpenModuleResult {
  handled: boolean
  module: FoundationalModule | undefined
}

interface Props {
  activePage: PageId
  setActivePage: (p: PageId) => void
  openModule: (id: ModuleId) => OpenModuleResult
  session: AuthSession
  onSignOut: () => void
}

interface SetupItem {
  id: PageId
  label: string
}

const SETUP_ITEMS: SetupItem[] = [
  { id: 'readiness', label: 'Readiness profile' },
  { id: 'arc3',      label: 'Reconsider module choice' },
  { id: 'roles',     label: 'Team roles' },
  { id: 'bizcase',   label: 'Business case' },
  { id: 'docs',      label: 'Document library' },
  { id: 'dash',      label: 'Progress dashboard' },
]

const SETUP_IDS = new Set<PageId>(SETUP_ITEMS.map(i => i.id))

export default function Sidebar({ activePage, setActivePage, openModule, session, onSignOut }: Props) {
  const { state } = useTeamState()
  const setupActive = SETUP_IDS.has(activePage)
  // Expand SITE SETUP when a child is active; otherwise default closed
  // but allow user to toggle. Per-session state.
  const [setupOpen, setSetupOpen] = useState<boolean>(setupActive)

  const moduleEntries: FoundationalModule[] = [
    ...state.selectedModules
      .map(id => findModule(id))
      .filter((m): m is FoundationalModule => !!m),
    ...operationalModules.filter(m => m.alwaysPresent),
  ]

  return (
    <nav className="w-[240px] bg-green-deep flex flex-col fixed top-0 left-0 bottom-0 overflow-y-auto z-10">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <div className="text-[10px] tracking-widest uppercase text-green-light mb-1.5">Bipolar Action Network</div>
        <div className="font-serif text-xl text-white leading-tight">Living Field Guide</div>
        <div className="text-xs text-white/50 mt-1">Implementation Hub</div>
      </div>

      <div className="flex-1 pt-3 pb-4">
        {/* HUB */}
        <Section label="Hub">
          <NavItem
            label="Implementation Hub"
            icon="◆"
            active={activePage === 'hub'}
            onClick={() => setActivePage('hub')}
          />
        </Section>

        {/* YOUR MODULES */}
        {moduleEntries.length > 0 && (
          <Section label="Your modules">
            {moduleEntries.map(m => (
              <ModuleNavItem
                key={m.id}
                module={m}
                onClick={() => openModule(m.id)}
              />
            ))}
          </Section>
        )}

        {/* TOOLS */}
        <Section label="Tools">
          <NavItem
            label="Ask the Ranger"
            icon="◑"
            active={activePage === 'ai'}
            onClick={() => setActivePage('ai')}
          />
        </Section>

        {/* SITE SETUP (collapsible) */}
        <div>
          <button
            onClick={() => setSetupOpen(o => !o)}
            className="w-full flex items-center justify-between text-[10px] tracking-widest uppercase text-white/35 px-6 mb-1 mt-5 hover:text-white/60 transition-colors"
          >
            <span>Site setup</span>
            <span className={`text-[10px] transition-transform ${setupOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {setupOpen && (
            <div>
              {SETUP_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full text-left text-[12px] pl-10 pr-6 py-1.5 border-l-2 transition-all ${
                    activePage === item.id
                      ? 'text-white border-green-light bg-white/8'
                      : 'text-white/55 border-transparent hover:text-white/85 hover:bg-white/5'
                  }`}
                >
                  · {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-5">
        <div className="mb-4 rounded-md border border-white/10 bg-white/5 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Signed in
          </div>
          <div className="mt-1 text-[12px] font-medium leading-snug text-white">
            {session.siteName}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-white/50">
            {session.displayName}
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 w-full rounded bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/75 transition-colors hover:bg-white/20 hover:text-white"
          >
            Sign out
          </button>
        </div>
        <div className="text-[11px] leading-relaxed text-white/35">
          Questions? Contact your BAN onboarding lead or email<br />
          bipolaractionnetwork@mgb.org
        </div>
      </div>
    </nav>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest uppercase text-white/35 px-6 mb-1 mt-5">{label}</div>
      {children}
    </div>
  )
}

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-6 py-2 text-[13px] text-left border-l-2 transition-all ${
        active
          ? 'text-white border-green-light bg-white/8'
          : 'text-white/65 border-transparent hover:text-white hover:bg-white/5'
      }`}
    >
      <span className="w-4 text-center">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  )
}

function ModuleNavItem({
  module,
  onClick,
}: {
  module: FoundationalModule
  onClick: () => void
}) {
  const isOperational = module.kind === 'operational'
  const badgeLabel = isOperational ? 'Always on' : 'Preparing'
  const badgeColor = isOperational
    ? 'bg-amber-ban/25 text-amber-pale'
    : 'bg-green-light/20 text-green-light'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-6 py-2 text-[13px] text-left border-l-2 border-transparent text-white/65 hover:text-white hover:bg-white/5 transition-all"
    >
      <span className="w-4 text-center text-white/50">▶</span>
      <span className="flex-1 truncate">{module.name}</span>
      <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeColor}`}>
        {badgeLabel}
      </span>
    </button>
  )
}
