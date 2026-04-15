'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import PhaseNavigator from '@/components/PhaseNavigator'
import Catch22Radar from '@/components/Catch22Radar'
import TeamRoles from '@/components/TeamRoles'
import BusinessCase from '@/components/BusinessCase'
import DocLibrary from '@/components/DocLibrary'
import AiChat from '@/components/AiChat'
import Dashboard from '@/components/Dashboard'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export type PageId = 'phases' | 'catch22' | 'roles' | 'bizcase' | 'docs' | 'ai' | 'dash'

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('phases')
  const [checks, setChecks] = useLocalStorage<Record<string, boolean>>('ban_checks', {})

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} checks={checks} />
      <main className="ml-[240px] flex-1 p-8 max-w-[900px]">
        {activePage === 'phases'   && <PhaseNavigator checks={checks} setChecks={setChecks} />}
        {activePage === 'catch22'  && <Catch22Radar />}
        {activePage === 'roles'    && <TeamRoles />}
        {activePage === 'bizcase'  && <BusinessCase />}
        {activePage === 'docs'     && <DocLibrary />}
        {activePage === 'ai'       && <AiChat />}
        {activePage === 'dash'     && <Dashboard checks={checks} />}
      </main>
    </div>
  )
}
