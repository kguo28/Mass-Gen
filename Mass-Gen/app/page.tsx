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
import ModuleSwitcher from '@/components/ModuleSwitcher'
import { getChangeCard } from '@/data/changeCardRegistry'
import { findModule, type ModuleId } from '@/data/modules'
import { useLocalStorage } from '@/hooks/useLocalStorage'

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

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('hub')
  const [activeCardId, setActiveCardId] = useState<string>('pvp')
  const [activeModuleId, setActiveModuleId] = useState<ModuleId | null>(null)
  const [checks, setChecks] = useLocalStorage<Record<string, boolean>>('ban_checks', {})

  function openChangeCard(cardId: string) {
    if (!getChangeCard(cardId)) return
    setActiveCardId(cardId)
    setActivePage('changecard')
  }

  /** Single dispatch for opening a module's unit. Routes by Module.unitType
   *  AND marks the module as the currently-focused one so the switcher chip
   *  and chatbot context can scope to it. */
  function openModule(moduleId: ModuleId): { handled: boolean; module: ReturnType<typeof findModule> } {
    const m = findModule(moduleId)
    if (!m) return { handled: false, module: undefined }
    setActiveModuleId(moduleId)
    if (m.unitType === 'change_card' && m.changeCardId) {
      openChangeCard(m.changeCardId)
      return { handled: true, module: m }
    }
    if (m.unitType === 'phase_navigator') {
      setActivePage('phases')
      return { handled: true, module: m }
    }
    return { handled: false, module: m }
  }

  function clearActiveModule() {
    setActiveModuleId(null)
  }

  const activeCard = getChangeCard(activeCardId)

  // Hide switcher on the Hub itself (Hub IS the module-overview surface — chip row would duplicate)
  // and on the arc pages (user is still picking modules there).
  const hideSwitcher = activePage === 'hub' || activePage === 'arc1' || activePage === 'arc2' || activePage === 'arc3' || activePage === 'readiness'

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} checks={checks} />
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
        {activePage === 'dash'       && <Dashboard checks={checks} />}
        {activePage === 'measurement' && <MeasurementPage />}
        {activePage === 'changecard' && activeCard && <ChangeCardApp card={activeCard} />}
      </main>
    </div>
  )
}
