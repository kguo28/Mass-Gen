import type { ModuleId } from './modules'

export type ReadinessLevel = 'opening' | 'building' | 'strong'

export interface ReadinessDomain {
  id: string
  name: string
  prompt: string
  levels: Record<ReadinessLevel, string>
}

export const READINESS_INTRO = `The readiness check is a structured 25-minute conversation across seven domains. Each domain has three levels — Opening, Building, or Strong. There are no wrong answers; the point is to surface where your site is right now so the orientation arc and module suggestions can meet you there.`

export const readinessDomains: ReadinessDomain[] = [
  {
    id: 'leadership',
    name: 'Leadership engagement',
    prompt: 'Is there institutional commitment to this work above the clinical team?',
    levels: {
      opening: 'Interested individuals, no formal sponsor yet.',
      building: 'A leader is engaged and tracking; resources are tentative.',
      strong: 'Named senior sponsor; resources allocated; visible commitment.',
    },
  },
  {
    id: 'team',
    name: 'Team formation',
    prompt: 'Is there a multi-disciplinary team in place to do the work?',
    levels: {
      opening: 'A single clinician carrying it; no team yet.',
      building: 'Champion plus 1–2 partners; roles informal.',
      strong: 'Full team with defined roles, including a dedicated improvement coordinator.',
    },
  },
  {
    id: 'data',
    name: 'Data infrastructure',
    prompt: 'Can your team see the bipolar population and track outcomes today?',
    levels: {
      opening: 'No registry; data lives in clinical notes only.',
      building: 'Lists exist (spreadsheets / EHR queries); not yet routine.',
      strong: 'Working registry with consistent updates and routine reporting.',
    },
  },
  {
    id: 'qi_capacity',
    name: 'QI capacity',
    prompt: 'Has your team done improvement work together before?',
    levels: {
      opening: 'No prior QI experience as a team.',
      building: 'Some members trained; have run 1–2 small tests.',
      strong: 'Established QI rhythm; comfortable with PDSA cycles and measurement.',
    },
  },
  {
    id: 'patient_partnership',
    name: 'Patient & family partnership',
    prompt: 'Are patients and families involved in shaping how your practice works?',
    levels: {
      opening: 'No formal patient/family involvement.',
      building: 'Informal input from individuals; no structured partnership.',
      strong: 'Patient & Family Partners embedded in planning and review.',
    },
  },
  {
    id: 'workflow',
    name: 'Clinical workflow flexibility',
    prompt: 'How much capacity do you have to change clinical workflow now?',
    levels: {
      opening: 'Workflow is rigid; changes require many approvals.',
      building: 'Some openness to test small workflow changes.',
      strong: 'Team can pilot workflow changes within weeks; iteration is normal.',
    },
  },
  {
    id: 'financial',
    name: 'Financial sustainability',
    prompt: 'Is there a path for the work to be financially sustainable at your site?',
    levels: {
      opening: 'Unclear; no billing or revenue model identified yet.',
      building: 'Exploring PCM codes / grant funding; nothing committed.',
      strong: 'Aligned billing or funding in place to cover the work.',
    },
  },
]

export const LEVEL_LABEL: Record<ReadinessLevel, string> = {
  opening: 'Opening',
  building: 'Building',
  strong: 'Strong',
}

export interface SuggestionRule {
  match: (levels: Record<string, ReadinessLevel>) => boolean
  modules: ModuleId[]
  rationale: string
}

// Source: BAN Orientation Arc Review (Apr 2026), suggestion-logic table.
// Order matters — first matching rule wins. Final fallback returns the
// generic "two modules at most" suggestion to keep the screen usable.
export const suggestionRules: SuggestionRule[] = [
  {
    match: l => l.leadership === 'building' && l.team === 'opening' && l.data === 'opening',
    modules: ['leadership'],
    rationale: 'Address the upstream constraint — leadership engagement — before adding clinical work.',
  },
  {
    match: l => l.leadership === 'strong' && l.team === 'opening' && l.data === 'opening',
    modules: ['population_registry', 'leadership'],
    rationale: 'Build the foundation and the institutional support before any clinical workflow change.',
  },
  {
    match: l => l.leadership === 'strong' && l.team === 'strong' && l.data !== 'strong',
    modules: ['pvp', 'population_registry'],
    rationale: 'Build the data foundation while creating immediate visible clinical work.',
  },
  {
    match: l => l.leadership === 'strong' && l.team === 'strong' && l.data === 'strong',
    modules: ['pvp', 'mbc'],
    rationale: 'Move directly into clinical practice change with measurement supporting it.',
  },
]

export function suggestModules(levels: Record<string, ReadinessLevel>): {
  modules: ModuleId[]
  rationale: string
} {
  for (const rule of suggestionRules) {
    if (rule.match(levels)) return { modules: rule.modules, rationale: rule.rationale }
  }
  // Default: clinical workflow + data
  return {
    modules: ['pvp', 'population_registry'],
    rationale: 'Build the data foundation while creating immediate visible clinical work.',
  }
}

export function buildSynthesis(
  levels: Record<string, ReadinessLevel>,
  notes: Record<string, string>,
): string {
  const buckets: Record<ReadinessLevel, string[]> = { opening: [], building: [], strong: [] }
  readinessDomains.forEach(d => {
    const lvl = levels[d.id]
    if (lvl) buckets[lvl].push(d.name.toLowerCase())
  })
  const parts: string[] = []
  if (buckets.strong.length) parts.push(`Strong ${buckets.strong.join(', ')}`)
  if (buckets.building.length) parts.push(`building ${buckets.building.join(', ')}`)
  if (buckets.opening.length) parts.push(`opening ${buckets.opening.join(', ')}`)
  const body = parts.length ? parts.join('; ') + '.' : 'Profile not yet generated.'
  const notesPicked = Object.entries(notes)
    .map(([id, txt]) => txt.trim() ? `${readinessDomains.find(d => d.id === id)?.name}: ${txt.trim()}` : '')
    .filter(Boolean)
  const noteLine = notesPicked.length ? ` Team-stated context: ${notesPicked.join(' / ')}.` : ''
  return body + noteLine
}
