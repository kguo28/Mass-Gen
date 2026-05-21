import type { ModuleId } from './modules'

/** Measure type — what kind of signal this measure carries.
 *  - clinical: patient-level outcome or process (e.g. mood scale captured)
 *  - operational: site/team-level process (e.g. tasks complete, days since X)
 *  - process: improvement-process measure (e.g. PDSA cycles run)  */
export type MeasureType = 'clinical' | 'operational' | 'process'

export type MeasureUnit = '%' | 'count' | 'count/week' | 'count/month' | 'count/quarter' | 'days' | 'ratio'

export type MeasureTrend = 'up' | 'down' | 'flat' | 'unknown'

export interface Measure {
  id: string
  moduleId: ModuleId
  name: string
  /** Optional short label for compact badges (≤ 18 chars). */
  shortName?: string
  type: MeasureType
  unit: MeasureUnit
  target: number
  current: number
  baseline?: number
  trend: MeasureTrend
  description?: string
  /** Optional: source of truth for the numbers (chart audit / EHR query / Phlox report). */
  source?: string
}

/** PLACEHOLDER DEMO DATA — plausible numbers so the framework reads
 *  realistically end-to-end. Replace with real per-site values from
 *  Phlox / chart audit when integrated. */
export const measures: Measure[] = [
  // --- PVP ---
  {
    id: 'pvp_completion',
    moduleId: 'pvp',
    name: 'PVP completion rate',
    shortName: 'PVP complete %',
    type: 'process',
    unit: '%',
    target: 80,
    current: 22,
    baseline: 5,
    trend: 'up',
    description: '% of bipolar visits where a pre-visit planning step occurred before the visit.',
    source: 'Chart audit (weekly)',
  },
  {
    id: 'pvp_huddle',
    moduleId: 'pvp',
    name: 'PVP team huddles per week',
    shortName: 'Huddles/wk',
    type: 'process',
    unit: 'count/week',
    target: 5,
    current: 2,
    baseline: 0,
    trend: 'up',
    source: 'Team self-report',
  },

  // --- Leadership engagement ---
  {
    id: 'leadership_touchpoints',
    moduleId: 'leadership',
    name: 'Leadership touchpoints per quarter',
    shortName: 'Touchpoints/qtr',
    type: 'operational',
    unit: 'count/quarter',
    target: 4,
    current: 1,
    baseline: 0,
    trend: 'up',
    description: 'Number of leadership review meetings or written check-ins per quarter.',
  },

  // --- Aligned payment ---
  {
    id: 'pcm_billing',
    moduleId: 'aligned_payment',
    name: 'PCM-eligible visits billed',
    shortName: 'PCM billed %',
    type: 'operational',
    unit: '%',
    target: 90,
    current: 0,
    baseline: 0,
    trend: 'flat',
    description: '% of PCM-eligible bipolar visits where PCM codes are submitted.',
    source: 'Revenue cycle data',
  },

  // --- Population management ---
  {
    id: 'overdue_reach',
    moduleId: 'population_mgmt',
    name: 'Overdue patient reach rate',
    shortName: 'Reach %',
    type: 'process',
    unit: '%',
    target: 80,
    current: 31,
    baseline: 12,
    trend: 'up',
    description: '% of overdue bipolar patients reached via outreach attempts in the past 30 days.',
  },

  // --- MBC ---
  {
    id: 'mbc_use',
    moduleId: 'mbc',
    name: 'Visits with measurement-based care tool used',
    shortName: 'MBC use %',
    type: 'process',
    unit: '%',
    target: 90,
    current: 41,
    baseline: 8,
    trend: 'up',
    source: 'EHR query',
  },

  // --- Population registry ---
  {
    id: 'registry_coverage',
    moduleId: 'population_registry',
    name: '% of bipolar patients in registry',
    shortName: 'Registry coverage',
    type: 'operational',
    unit: '%',
    target: 95,
    current: 67,
    baseline: 15,
    trend: 'up',
    description: 'Share of the known bipolar panel correctly captured in the registry.',
    source: 'Phlox',
  },

  // --- Outcome tracking ---
  {
    id: 'quarterly_outcomes',
    moduleId: 'outcome_tracking',
    name: 'Patients with quarterly outcome capture',
    shortName: 'Outcomes captured %',
    type: 'clinical',
    unit: '%',
    target: 75,
    current: 18,
    baseline: 4,
    trend: 'up',
    source: 'Phlox',
  },

  // --- Site onboarding (operational module) ---
  {
    id: 'onboarding_progress',
    moduleId: 'site_onboarding',
    name: 'Onboarding tasks complete',
    shortName: 'Onboarding %',
    type: 'operational',
    unit: '%',
    target: 100,
    current: 38,
    trend: 'up',
    description: 'Share of the Phase-navigator onboarding tasks marked complete.',
  },
  {
    id: 'days_since_loj',
    moduleId: 'site_onboarding',
    name: 'Days since Letter of Joining submitted',
    shortName: 'Days since LOJ',
    type: 'operational',
    unit: 'days',
    target: 0,
    current: 47,
    trend: 'flat',
    description: 'Elapsed days since the LOJ was submitted — used to track 90-day PDSA pacing.',
  },
]

export const measuresForModule = (moduleId: ModuleId): Measure[] =>
  measures.filter(m => m.moduleId === moduleId)

/** Headline measure for a module — the first one. Used for compact
 *  module-card badges so users see signal at a glance. */
export const headlineMeasure = (moduleId: ModuleId): Measure | undefined => {
  const list = measuresForModule(moduleId)
  return list[0]
}

/** Rollup status for a single measure. */
export type MeasureStatus = 'on_target' | 'progressing' | 'lagging' | 'not_started' | 'flat'

export function statusFor(m: Measure): MeasureStatus {
  if (m.current === 0 && m.trend === 'flat') return 'not_started'
  // Higher-target measures: closer to target is better.
  // Days-since type measures use target = 0 as a "lower is better" signal.
  const ratio = m.target === 0 ? 1 - Math.min(m.current / 30, 1) : m.current / m.target
  if (ratio >= 0.85) return 'on_target'
  if (ratio >= 0.4) return 'progressing'
  if (m.trend === 'up' || m.trend === 'down') return 'progressing'
  if (m.trend === 'flat') return 'flat'
  return 'lagging'
}

export const STATUS_LABEL: Record<MeasureStatus, string> = {
  on_target: 'On target',
  progressing: 'Progressing',
  lagging: 'Lagging',
  not_started: 'Not started',
  flat: 'Flat',
}

export const STATUS_COLOR: Record<MeasureStatus, string> = {
  on_target: 'bg-green-pale text-green-deep',
  progressing: 'bg-blue-pale text-blue-mid',
  lagging: 'bg-red-pale text-red-mid',
  not_started: 'bg-gray-100-ban text-gray-400-ban',
  flat: 'bg-amber-pale text-amber-ban',
}
