'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Hub from '@/components/Hub'
import TerritoryMap from '@/components/TerritoryMap'
import Readiness from '@/components/Readiness'
import ArcStep1 from '@/components/ArcStep1'
import ArcStep2 from '@/components/ArcStep2'
import ArcStep3 from '@/components/ArcStep3'
import PhaseNavigator from '@/components/PhaseNavigator'
import Catch22Radar from '@/components/Catch22Radar'
import TeamRoles from '@/components/TeamRoles'
import BusinessCase from '@/components/BusinessCase'
import DocLibrary from '@/components/DocLibrary'
import AiChat from '@/components/AiChat'
import Dashboard from '@/components/Dashboard'
import MeasurementPage from '@/components/MeasurementPage'
import ChangeCardApp from '@/components/ChangeCardApp'
import ModuleOverview from '@/components/ModuleOverview'
import ModuleSwitcher from '@/components/ModuleSwitcher'
import ProgressBar from '@/components/ProgressBar'
import LockedPlaceholder from '@/components/LockedPlaceholder'
import LoginPortal from '@/components/LoginPortal'
import type { AuthSession } from '@/data/demoAccounts'
import { getChangeCard } from '@/data/changeCardRegistry'
import { findModule, type ModuleId } from '@/data/modules'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useSession } from '@/hooks/useSession'
import { useTeamState, requiredStep } from '@/hooks/useTeamState'

export type PageId =
  | 'hub'
  | 'map'
  | 'readiness'
  | 'arc1'
  | 'arc2'
  | 'arc3'
  | 'phases'
  | 'catch22'
  | 'roles'
  | 'bizcase'
  | 'docs'
  | 'ai'
  | 'dash'
  | 'measurement'
  | 'changecard'
  | 'module'

const GATED_ALLOWLIST: PageId[] = ['hub', 'readiness', 'arc1', 'arc2', 'arc3']

export default function Home() {
  const { session, hydrated, signIn, signOut } = useSession()

  if (!hydrated) {
    return <div className="p-8 text-[13px] text-gray-400-ban">Loading…</div>
  }

  if (!session) {
    return <LoginPortal onSignIn={signIn} />
  }

  return <AuthenticatedApp session={session} onSignOut={signOut} />
}

function AuthenticatedApp({
  session,
  onSignOut,
}: {
  session: AuthSession
  onSignOut: () => void
}) {
  const [activePage, setActivePage] = useState<PageId>('hub')
  const [activeCardId, setActiveCardId] = useState<string>('pvp')
  const [activeModuleId, setActiveModuleId] = useState<ModuleId | null>(null)
  const [checks, setChecks] = useLocalStorage<Record<string, boolean>>(
    `ban_checks:${session.progressKey}`,
    {},
  )
  const { state, hydrated } = useTeamState(session.progressKey)

  function openChangeCard(cardId: string) {
    if (!getChangeCard(cardId)) return
    setActiveCardId(cardId)
    setActivePage('changecard')
  }

  /** Opening a module always lands on the ModuleOverview wrapper page —
   *  per v2 spec, the module page is the unit, and the card (or other
   *  unit type) is launched from within. The wrapper handles missing
   *  unit content gracefully. */
  function openModule(moduleId: ModuleId): { handled: boolean; module: ReturnType<typeof findModule> } {
    const m = findModule(moduleId)
    if (!m) return { handled: false, module: undefined }
    setActiveModuleId(moduleId)
    setActivePage('module')
    return { handled: true, module: m }
  }

  /** From inside ModuleOverview — launches the module's actual unit
   *  (Change Card App, Phase Navigator, etc.). */
  function launchActiveModuleUnit() {
    if (!activeModuleId) return
    const m = findModule(activeModuleId)
    if (!m) return
    if (m.unitType === 'change_card' && m.changeCardId) {
      openChangeCard(m.changeCardId)
    } else if (m.unitType === 'phase_navigator') {
      setActivePage('phases')
    }
  }

  function clearActiveModule() {
    setActiveModuleId(null)
  }

  const activeCard = getChangeCard(activeCardId)

  // Wait for state hydration before deciding gate vs full UI — avoids a
  // flash of the unlocked sidebar before localStorage rehydrates the
  // basecamp state.
  if (!hydrated) {
    return <div className="p-8 text-[13px] text-gray-400-ban">Loading…</div>
  }

  const currentStep = requiredStep(state)
  const gateActive = session.role === 'site' && currentStep !== null
  const pageIsAllowed = !gateActive || GATED_ALLOWLIST.includes(activePage)

  // Hide switcher on Hub itself and arc pages (it would either duplicate or
  // be premature). Also hide entirely while gated — the switcher refers to
  // selected modules that don't yet exist.
  const hideSwitcher =
    gateActive ||
    activePage === 'hub' ||
    activePage === 'arc1' ||
    activePage === 'arc2' ||
    activePage === 'arc3' ||
    activePage === 'readiness'

  // While gated: no sidebar, centered column, ProgressBar at top.
  if (gateActive) {
    return (
      <main className="min-h-screen p-8 max-w-[900px] mx-auto">
        <SessionStrip session={session} onSignOut={onSignOut} />
        <ProgressBar
          activePage={activePage}
          arcStep={state.arcStep}
          setActivePage={setActivePage}
        />
        {pageIsAllowed ? (
          <>
            {activePage === 'hub'       && <Hub setActivePage={setActivePage} openModule={openModule} />}
            {activePage === 'readiness' && <Readiness setActivePage={setActivePage} />}
            {activePage === 'arc1'      && <ArcStep1 setActivePage={setActivePage} />}
            {activePage === 'arc2'      && <ArcStep2 setActivePage={setActivePage} />}
            {activePage === 'arc3'      && <ArcStep3 setActivePage={setActivePage} />}
          </>
        ) : (
          <LockedPlaceholder currentStep={currentStep} setActivePage={setActivePage} />
        )}
      </main>
    )
  }

  // Unlocked — full app with sidebar.
  return (
    <div className="flex min-h-screen">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        openModule={openModule}
        session={session}
        onSignOut={onSignOut}
      />
      <main className="ml-[240px] flex-1 p-8 max-w-[900px]">
        {!hideSwitcher && (
          <ModuleSwitcher
            activeModuleId={activeModuleId}
            onSwitch={(id) => openModule(id)}
            onClear={clearActiveModule}
          />
        )}
        {activePage === 'hub'        && <Hub setActivePage={setActivePage} openModule={openModule} />}
        {activePage === 'map'        && <TerritoryMap />}
        {activePage === 'readiness'  && <Readiness setActivePage={setActivePage} />}
        {activePage === 'arc1'       && <ArcStep1 setActivePage={setActivePage} />}
        {activePage === 'arc2'       && <ArcStep2 setActivePage={setActivePage} />}
        {activePage === 'arc3'       && <ArcStep3 setActivePage={setActivePage} />}
        {activePage === 'phases'     && <PhaseNavigator checks={checks} setChecks={setChecks} />}
        {activePage === 'catch22'    && <Catch22Radar />}
        {activePage === 'roles'      && <TeamRoles />}
        {activePage === 'bizcase'    && <BusinessCase />}
        {activePage === 'docs'       && <DocLibrary />}
        {activePage === 'ai'         && <AiChat activeCardId={activeCardId} activeModuleId={activeModuleId} />}
        {activePage === 'dash'       && <Dashboard checks={checks} session={session} />}
        {activePage === 'measurement' && <MeasurementPage />}
        {activePage === 'changecard' && activeCard && <ChangeCardApp card={activeCard} />}
        {activePage === 'module' && activeModuleId && (
          <ModuleOverview
            moduleId={activeModuleId}
            onLaunchUnit={launchActiveModuleUnit}
            onBack={() => setActivePage('hub')}
          />
        )}
      </main>
    </div>
  )
}

function SessionStrip({
  session,
  onSignOut,
}: {
  session: AuthSession
  onSignOut: () => void
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 rounded-[10px] border border-gray-200-ban bg-white px-5 py-3">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban">
          Signed in
        </div>
        <div className="mt-0.5 text-[13px] font-medium text-gray-900-ban">
          {session.siteName} · {session.displayName}
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="rounded-md border border-gray-200-ban px-3 py-1.5 text-[12px] font-medium text-gray-600-ban transition-colors hover:border-green-mid hover:text-green-deep"
      >
        Sign out
      </button>
    </div>
  )
}
