export interface Doc {
  n: string
  d: string
  ph: string
  pc: string
  type: 'placeholder' | 'pdua_text' | 'external'
  action: string
  url?: string
}

export const docs: Doc[] = [
  { n: 'Letter of Joining', d: 'Non-binding signal of intent to join BAN. Submitting triggers BAN next steps.', ph: 'Joining', pc: 'ph-join', type: 'placeholder', action: 'Request from BAN team' },
  { n: 'BAN Onboarding Overview', d: 'The two-way partnership document — what BAN commits to providing and what your site commits to doing.', ph: 'Joining', pc: 'ph-join', type: 'placeholder', action: 'Request from BAN team' },
  { n: 'BAN Network Flyer', d: 'One-page overview of BAN: who we are, our community, and why partnering with BAN matters.', ph: 'Joining', pc: 'ph-join', type: 'placeholder', action: 'View document' },
  { n: 'Care Center Roles & Responsibilities', d: 'Defines the four key local roles: Physician Leader, Improvement Coordinator, Senior Leader/Sponsor, and Patient & Family Partners.', ph: 'Joining', pc: 'ph-join', type: 'placeholder', action: 'Request from BAN team' },
  { n: '90-Day Planning Template', d: 'Site charter template for setting early activation goals and structuring your first PDSA cycles.', ph: 'Training', pc: 'ph-train', type: 'placeholder', action: 'Request from BAN team' },
  { n: 'PDUA / BAA Template', d: 'Participation and Data Use Agreement + Business Associate Agreement. Core legal document executed between your institution and MGH.', ph: 'Registering', pc: 'ph-reg', type: 'pdua_text', action: 'View document' },
  { n: 'Data Use Overview', d: 'Explains how data flows in BAN — what is shared, at what level, and how it is governed.', ph: 'Registering', pc: 'ph-reg', type: 'placeholder', action: 'Request from BAN team' },
  { n: 'IRB Ceding Packet', d: 'Includes: model consent form, assent form, MGH IRB protocol, single IRB ceding instructions, local context form, SMART IRB LOA and Flex Addendum, optional HIPAA waiver.', ph: 'Registering', pc: 'ph-reg', type: 'placeholder', action: 'Request from BAN team' },
  { n: 'Model Consent Form', d: 'Template for patient consent at your site. BAN provides clean and tracked-changes versions.', ph: 'Registering', pc: 'ph-reg', type: 'placeholder', action: 'Request from BAN team' },
  { n: 'Hive / Phlox Quick-Start Guide', d: 'Getting oriented on the Phlox registry — login, data entry, dashboards, and Phlox Exchange.', ph: 'Activation', pc: 'ph-act', type: 'placeholder', action: 'Request from BAN team' },
  { n: 'Transforming Health Care (Margolis et al., NEJM 2025)', d: 'NAM Shared Commitments framework for learning health systems. Background reading on the LHN model underpinning BAN.', ph: 'Reference', pc: 'ph-ref', type: 'external', url: 'https://doi.org/10.1056/NEJMsb2507600', action: 'Open article ↗' },
]
