export interface ReadinessItem { id: string; text: string; source: string }

export interface Barrier {
  id: string
  text: string
  strategies: number[]
  hideFor?: string[]
  autoFor?: string[]
}

export interface ChangeCard {
  id: string
  name: string
  ccmComponent: string
  changeConcept: string
  readiness: ReadinessItem[]
  barriers: Record<string, Barrier[]>
  strategies: Record<number, { name: string; desc: string }>
  firstPDSA: { actionSteps: string[]; soloVariant: string; adminVariant: string }
  patientCounts: Record<string, { suggested: number; range: string; hint: string }>
  sustainabilityThreats: { id: string; text: string }[]
  sustainabilityChecklist: string[]
}

export const pvpCard: ChangeCard = {
  id: 'pvp',
  name: 'Pre-Visit Planning',
  ccmComponent: 'Work Role Redesign',
  changeConcept: 'Use planned interactions to support evidence-based care',

  readiness: [
    { id: 'R1', text: 'Minimum registry dataset is reliable for PVP fields (current meds, last contact, PROs/MBC metrics, care gaps)', source: 'Card prerequisite #1' },
    { id: 'R2', text: 'Agreed care components and phase-specific checklists exist; \'eligible visits\' have been defined', source: 'Card prerequisite #2' },
    { id: 'R3', text: 'Consult triggers and response pathway for complex cases are established', source: 'Card prerequisite #3' },
    { id: 'R4', text: 'At least one person is identified to lead this implementation effort', source: 'Card strategy #2' },
    { id: 'R5', text: 'Leadership is aware this change is being planned', source: 'Card strategy #4' },
  ],

  barriers: {
    'Workflow & Time': [
      { id: 'W1', text: 'No protected time for pre-visit chart review', strategies: [1, 3, 4] },
      { id: 'W2', text: 'Visit schedule too compressed for structured planning', strategies: [1, 4] },
      { id: 'W3', text: 'Competing demands on staff who would do PVP preparation', strategies: [1, 4], hideFor: ['solo'] },
      { id: 'W4', text: 'No standard protocol for what to review before a visit', strategies: [1, 3] },
      { id: 'W5', text: 'Current workflow not documented — no shared understanding of how visits happen now', strategies: [1, 3] },
      { id: 'W6', text: 'Process improvement time seen as \'wasted time\' away from clinical care', strategies: [2, 4] },
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
      { id: 'P1', text: 'Patients don\'t engage with pre-visit materials or preparation', strategies: [2, 3] },
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
    { id: 'S1', text: 'Staff turnover — key person leaves, temptation to revert to \'business as usual\'' },
    { id: 'S2', text: 'Competing organizational priorities displace PVP effort' },
    { id: 'S3', text: 'Registry or EHR system changes break PVP workflow' },
    { id: 'S4', text: 'Process owner transitions out — no one tracks review schedule' },
    { id: 'S5', text: 'Time-sensitive crises repeatedly pre-empt scheduled process reviews' },
    { id: 'S6', text: 'Initial implementation \'dip\' in satisfaction discourages continued effort' },
    { id: 'S7', text: 'Team stops self-assessing — considers the process \'set\' and no longer in need of review' },
    { id: 'S8', text: 'Backup coverage not trained — PVP breaks when primary person is out' },
  ],

  sustainabilityChecklist: [
    'Document the standard PVP process (who, what, when) in a shareable format',
    'Train backup staff (or document self-review protocol for solo practice)',
    'Set up ongoing measurement — weekly reliability check',
    'Schedule 30-day review to assess sustainability',
    'Share expedition results with the BAN network',
  ],
}
