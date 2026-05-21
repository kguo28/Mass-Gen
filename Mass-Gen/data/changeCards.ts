// Change Concept Card schema — v2.0 aligned with the Living Field Guide
// Change Concept Card Specification (Spark Networked Improvement, March 2026).
//
// Each card describes ONE change concept a care team adopts as a coherent
// unit. The Implementation App (ChangeCardApp.tsx) consumes the structured
// fields below to render the Assess → Plan → Test → Sustain workflow per
// the spec's Workflow Consumption Map.
//
// Three-layer architecture (per spec):
//   Platform Layer  — structural fields (Trigger/Actor/Action/Target/Timing
//                     grammar, measure structure). Reusable across networks.
//   Condition Layer — network-specific enums (CCM elements, workflow activities,
//                     equity-domain addenda). Configurable per network.
//   Change Concept  — actual content for one specific change concept.

// ───── Shared primitives kept from v1 (used inside appExtensions) ─────

export interface ReadinessItem {
  id: string
  text: string
  source?: string
}

export interface Barrier {
  id: string
  text: string
  strategies: number[]
  hideFor?: string[]
  autoFor?: string[]
}

// ───── Section 0: Card Header ─────────────────────────────────────

export type CcmElement =
  | 'delivery_system_wrd'        // Delivery System / Work Role Redesign
  | 'decision_support'           // Decision Support
  | 'cis_pop_mgmt'               // Clinical Information Systems & Population Management
  | 'self_mgmt_co_production'    // Self-Management Support / Co-Production
  | 'community_resources'        // Community Resources & Peer Supports
  | 'org_leadership'             // Organizational Leadership & Learning System

export const CCM_ELEMENT_LABEL: Record<CcmElement, string> = {
  delivery_system_wrd:     'Delivery System / Work Role Redesign',
  decision_support:        'Decision Support',
  cis_pop_mgmt:            'Clinical Information Systems & Population Management',
  self_mgmt_co_production: 'Self-Management Support / Co-Production',
  community_resources:     'Community Resources & Peer Supports',
  org_leadership:          'Organizational Leadership & Learning System',
}

export type EvidenceMaturity =
  | 'literature_supported'
  | 'locally_tested'
  | 'network_validated'
  | 'multi_network_replicated'

export const EVIDENCE_MATURITY_LABEL: Record<EvidenceMaturity, string> = {
  literature_supported:     'Literature-supported',
  locally_tested:           'Locally tested',
  network_validated:        'Network-validated',
  multi_network_replicated: 'Multi-network replicated',
}

export type ImplementationComplexity = 'starter' | 'standard' | 'advanced'

export const COMPLEXITY_LABEL: Record<ImplementationComplexity, string> = {
  starter:  'Starter',
  standard: 'Standard',
  advanced: 'Advanced',
}

export type CardStatus = 'draft' | 'in_review' | 'published' | 'deprecated'

export type RelatedCardRelation =
  | 'prerequisite' | 'companion' | 'alternative' | 'successor' | 'predecessor'

export interface RelatedCard {
  cardId: string                 // formal id of the related card
  relation: RelatedCardRelation
  note?: string
}

export interface CardHeader {
  /** Stable formal id: NETWORK-CCM-DOMAIN-### (e.g. BAN-WRD-PVP-001). Never changes. */
  cardId: string
  /** Short registry key used by changeCardRegistry lookup ('pvp'). */
  registryKey: string
  title: string
  conditionContext: string       // 'bipolar disorder' | 'cross-condition'
  primaryCcm: CcmElement
  /** Network-configurable list (Condition Layer). E.g. 'Routine monitoring'. */
  workflowActivities: string[]
  tags: string[]                 // 1–3 secondary tags
  evidenceMaturity: EvidenceMaturity
  implementationComplexity: ImplementationComplexity
  status: CardStatus
  facultyAuthor: { name: string; role: string }
  owner: { name: string; role: string }
  version: string
  lastUpdated: string            // YYYY-MM-DD
  relatedCards?: RelatedCard[]
  settingNotes?: string
}

// ───── Section 1: Aim & Rationale ─────────────────────────────────

export interface AimRationale {
  aim: string                    // 1–2 sentences
  mechanism: string              // 1–2 sentences — how it produces benefit
  evidenceNote?: string
}

// ───── Section 2: Care Change Specification ──────────────────────

export interface ActionStep {
  step: number
  action: string                 // verb + object
  artifact?: string              // artifact produced and where it lives
}

export interface CareChange {
  trigger: string
  actors: {
    primary: string              // one accountable role
    contributing?: string[]
  }
  actionSequence: ActionStep[]   // 3–7 steps
  target: string                 // denominator-ready
  timing: string                 // execution rule + cadence
  workflowLocation?: string
  exclusions?: string
}

// ───── Section 3: Definition of Done ─────────────────────────────
// 3–6 verifiable, artifact-located, measure-aligned criteria.
export type DefinitionOfDone = string[]

// ───── Section 4: Measures ────────────────────────────────────────

export type MeasureCadence = 'weekly' | 'monthly' | 'quarterly'
export type MeasureDataSource =
  | 'manual_audit' | 'registry' | 'ehr_report' | 'survey' | 'mixed'

export interface Measure {
  name: string
  numerator: string
  denominator: string
  cadence: MeasureCadence
  dataSource: MeasureDataSource
}

export interface StepIndicator extends Measure {
  forStep: number                // which action step from Section 2
}

export interface Measures {
  reliability: Measure[]         // 1–2 required
  fidelity: Measure[]            // 1 required
  stepIndicators?: StepIndicator[]
  outcome?: Measure[]
  balancing?: Measure[]
}

// ───── Section 5: Tools & Resources ───────────────────────────────

export type ToolType =
  | 'template' | 'checklist' | 'script' | 'report' | 'dashboard' | 'training_module'

export const TOOL_TYPE_LABEL: Record<ToolType, string> = {
  template:        'Template',
  checklist:       'Checklist',
  script:          'Script',
  report:          'Report',
  dashboard:       'Dashboard',
  training_module: 'Training micro-module',
}

export interface Tool {
  name: string
  type: ToolType
  link: string                   // URL | 'TBD' | 'to_be_developed'
  supportsSteps: number[]
}

export interface ToolsResources {
  tools: Tool[]
  trainingAids?: { name: string; link: string }[]
  exampleArtifacts?: { name: string; link: string }[]
}

// ───── Section 6: Implementation Notes ───────────────────────────

export interface ImplementationNotes {
  prerequisites: ReadinessItem[]  // 1–5 — was v1 card.readiness
  commonPitfalls: string[]        // 2–4
  adaptationsAllowed?: string
  escalationRules?: string
}

// ───── Section 7: Equity & Safety ─────────────────────────────────

export interface EquitySafety {
  equityCheck: {
    text: string
    suggestedStratifiers: string[]
  }
  safetyCheck: string
  /** BAN Condition-Layer addenda. Other networks define their own. */
  banAddenda?: {
    moodStateDifferential: string
    medicationSafety: string
    accessEquity: string
  }
}

// ───── Section 8: Lifecycle & Governance ─────────────────────────

export interface Lifecycle {
  publicationRule: string
  deprecationRule: string
  reviewCadence: string
}

// ───── Implementation App extensions (not in v2 spec) ────────────
// These power the Wayfinder's Assess → Plan → Test → Sustain UX
// beyond what the spec captures (barriers checklist, PDSA seed,
// team-composition variants, renderer labels).

export type TeamType = 'clinical' | 'admin' | 'solo' | 'other'

export interface AppExtensions {
  barriers: Record<string, Barrier[]>
  strategies: Record<number, { name: string; desc: string }>
  firstPDSA: {
    actionSteps: string[]
    soloVariant: string
    adminVariant: string
  }
  patientCounts: Record<TeamType, { suggested: number; range: string; hint: string }>
  sustainabilityThreats: { id: string; text: string }[]
  sustainabilityChecklist: string[]
  /** Renderer labels — replaces hardcoded PVP strings in ChangeCardApp. */
  labels: {
    /** Used in: "Who does {prepRoleLabel}?" e.g. "PVP prep" / "registry curation" */
    prepRoleLabel: string
    /** Used in Test phase: "Track {unitLabel} for each visit." */
    unitLabel: string
    /** Used in workflow baseline: "describe how visits happen now — {baselinePromptHook}" */
    baselinePromptHook: string
    /** Used in PDSA prediction placeholder. */
    predictionExample: string
  }
}

// ───── Top-level Change Card ──────────────────────────────────────

export interface ChangeCard {
  header:              CardHeader
  aimRationale:        AimRationale
  careChange:          CareChange
  definitionOfDone:    DefinitionOfDone
  measures:            Measures
  toolsResources:      ToolsResources
  implementationNotes: ImplementationNotes
  equitySafety:        EquitySafety
  lifecycle:           Lifecycle
  appExtensions:       AppExtensions
}

// ═══════════════════════════════════════════════════════════════════
// PVP — Pre-Visit Planning Change Concept Card
// Card ID: BAN-WRD-PVP-001
// ═══════════════════════════════════════════════════════════════════

export const pvpCard: ChangeCard = {
  header: {
    cardId: 'BAN-WRD-PVP-001',
    registryKey: 'pvp',
    title: 'Conduct structured pre-visit planning before scheduled visits',
    conditionContext: 'bipolar disorder',
    primaryCcm: 'delivery_system_wrd',
    workflowActivities: ['Routine monitoring', 'Treatment optimization', 'Follow-up/coordination'],
    tags: ['pre-visit planning', 'care coordination', 'population management'],
    evidenceMaturity: 'literature_supported',
    implementationComplexity: 'standard',
    status: 'draft',
    facultyAuthor: { name: 'Peter Margolis, MD, PhD', role: 'Spark Networked Improvement' },
    owner:         { name: 'BAN Clinical Faculty',     role: 'BAN' },
    version: 'v2.0',
    lastUpdated: '2026-03-15',
    relatedCards: [
      { cardId: 'BAN-CIS-REG-001', relation: 'prerequisite', note: 'Minimum registry dataset' },
    ],
    settingNotes:
      'Outpatient psychiatry; may require adaptation for telehealth-heavy practices or solo practitioners without staff.',
  },

  aimRationale: {
    aim: "Improve visit quality and care gap closure for patients with bipolar disorder by ensuring clinicians enter each visit with a structured review of the patient's current status, recent data, and outstanding needs.",
    mechanism:
      'Planned interactions replace reactive visits. When clinicians review data before the encounter, they identify gaps that would otherwise be missed, enabling proactive care.',
    evidenceNote:
      'Pre-visit planning is a foundational element of the Chronic Care Model (Wagner et al.) and has demonstrated impact on guideline adherence and care gap closure across multiple chronic conditions.',
  },

  careChange: {
    trigger: '24–72 hours before a scheduled follow-up visit for a registered bipolar patient.',
    actors: {
      primary: 'PVP lead (clinical support staff where available; clinician in solo practice)',
      contributing: ['Treating clinician (reviews summary at visit start)', 'Front desk (confirms appointment + flags no-shows)'],
    },
    actionSequence: [
      { step: 1, action: 'Generate standardized PVP summary (current meds, last contact, latest PROs/MBC, care gaps, phase-specific checklist)', artifact: 'PVP summary in standard EHR location' },
      { step: 2, action: 'Review summary and identify care gaps (missing labs, low drug levels, overdue PROs)',                                    artifact: 'Gap list with owner + due date' },
      { step: 3, action: 'Conduct brief team huddle for flagged patients (where team composition allows)',                                          artifact: 'Documented plan in EHR note' },
      { step: 4, action: 'Execute follow-up actions for identified gaps within agreed window',                                                     artifact: 'Closed-loop documentation' },
    ],
    target: 'All scheduled follow-up visits for patients in the bipolar registry.',
    timing: 'Produce PVP summary 24–72h before visit; review at visit start; execute follow-ups within 72h post-visit.',
    workflowLocation: 'Pre-visit preparation window; visit-day huddle; post-visit follow-up.',
    exclusions: 'New-patient intakes (different workflow); urgent/crisis visits.',
  },

  definitionOfDone: [
    'PVP summary is available ≥24h before visit in the standard EHR location and acknowledged by the clinician at visit start.',
    'Summary includes current meds, last contact, latest PROs/MBC, and identified care gaps.',
    'Each identified gap has an owner and due-by date.',
    'Brief huddle is documented for flagged patients (or self-review note for solo practitioners).',
    'Follow-up actions are closed within the agreed window.',
  ],

  measures: {
    reliability: [
      {
        name: 'PVP completion rate',
        numerator: 'Eligible visits with a PVP summary acknowledged at visit start',
        denominator: 'All eligible scheduled visits',
        cadence: 'weekly',
        dataSource: 'manual_audit',
      },
    ],
    fidelity: [
      {
        name: 'PVP summary completeness',
        numerator: 'PVP summaries containing all required fields (meds, last contact, latest PRO, care gaps)',
        denominator: 'All PVP summaries produced',
        cadence: 'weekly',
        dataSource: 'manual_audit',
      },
    ],
    stepIndicators: [
      {
        name: 'PVP summary timeliness',
        numerator: 'Summaries generated ≥24h before visit',
        denominator: 'All PVP summaries produced',
        cadence: 'weekly',
        dataSource: 'manual_audit',
        forStep: 1,
      },
    ],
    outcome: [
      {
        name: 'Care gap closure rate',
        numerator: 'Identified care gaps closed within 30 days',
        denominator: 'All identified care gaps',
        cadence: 'monthly',
        dataSource: 'registry',
      },
    ],
    balancing: [
      {
        name: 'PVP prep time',
        numerator: 'Minutes spent on PVP prep per patient',
        denominator: 'Patients with PVP completed',
        cadence: 'monthly',
        dataSource: 'survey',
      },
    ],
  },

  toolsResources: {
    tools: [
      { name: 'PVP summary template',    type: 'template',  link: 'TBD', supportsSteps: [1] },
      { name: 'Care gap report',         type: 'report',    link: 'TBD', supportsSteps: [2] },
      { name: 'PVP huddle script',       type: 'script',    link: 'TBD', supportsSteps: [3] },
      { name: 'PVP reliability tracker', type: 'dashboard', link: 'TBD', supportsSteps: [1, 2, 3, 4] },
    ],
    trainingAids: [
      { name: 'PVP role guide (1-pager)', link: 'TBD' },
    ],
    exampleArtifacts: [
      { name: 'Sample completed PVP summary', link: 'TBD' },
    ],
  },

  implementationNotes: {
    prerequisites: [
      { id: 'R1', text: 'Minimum registry dataset is reliable for PVP fields (current meds, last contact, PROs/MBC metrics, care gaps)', source: 'Card prerequisite #1' },
      { id: 'R2', text: 'Agreed care components and phase-specific checklists exist; eligible visits have been defined',                  source: 'Card prerequisite #2' },
      { id: 'R3', text: 'Consult triggers and response pathway for complex cases are established',                                        source: 'Card prerequisite #3' },
      { id: 'R4', text: 'At least one person is identified to lead this implementation effort',                                            source: 'Card strategy #2' },
      { id: 'R5', text: 'Leadership is aware this change is being planned',                                                                source: 'Card strategy #4' },
    ],
    commonPitfalls: [
      'Teams try to do PVP for all patients from day one instead of starting with 2–3.',
      'The huddle expands to 30 minutes and becomes unsustainable.',
      'Nobody owns follow-up on identified gaps — they get logged but never closed.',
      'Solo practices skip PVP entirely instead of adopting the self-review variant.',
    ],
    adaptationsAllowed:
      'The specific data elements in the PVP summary can be customized to local EHR capabilities, as long as the summary includes at minimum: current meds, last PRO score, and care gaps.',
    escalationRules: 'Consult BAN QI coach when reliability stays below 50% after 3 PDSA cycles.',
  },

  equitySafety: {
    equityCheck: {
      text: 'Patients seen only via telehealth may not have lab results available for the PVP summary; PVP completion may be lower for these patients.',
      suggestedStratifiers: ['visit modality (in-person vs telehealth)', 'insurance type', 'race/ethnicity'],
    },
    safetyCheck:
      'PVP summary should surface medication safety flags (lithium levels, metabolic screening due) so they are not missed in the encounter.',
    banAddenda: {
      moodStateDifferential:
        'Patients in acute mania or severe depression may not benefit from data-driven planning if the encounter must prioritize stabilization. Flag and adapt.',
      medicationSafety:
        'PVP summary must include due-date for lithium level, metabolic panel, and any other med-specific monitoring per BAN protocol.',
      accessEquity:
        'For patients without stable housing or telehealth-only access, ensure follow-up actions account for what is feasible for the patient.',
    },
  },

  lifecycle: {
    publicationRule: 'Published status requires faculty author approval.',
    deprecationRule: 'Do not delete. Mark Deprecated with rationale + successor card ID(s).',
    reviewCadence:   'Annual; or when outcome data shows significant shift.',
  },

  // ───── App extensions — Wayfinder rendering state ──────────────
  appExtensions: {
    barriers: {
      'Workflow & Time': [
        { id: 'W1', text: 'No protected time for pre-visit chart review', strategies: [1, 3, 4] },
        { id: 'W2', text: 'Visit schedule too compressed for structured planning', strategies: [1, 4] },
        { id: 'W3', text: 'Competing demands on staff who would do PVP preparation', strategies: [1, 4], hideFor: ['solo'] },
        { id: 'W4', text: 'No standard protocol for what to review before a visit', strategies: [1, 3] },
        { id: 'W5', text: "Current workflow not documented — no shared understanding of how visits happen now", strategies: [1, 3] },
        { id: 'W6', text: "Process improvement time seen as 'wasted time' away from clinical care", strategies: [2, 4] },
        { id: 'W7', text: 'Tendency to prioritize immediate clinical demands over planning activities', strategies: [1, 3] },
      ],
      'Data & Information': [
        { id: 'D1', text: 'Cannot access patient data before the visit (EHR/registry limitation)', strategies: [3] },
        { id: 'D2', text: 'Registry data not reliable enough to populate PVP fields', strategies: [3] },
        { id: 'D3', text: 'No measurement-based care (PROs/MBC) data available', strategies: [2, 3] },
        { id: 'D4', text: 'Lab results not consistently available before visits', strategies: [1, 3] },
        { id: 'D5', text: 'Outcome measures seem foreign, intrusive, or irrelevant to the clinical process', strategies: [2] },
        { id: 'D6', text: 'No mechanism to share PVP summary across providers — typing into EHR notes is insufficient', strategies: [3] },
        { id: 'D7', text: 'Support for generating data reports difficult to obtain', strategies: [2, 4] },
        { id: 'D8', text: 'Information systems not set up to produce team-level or panel-level views', strategies: [3, 4] },
      ],
      'Team & Roles': [
        { id: 'T1', text: 'Solo or near-solo practice — no other staff to share PVP tasks with', strategies: [1, 3], autoFor: ['solo', 'admin'] },
        { id: 'T2', text: 'Role ambiguity — unclear who does what in PVP process', strategies: [1], hideFor: ['solo'] },
        { id: 'T3', text: 'Provider resistance to workflow change', strategies: [2, 4] },
        { id: 'T4', text: 'No identified internal champion for this change', strategies: [2] },
        { id: 'T6', text: 'Staff have multiple supervisors with differing expectations for their time', strategies: [1, 4], hideFor: ['solo', 'admin'] },
        { id: 'T9', text: 'Support staff (receptionist, scheduler) shared across providers or clinics', strategies: [1, 4], hideFor: ['solo'] },
      ],
      'Patient & Clinical Complexity': [
        { id: 'P1', text: "Patients don't engage with pre-visit materials or preparation", strategies: [2, 3] },
        { id: 'P2', text: 'Mood state instability complicates planning — patient may present differently than data suggest', strategies: [1, 3] },
        { id: 'P3', text: 'Patients not accustomed to structured visit preparation', strategies: [2, 3] },
        { id: 'P4', text: 'Clinical guidelines feel inapplicable to complex, real-world patients', strategies: [2] },
        { id: 'P5', text: 'Matching patient needs to appropriate phase-specific checklist is unclear', strategies: [1, 2] },
      ],
      'Organizational & Leadership': [
        { id: 'O1', text: 'Leadership unaware of or unsupportive of PVP initiative', strategies: [4] },
        { id: 'O2', text: 'Insurance/billing concerns about pre-visit preparation time', strategies: [4] },
      ],
    },

    strategies: {
      1: { name: 'Role & Care Process Clarification', desc: 'Map workflow, define lead, specify ownership of each PVP step' },
      2: { name: 'Implementation Facilitation', desc: 'External-internal dyad: network QI coach + site facilitator for support and problem-solving' },
      3: { name: 'QI Testing & Iteration', desc: 'Start small (2-5 patients), focus on few elements, brief huddles/self-review, expand as reliability grows' },
      4: { name: 'Leadership Alignment', desc: 'Clinic endorsement, quality priorities, protected or billable PVP time' },
    },

    firstPDSA: {
      actionSteps: [
        'Generate a standardized PVP summary (PROs/MBC metrics, current meds, last contact, care gaps) with phase-specific checklist — 24-72 hours before the visit',
        'Review data, identify care gaps (missing labs, low drug levels), assign owners and next actions — at visit start',
      ],
      soloVariant: 'As a solo practitioner, PVP prep and review both fall to you. The goal is a structured self-review process replacing ad-hoc chart glances. Consider whether your receptionist can pull standardized data (last labs, appointment history) before you do the clinical review.',
      adminVariant: 'Your receptionist or scheduler may be able to handle specific non-clinical PVP prep tasks: pulling last labs, printing appointment history, flagging overdue items from a checklist. The clinical review and care gap identification remain with you.',
    },

    patientCounts: {
      clinical: { suggested: 5, range: '3-5', hint: 'With clinical support staff, 5 patients is a good first test — enough to learn patterns without overwhelming the workflow.' },
      admin:    { suggested: 3, range: '2-4', hint: 'With administrative-only support, start with 3 patients. Your receptionist can help with non-clinical prep, but the review falls to you.' },
      solo:     { suggested: 2, range: '2-3', hint: 'As a solo practitioner, start with 2 patients. Focus on making the self-review process sustainable before scaling.' },
      other:    { suggested: 3, range: '2-5', hint: 'Adjust based on your available support. Fewer patients = deeper learning per visit.' },
    },

    sustainabilityThreats: [
      { id: 'S1', text: "Staff turnover — key person leaves, temptation to revert to 'business as usual'" },
      { id: 'S2', text: 'Competing organizational priorities displace PVP effort' },
      { id: 'S3', text: 'Registry or EHR system changes break PVP workflow' },
      { id: 'S4', text: 'Process owner transitions out — no one tracks review schedule' },
      { id: 'S5', text: 'Time-sensitive crises repeatedly pre-empt scheduled process reviews' },
      { id: 'S6', text: "Initial implementation 'dip' in satisfaction discourages continued effort" },
      { id: 'S7', text: "Team stops self-assessing — considers the process 'set' and no longer in need of review" },
      { id: 'S8', text: 'Backup coverage not trained — PVP breaks when primary person is out' },
    ],

    sustainabilityChecklist: [
      'Document the standard PVP process (who, what, when) in a shareable format',
      'Train backup staff (or document self-review protocol for solo practice)',
      'Set up ongoing measurement — weekly reliability check',
      'Schedule 30-day review to assess sustainability',
      'Share expedition results with the BAN network',
    ],

    labels: {
      prepRoleLabel: 'PVP prep',
      unitLabel: 'PVP completion',
      baselinePromptHook: 'before any PVP change',
      predictionExample: 'e.g. We predict PVP will reduce care gaps by 20% but prep time will exceed 10 min...',
    },
  },
}
