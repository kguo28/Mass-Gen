// Module-level wrapper content per the v2 spec ("How Cards Compose into Modules").
//
// A module page on the Knowledge Website wraps one-or-more cards with shared
// module-level content authored separately from the card itself:
//   - Overview (intro + background + problem statement)
//   - Evidence Summary (literature synthesis, degree-of-belief)
//   - Media (video / podcast / team stories)
//   - Theory of Improvement (key driver diagram)
//
// For Phase 1 the Theory of Improvement is a nested text outline
// (Aim → primary drivers → secondary drivers → change ideas). Real diagrams
// land in a later phase.

import type { ModuleId } from './modules'

export interface DriverNode {
  label: string
  children?: DriverNode[]
}

export interface MediaItem {
  kind: 'video' | 'podcast' | 'story'
  title: string
  description: string
  link?: string                  // URL | undefined (placeholder)
}

export interface ModuleOverview {
  /** Short paragraph framing the module's area of practice change. */
  overview: string
  /** Multi-paragraph synthesis across the cards in this module. */
  evidenceSummary: string
  /** Degree-of-belief: how confident is the network in this approach? */
  degreeOfBelief: 'emerging' | 'established' | 'mature'
  /** Media items — empty array if none authored yet. */
  media: MediaItem[]
  /** Key driver diagram as a nested outline (Phase 1 placeholder format). */
  theoryOfImprovement: DriverNode
}

// Partial: not every module has authored overview content yet. The renderer
// shows placeholder copy when a module is missing here.
export const moduleOverviews: Partial<Record<ModuleId, ModuleOverview>> = {
  pvp: {
    overview:
      "Pre-visit planning replaces reactive visits with planned interactions. Before each scheduled follow-up with a registered bipolar patient, the team prepares a structured summary of the patient's current status, recent data, and outstanding needs. The clinician enters the encounter informed; the team closes gaps that would otherwise be missed.",
    evidenceSummary:
      'Pre-visit planning is a foundational element of the Chronic Care Model (Wagner et al., 1996) and has demonstrated impact on guideline adherence and care gap closure across multiple chronic conditions. BAN sites typically begin with this module because it is high-leverage, low-infrastructure (relative to registry build-out), and produces visible early wins. The change concept is literature-supported with growing local evidence from BAN pilot sites.',
    degreeOfBelief: 'established',
    media: [],
    theoryOfImprovement: {
      label: 'Improve visit quality and care gap closure for bipolar patients',
      children: [
        {
          label: 'Primary driver: Reliable pre-visit data availability',
          children: [
            { label: 'Standardized PVP summary template' },
            { label: 'Registry feed reliable for PVP fields' },
            { label: 'Summary generated 24–72h before visit' },
          ],
        },
        {
          label: 'Primary driver: Structured pre-visit review',
          children: [
            { label: 'Clinician acknowledges summary at visit start' },
            { label: 'Care gaps identified with owner + due-by date' },
            { label: 'Brief team huddle for flagged patients' },
          ],
        },
        {
          label: 'Primary driver: Closed-loop follow-up',
          children: [
            { label: 'Follow-up actions executed within 72h' },
            { label: 'Closure documented in standard EHR location' },
            { label: 'Sustainability — weekly reliability check' },
          ],
        },
      ],
    },
  },
  site_onboarding: {
    overview:
      "Site onboarding is the operational module every BAN site works on in parallel with their clinical modules. It covers Phlox/Hive registry provisioning, the PDUA/BAA with MGH, IRB ceding decisions, and team formation. Distinct from clinical change concepts, it follows a phased checklist rather than a PDSA cycle.",
    evidenceSummary:
      'Operational onboarding is procedural — the "evidence" is the network playbook captured from prior BAN site onboardings. Steps are mostly procedural with one judgment call (IRB ceding vs keeping local).',
    degreeOfBelief: 'mature',
    media: [],
    theoryOfImprovement: {
      label: 'Site is technically + administratively ready to do BAN work',
      children: [
        {
          label: 'Primary driver: Data/legal infrastructure',
          children: [
            { label: 'PDUA + BAA executed with MGH' },
            { label: 'IRB ceding decision made (cede to MGB recommended)' },
            { label: 'Phlox/Hive registry provisioned' },
          ],
        },
        {
          label: 'Primary driver: Team formed',
          children: [
            { label: '4 site roles identified (champion, lead, data, leadership)' },
            { label: 'Roles named to BAN' },
            { label: 'Kickoff training completed' },
          ],
        },
      ],
    },
  },
}
