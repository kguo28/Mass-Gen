'use client'
import type { PageId } from '@/app/page'
import { phases } from '@/data/phases'

interface Props {
  activePage: PageId
  setActivePage: (p: PageId) => void
  checks: Record<string, boolean>
}

interface NavItem {
  id: PageId
  icon: string
  label: string
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Start here',
    items: [
      { id: 'hub',         icon: '◆', label: 'Implementation Hub' },
      { id: 'map',         icon: '◇', label: 'Territory map' },
      { id: 'measurement', icon: '◐', label: 'Measurement' },
    ],
  },
  {
    section: 'Orientation arc',
    items: [
      { id: 'readiness', icon: '◔', label: 'Readiness check' },
      { id: 'arc1',      icon: '①', label: 'Step 1: Clinical elements' },
      { id: 'arc2',      icon: '②', label: 'Step 2: CCM & modules' },
      { id: 'arc3',      icon: '③', label: 'Step 3: Choose modules' },
    ],
  },
  {
    section: 'Provisioning track',
    items: [
      { id: 'phases',  icon: '▶', label: 'Phase navigator' },
      { id: 'catch22', icon: '⚠', label: 'Catch-22 radar' },
      { id: 'roles',   icon: '◎', label: 'Your team roles' },
      { id: 'bizcase', icon: '✎', label: 'Business case' },
      { id: 'docs',    icon: '❐', label: 'Document library' },
      { id: 'dash',    icon: '▣', label: 'Dashboard' },
    ],
  },
  {
    section: 'Field tools',
    items: [
      { id: 'ai',         icon: '◑', label: 'Ask the guide' },
      { id: 'changecard', icon: '🗂', label: 'Change cards' },
    ],
  },
]

function getBadge(pi: number, checks: Record<string, boolean>) {
  const p = phases[pi]
  let done = 0, tot = 0
  p.groups.forEach(g => g.tasks.forEach((_, ti) => {
    tot++
    if (checks[`${pi}-${g.lbl}-${ti}`]) done++
  }))
  return `${done}/${tot}`
}

export default function Sidebar({ activePage, setActivePage, checks }: Props) {
  return (
    <nav className="w-[240px] bg-green-deep flex flex-col fixed top-0 left-0 bottom-0 overflow-y-auto z-10">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <div className="text-[10px] tracking-widest uppercase text-green-light mb-1.5">Bipolar Action Network</div>
        <div className="font-serif text-xl text-white leading-tight">Living Field Guide</div>
        <div className="text-xs text-white/50 mt-1">Site Onboarding</div>
      </div>

      {/* Nav */}
      <div className="flex-1 pt-3 pb-4">
        {NAV.map(section => (
          <div key={section.section}>
            <div className="text-[10px] tracking-widest uppercase text-white/35 px-6 mb-1 mt-4">{section.section}</div>
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-2.5 px-6 py-2 text-[13px] text-left border-l-2 transition-all ${
                  activePage === item.id
                    ? 'text-white border-green-light bg-white/8'
                    : 'text-white/65 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-4 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.id === 'phases' && (
                  <span className="text-[10px] bg-white/15 text-white/70 px-1.5 py-0.5 rounded">
                    {phases.reduce((acc, _, pi) => {
                      const parts = getBadge(pi, checks).split('/')
                      return [acc[0] + parseInt(parts[0]), acc[1] + parseInt(parts[1])]
                    }, [0, 0]).join('/')}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-5 text-[11px] text-white/35 leading-relaxed border-t border-white/10">
        Questions? Contact your BAN onboarding lead or email<br />
        bipolaractionnetwork@mgb.org
      </div>
    </nav>
  )
}
