export interface Task {
  t: string
  tags: string[]
  meta: string
  docs?: string[]
}

export interface TaskGroup {
  lbl: string
  tasks: Task[]
}

export interface Phase {
  name: string
  label: string
  intro: string
  groups: TaskGroup[]
}

export const phases: Phase[] = [
  {
    name: 'Joining',
    label: 'Phase I: Joining',
    intro: 'Your site has expressed interest in BAN. This phase is about building internal alignment — getting leadership, legal, finance, and IT oriented before the formal process begins. The Letter of Joining is non-binding, but submitting it to <strong>bipolaractionnetwork@mgb.org</strong> triggers BAN\'s next steps and launches the 90-day PDSA cycle for PDUA execution.',
    groups: [
      {
        lbl: 'Leadership alignment',
        tasks: [
          { t: 'Coordinate department/division leadership meeting to review the Letter of Joining', tags: ['tm'], meta: 'Strongly recommended — sites that skip this step often face delayed buy-in later', docs: ['Letter of Joining', 'BAN Onboarding Overview', 'BAN Network Flyer'] },
          { t: 'Sign and submit Letter of Joining to bipolaractionnetwork@mgb.org', tags: ['tm'], meta: 'Non-binding signal of intent — triggers BAN next steps and launches 90-day PDSA for PDUA execution', docs: ['Letter of Joining'] },
        ],
      },
      {
        lbl: 'Legal, Finance & IT orientation',
        tasks: [
          { t: 'Initiate legal review of the PDUA/BAA — share the sample document with your legal team', tags: ['tl'], meta: 'Can run in parallel with IRB planning — BAN holds office hours with MGH legal available', docs: ['PDUA / BAA Template'] },
          { t: 'Socialize finance team on the participation cost model', tags: ['tf'], meta: 'Avoids late-stage funding objections — no invoice issued at this stage' },
          { t: 'Identify IS/IT contact and introduce data concepts', tags: ['tt'], meta: 'No technical build yet — orientation only; share the Data Use Overview document', docs: ['Data Use Overview'] },
        ],
      },
      {
        lbl: 'Internal setup',
        tasks: [
          { t: 'Convene internal site alignment meeting with Legal, Finance, and IS/IT', tags: ['tm'], meta: 'Optional but highly recommended before proceeding to Phase II' },
        ],
      },
    ],
  },
  {
    name: 'Training',
    label: 'Phase II: Training',
    intro: 'Your site is now formally engaged. This phase builds shared skills and language across your local team — improvement science, measurement-based care, and how BAN\'s registry and QI model work. IRB planning and legal review continue in parallel. Your 90-day activation plan takes shape here.',
    groups: [
      {
        lbl: 'Team orientation',
        tasks: [
          { t: 'Invite physician champion, CRCs, and supporting staff to BAN onboarding orientation', tags: ['tm', 'tb'], meta: 'Sets shared expectations — BAN provides orientation materials and scheduling', docs: ['Care Center Roles & Responsibilities'] },
          { t: 'Define scope and cadence of participation with BAN team', tags: ['tm', 'tb'], meta: 'BAN helps right-size your participation — start small and focused' },
        ],
      },
      {
        lbl: 'QI training',
        tasks: [
          { t: 'Participate in QI Fundamentals training series', tags: ['tm', 'tb'], meta: 'Covers improvement science, PDSA cycles, measurement-based care, and systems thinking' },
          { t: 'Finalize 90-day activation plan / site charter with BAN', tags: ['tm'], meta: 'BAN provides a 90-day planning template — this guides your early participation goals', docs: ['90-Day Planning Template'] },
        ],
      },
    ],
  },
  {
    name: 'Registering',
    label: 'Phase III: Registering',
    intro: 'This is the paperwork-intensive phase. The PDUA, IRB review (BAN recommends ceding to MGB, but sites may keep their own IRB), and Phlox technical setup all happen here — and each can take longer than expected. Many steps can run in parallel. Once the PDUA is fully executed and IRB approval is confirmed, you receive the formal go-signal for data contribution.',
    groups: [
      {
        lbl: 'Legal — PDUA/BAA',
        tasks: [
          { t: 'Confirm site legal point of contact and send finalized PDUA/BAA template', tags: ['tl'], meta: 'BAN generates a site-specific template — flag questions early; office hours available with MGH legal', docs: ['PDUA / BAA Template'] },
          { t: 'Complete PDUA/BAA internal review and obtain institutional signatures', tags: ['tl'], meta: 'Timeline varies by institution — typically 4–8 weeks; engage legal early and often', docs: ['PDUA / BAA Template'] },
          { t: 'Return fully executed PDUA/BAA to BAN for MGH countersignature', tags: ['tl', 'tb'], meta: 'BAN tracks receipt and routes for countersignature — allow 1–2 weeks for MGH processing', docs: ['PDUA / BAA Template'] },
        ],
      },
      {
        lbl: 'IRB — reliance / ceding (recommended)',
        tasks: [
          { t: 'Decide IRB pathway: cede to MGB (recommended) or keep your own IRB', tags: ['ti'], meta: 'BAN recommends ceding via SMART IRB to streamline review, but sites are free to use their own IRB', docs: ['IRB Ceding Packet'] },
          { t: 'If ceding: submit Local Context Form and initiate SMART IRB reliance process', tags: ['ti'], meta: 'BAN provides the full document packet — your IRB office leads this process; typical timeline 4–12 weeks', docs: ['IRB Ceding Packet', 'Model Consent Form'] },
          { t: 'Obtain IRB approval (reliance agreement if ceding, or local approval otherwise)', tags: ['ti'], meta: 'Once approved, BAN provides the formal go-signal for data contribution' },
        ],
      },
      {
        lbl: 'Data & Phlox setup',
        tasks: [
          { t: 'Complete Hive Networks data access agreement and user provisioning', tags: ['tt', 'tb'], meta: 'Hive Networks operates the Phlox platform — BAN facilitates introductions and provides support', docs: ['Hive / Phlox Quick-Start Guide'] },
          { t: 'Complete site data extraction scoping with IT and Hive technical team', tags: ['tt'], meta: 'Hive provides a data dictionary and technical support — IT involvement is limited in scope', docs: ['Data Use Overview'] },
          { t: 'Complete Phlox data quality review with BAN QI coach', tags: ['tt', 'tb'], meta: 'BAN reviews first data submission for completeness and accuracy before formal activation', docs: ['Hive / Phlox Quick-Start Guide'] },
        ],
      },
    ],
  },
  {
    name: 'Activation',
    label: 'Phase IV: Activation',
    intro: 'Your site is fully registered. This phase marks the transition to active participation — regular data submission, live QI work, and engagement in the BAN learning community. BAN\'s QI coaches remain closely involved throughout your first year.',
    groups: [
      {
        lbl: 'Go-live',
        tasks: [
          { t: 'Receive formal BAN go-signal confirming activation readiness', tags: ['tb'], meta: 'Issued after PDUA execution, IRB approval, and successful Phlox data quality review' },
          { t: 'Begin regular patient registration and data submission to Phlox', tags: ['tm'], meta: 'Monthly submission cadence; Hive and BAN provide ongoing support', docs: ['Hive / Phlox Quick-Start Guide'] },
          { t: 'Attend first BAN Action Period Call as an active site', tags: ['tm', 'tb'], meta: 'Recurring network calls; your site transitions from observer to active contributor' },
        ],
      },
      {
        lbl: 'QI engagement',
        tasks: [
          { t: 'Launch first PDSA cycle with BAN QI coach support', tags: ['tm', 'tb'], meta: 'BAN coaches support test design, measurement, and learning documentation' },
          { t: 'Submit first monthly narrative report to BAN', tags: ['tm'], meta: 'Short monthly write-up of PDSA progress, barriers, and learnings — template provided by BAN; completed by the Improvement Coordinator' },
        ],
      },
    ],
  },
]
