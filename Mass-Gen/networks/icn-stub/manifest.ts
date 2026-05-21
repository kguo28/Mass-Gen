import type { NetworkBundle } from '../types'
import type { ClinicalElement } from '@/data/clinicalElements'
import type { CcmComponent } from '@/data/ccmComponents'
import type { FoundationalModule, ModuleId } from '@/data/modules'
import type { ReadinessDomain, SuggestionRule } from '@/data/readinessDomains'
import type { Measure } from '@/data/measures'
import type { CrossCuttingTheme } from '@/data/crossCutting'

/** ICN Pediatric IBD — STUB manifest to prove the skeleton generalizes.
 *
 *  This is intentionally minimal: 4 clinical elements, 2 modules, 1
 *  measure each. Enough to demonstrate the Platform layer renders
 *  without BAN-specific assumptions when ?network=icn-stub is set.
 *
 *  TYPE NOTE: NetworkBundle's `modules` and `measures` reference the
 *  BAN-side ModuleId union — that's the Step 13 limitation flagged in
 *  the README. To support arbitrarily-named modules per network, the
 *  next refactor widens ModuleId to `string` (or a per-network branded
 *  string). For now ICN reuses two BAN module ids to validate the
 *  swap mechanism end-to-end. */

const clinicalElements: ClinicalElement[] = [
  { n: 1, name: 'Diagnostic confirmation', description: 'Endoscopic + histologic confirmation of IBD subtype; distinguishing Crohn\'s vs. UC vs. unclassified.' },
  { n: 2, name: 'Disease activity monitoring', description: 'Consistent use of pediatric activity indices (PCDAI, PUCAI) and biomarkers (CRP, calprotectin) over time.' },
  { n: 3, name: 'Growth & nutritional monitoring', description: 'Tracking growth velocity, BMI, micronutrient status, and intervening when growth falters.' },
  { n: 4, name: 'Transition to adult care', description: 'Structured preparation and handoff to adult GI between ages 16–22.' },
]

const ccmComponents: CcmComponent[] = [
  {
    id: 'hco',
    name: 'Health care organization',
    moduleIds: ['leadership'],
    note: 'Sponsorship from pediatric GI division and hospital leadership.',
  },
  {
    id: 'work_role',
    name: 'Work role design',
    moduleIds: ['pvp'],
    note: 'Multidisciplinary visit workflow including dietitian + nurse navigator.',
  },
  { id: 'community',        name: 'Community resources and policies', moduleIds: [], note: 'School plans + family education resources develop alongside foundational work.' },
  { id: 'decision_support', name: 'Provider decision support',        moduleIds: [], note: 'Pediatric IBD treat-to-target guidelines integrated into care pathway.' },
  { id: 'info_mgmt',        name: 'Information management',           moduleIds: [], note: 'Pediatric IBD registry — stub network only models 2 modules.' },
  { id: 'self_mgmt',        name: 'Patient self-management support',  moduleIds: [], note: 'Addressed via cross-cutting youth-and-family partnership theme.' },
]

const modules: FoundationalModule[] = [
  {
    id: 'leadership',
    name: 'Pediatric GI leadership engagement',
    ccmComponent: 'hco',
    oneLiner: 'Sustained sponsorship from pediatric GI division and hospital leadership for the IBD QI work.',
    kind: 'clinical',
    unitType: 'none',
  },
  {
    id: 'pvp',
    name: 'Pediatric multidisciplinary pre-visit planning',
    ccmComponent: 'work_role',
    oneLiner: 'Prep before each pediatric IBD visit so nurse, dietitian, and clinician arrive aligned on the patient\'s growth, disease activity, and family questions.',
    kind: 'clinical',
    unitType: 'change_card',
    changeCardId: 'pvp',
  },
  {
    id: 'site_onboarding',
    name: 'Site onboarding (ICN)',
    oneLiner: 'ICN-specific operational onboarding: data agreement, IRB, registry access. Always present.',
    kind: 'operational',
    unitType: 'phase_navigator',
    alwaysPresent: true,
  } as FoundationalModule,
]

const readinessDomains: ReadinessDomain[] = [
  {
    id: 'leadership',
    name: 'Pediatric GI leadership',
    prompt: 'Is the pediatric GI division leadership committed to this work?',
    levels: {
      opening: 'Individual interest, no formal sponsor.',
      building: 'Section chief engaged; resources tentative.',
      strong: 'Named division sponsor; protected time allocated.',
    },
  },
  {
    id: 'team',
    name: 'Multidisciplinary team',
    prompt: 'Is the clinical team multidisciplinary (clinician + nurse + dietitian)?',
    levels: {
      opening: 'Provider alone.',
      building: 'Provider + nurse; intermittent dietitian.',
      strong: 'Full team co-located and meeting regularly.',
    },
  },
]

const suggestionRules: SuggestionRule[] = [
  {
    match: () => true,
    modules: ['pvp', 'leadership'] as ModuleId[],
    rationale: 'Stub network only models two clinical modules; both are suggested by default.',
  },
]

const measures: Measure[] = [
  {
    id: 'icn_pvp_completion',
    moduleId: 'pvp',
    name: 'Multidisciplinary PVP rate',
    shortName: 'MD PVP %',
    type: 'process',
    unit: '%',
    target: 75,
    current: 12,
    trend: 'up',
    description: '% of pediatric IBD visits where multidisciplinary PVP occurred.',
  },
  {
    id: 'icn_leadership_review',
    moduleId: 'leadership',
    name: 'Pediatric GI leadership review cadence',
    shortName: 'Reviews/qtr',
    type: 'operational',
    unit: 'count/quarter',
    target: 4,
    current: 1,
    trend: 'up',
  },
]

const crossCuttingThemes: CrossCuttingTheme[] = [
  { id: 'youth_family_partnership', name: 'Youth & family partnership', blurb: 'Youth and families shape how care happens, in every region.' },
  { id: 'measurement_learning',     name: 'Measurement & learning',     blurb: 'Consistent pediatric IBD measures and shared learning across ICN sites.' },
  { id: 'network_citizenship',      name: 'Network citizenship',        blurb: 'Sites both learn from and contribute to ICN.' },
]

export const icnStubNetwork: NetworkBundle = {
  id: 'icn-stub',
  name: 'Improving Care for Children Network (stub)',
  tagline: 'Pediatric IBD — STUB network demonstrating Platform-layer reuse',
  welcomeBody:
    "ICN is a stub network used to prove the Platform layer can render a different clinical condition with no skeleton changes. Pediatric IBD is the demonstration content; only two clinical modules and one measure each are modeled.",
  clinicalElements,
  ccmComponents,
  modules,
  readinessDomains,
  suggestionRules,
  measures,
  crossCuttingThemes,
  workflowActivities: [
    'Diagnostic confirmation',
    'Disease activity monitoring',
    'Growth & nutritional monitoring',
    'Transition to adult care',
  ],
  chatPromptBlock: `Network: ICN — Improving Care for Children Network (STUB demo network).
Clinical area: pediatric inflammatory bowel disease (IBD).

The clinical care elements (4 in the stub):
1. Diagnostic confirmation (endoscopy + histology; subtype determination)
2. Disease activity monitoring (PCDAI/PUCAI + CRP/calprotectin)
3. Growth & nutritional monitoring (growth velocity, BMI, intervention when growth falters)
4. Transition to adult care (structured handoff age 16–22)

Modeled modules (stub only):
- Pediatric GI leadership engagement
- Pediatric multidisciplinary pre-visit planning (uses PVP Change Card scaffold)

This is a DEMONSTRATION network. If asked about ICN-specifics not above, say the stub network only models a subset and direct to the BAN demo for a fuller example.`,
}
