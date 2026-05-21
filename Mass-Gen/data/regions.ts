export type RegionId = 'basecamp' | 'provisioning' | 'expedition' | 'deep_terrain' | 'new_ground'

export interface Region {
  id: RegionId
  name: string
  tagline: string
  description: string
}

export const regions: Region[] = [
  {
    id: 'basecamp',
    name: 'Basecamp',
    tagline: 'Pre-entry',
    description: 'Where a site sits before they are actively working on any module — readiness, orientation, and the first deliberate choice of where to start.',
  },
  {
    id: 'provisioning',
    name: 'Provisioning',
    tagline: 'Onboarding',
    description: 'Institutional setup that runs in parallel — PDUA, IRB, Phlox/Hive technical setup, and team formation for selected modules.',
  },
  {
    id: 'expedition',
    name: 'Expedition',
    tagline: 'Core changes',
    description: 'Active improvement work — PDSA cycles, measurement, and the steady practice of the seven elements at the site.',
  },
  {
    id: 'deep_terrain',
    name: 'Deep terrain',
    tagline: 'Advanced work',
    description: 'Sustained, integrated practice — extending into community resources, patient self-management, and complex cases.',
  },
  {
    id: 'new_ground',
    name: 'New ground',
    tagline: 'Innovation branches from any region',
    description: 'Where sites experiment with novel approaches and contribute them back to the network.',
  },
]

export const findRegion = (id: RegionId) => regions.find(r => r.id === id)!
