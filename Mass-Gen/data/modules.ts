import type { CcmComponentId } from './ccmComponents'

export type ModuleId =
  | 'leadership'
  | 'aligned_payment'
  | 'pvp'
  | 'population_mgmt'
  | 'mbc'
  | 'population_registry'
  | 'outcome_tracking'
  | 'site_onboarding'

export type ModuleState = 'preparing' | 'practicing' | null

/** Module *kind* — what content type this module represents. The Platform
 *  layer routes module-card clicks by `unitType`, not by kind, so adding
 *  new kinds doesn't require routing changes — only categorization changes. */
export type ModuleKind = 'clinical' | 'operational'

/** Module *unit type* — which UI shape the module's unit uses. Add new
 *  values here as new unit patterns land in the Platform layer
 *  (e.g. survey, structured-conversation, course). */
export type ModuleUnitType = 'change_card' | 'phase_navigator' | 'none'

export interface FoundationalModule {
  id: ModuleId
  name: string
  ccmComponent?: CcmComponentId
  oneLiner: string
  kind: ModuleKind
  unitType: ModuleUnitType
  /** When unitType === 'change_card', the id into changeCardRegistry. */
  changeCardId?: string
  /** Always-present modules render on the Hub regardless of arc selection
   *  (e.g. site onboarding — every site does it). */
  alwaysPresent?: boolean
}

export const foundationalModules: FoundationalModule[] = [
  {
    id: 'leadership',
    name: 'Leadership engagement',
    ccmComponent: 'hco',
    oneLiner: 'Securing sustained leadership sponsorship and a visible institutional commitment to the work.',
    kind: 'clinical',
    unitType: 'none',
  },
  {
    id: 'aligned_payment',
    name: 'Aligned payment',
    ccmComponent: 'hco',
    oneLiner: 'Capturing Principal Care Management codes (and the related behavioral health integration billing) so the work is financially sustainable for a dyadic psychiatric practice.',
    kind: 'clinical',
    unitType: 'none',
  },
  {
    id: 'pvp',
    name: 'Pre-visit planning',
    ccmComponent: 'work_role',
    oneLiner: 'Routinely preparing for each visit so the team enters the room knowing what matters most for this patient today.',
    kind: 'clinical',
    unitType: 'change_card',
    changeCardId: 'pvp',
  },
  {
    id: 'population_mgmt',
    name: 'Population management',
    ccmComponent: 'work_role',
    oneLiner: 'Working proactively across the whole bipolar panel — not only the patients who happen to call.',
    kind: 'clinical',
    unitType: 'none',
  },
  {
    id: 'mbc',
    name: 'Measurement-based care',
    ccmComponent: 'decision_support',
    oneLiner: 'Using consistent, repeated measures of mood and function to drive treatment decisions in real time.',
    kind: 'clinical',
    unitType: 'none',
  },
  {
    id: 'population_registry',
    name: 'Population registry',
    ccmComponent: 'info_mgmt',
    oneLiner: 'Standing up a bipolar registry so the team can see and act on the whole population at once.',
    kind: 'clinical',
    unitType: 'none',
  },
  {
    id: 'outcome_tracking',
    name: 'Outcome tracking',
    ccmComponent: 'info_mgmt',
    oneLiner: 'Tracking clinical and functional outcomes over time so improvement is visible and shared.',
    kind: 'clinical',
    unitType: 'none',
  },
  {
    id: 'site_onboarding',
    name: 'Site onboarding',
    oneLiner: 'The operational module: PDUA, IRB, Phlox/Hive setup, team formation. Runs alongside whichever clinical modules a site picks.',
    kind: 'operational',
    unitType: 'phase_navigator',
    alwaysPresent: true,
  },
]

export const findModule = (id: ModuleId) =>
  foundationalModules.find(m => m.id === id)

export const clinicalModules = foundationalModules.filter(m => m.kind === 'clinical')
export const operationalModules = foundationalModules.filter(m => m.kind === 'operational')
