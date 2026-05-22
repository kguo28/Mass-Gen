import type { ModuleId } from './modules'

export type ResourceKind =
  | 'source_document'
  | 'tool'
  | 'training_aid'
  | 'evidence'
  | 'example'

export type ResourceFormat = 'docx' | 'xlsx' | 'pdf' | 'html' | 'md' | 'txt'

export type ResourceStatus = 'available' | 'in_development'

export interface ModuleResource {
  /** Stable slug used in /api/resources/<id> and as React key. */
  id: string
  title: string
  description: string
  kind: ResourceKind
  format: ResourceFormat
  /** Filename relative to repo-level rag/data/. Empty when status === 'in_development'. */
  fileName: string
  /** YYYY-MM, or omitted for in-development entries. */
  authoredAt?: string
  status: ResourceStatus
}

export const KIND_LABEL: Record<ResourceKind, string> = {
  source_document: 'Source document',
  tool:            'Tool',
  training_aid:    'Training aid',
  evidence:        'Evidence',
  example:         'Example',
}

export const moduleResources: Partial<Record<ModuleId, ModuleResource[]>> = {
  pvp: [
    {
      id: 'pvp-card-doc',
      title: 'PVP Change Concept Card',
      description: 'The authored change-concept specification this module is built from — aim, mechanism, care-change grammar, measures, and definition of done.',
      kind: 'source_document',
      format: 'docx',
      fileName: 'PVP Change Concept Card 031226.docx',
      authoredAt: '2026-03',
      status: 'available',
    },
    {
      id: 'pvp-evidence',
      title: 'Evidence Summary — PVP in primary care',
      description: 'Synthesis of the published evidence base that supports pre-visit planning as a reliable workflow change in primary care.',
      kind: 'evidence',
      format: 'docx',
      fileName: 'Evidence Summary Report PVP Primary care.docx',
      authoredAt: '2026-04',
      status: 'available',
    },
    {
      id: 'pvp-tracker',
      title: 'PVP Reliability Tracker v3',
      description: 'Spreadsheet for tracking per-visit completion of PVP steps. Drives the reliability % shown in the Change Card Test phase.',
      kind: 'tool',
      format: 'xlsx',
      fileName: 'PVP Reliability Tracker V3.xlsx',
      authoredAt: '2026-05',
      status: 'available',
    },
    // ─── Clinical / research evidence — the literature backing the module ───
    {
      id: 'wagner-ccm-1996',
      title: 'Wagner — Organizing Care for Patients with Chronic Illness (Milbank 1996)',
      description: 'The foundational paper introducing the Chronic Care Model. Establishes the productive-interactions framing the BAN modules sit inside.',
      kind: 'evidence',
      format: 'pdf',
      fileName: 'Wagner_OrganizingCareChronicIllness_Milbank1996.pdf',
      authoredAt: '1996-09',
      status: 'available',
    },
    {
      id: 'nierenberg-jama-2023',
      title: 'Nierenberg — JAMA Review: Bipolar Disorder (2023)',
      description: 'Recent comprehensive review of bipolar disorder diagnosis, treatment, and care delivery — informs the seven clinical care elements PVP supports.',
      kind: 'evidence',
      format: 'pdf',
      fileName: 'jama_nierenberg_2023_rv_230017_1696345483.35715.pdf',
      authoredAt: '2023',
      status: 'available',
    },
    {
      id: 'ccm-scale-up',
      title: 'CCM Scale-Up — Medical Care',
      description: 'Evidence on scaling the Chronic Care Model across health systems. Context for what spreading PVP across BAN sites requires.',
      kind: 'evidence',
      format: 'pdf',
      fileName: 'CCM Scale Up Medical Care.pdf',
      status: 'available',
    },
    {
      id: 'bodenheimer-ccm-i',
      title: 'Bodenheimer — Improving Primary Care for Patients with Chronic Illness, Part I',
      description: 'Bodenheimer\'s foundational pairing with Wagner on the Chronic Care Model — operational view of how primary care delivery has to change to fit chronic illness.',
      kind: 'evidence',
      format: 'pdf',
      fileName: 'Bodenheimer Chronic Care Model Part I.pdf',
      status: 'available',
    },
    {
      id: 'bodenheimer-ccm-ii',
      title: 'Bodenheimer — Improving Primary Care for Patients with Chronic Illness, Part II',
      description: 'Part II — the practice-level changes the CCM implies, including pre-visit planning and team-based work.',
      kind: 'evidence',
      format: 'pdf',
      fileName: 'Bodenheimer Chronic Care Model Part II.pdf',
      status: 'available',
    },
    {
      id: 'bauer-csp-i-2006',
      title: 'Bauer — Collaborative Care for Bipolar Disorder, Part I (2006)',
      description: 'Cooperative Studies Program trial of collaborative care for bipolar disorder, Part I — intervention design and process.',
      kind: 'evidence',
      format: 'pdf',
      fileName: '2006.Bauer.PS.CSP-I.pdf',
      authoredAt: '2006',
      status: 'available',
    },
    {
      id: 'bauer-csp-ii-2006',
      title: 'Bauer — Collaborative Care for Bipolar Disorder, Part II (2006)',
      description: 'Cooperative Studies Program trial, Part II — outcomes.',
      kind: 'evidence',
      format: 'pdf',
      fileName: '2006.Bauer.PS.CSP-II.pdf',
      authoredAt: '2006',
      status: 'available',
    },
    {
      id: 'bauer-collab-bipolar-2009',
      title: 'Bauer — Multi-Year Guideline-Based Collaborative Care for Bipolar (APJ 2009)',
      description: 'Multi-year follow-up evidence that guideline-based collaborative care for bipolar disorder produces durable functional and clinical improvements.',
      kind: 'evidence',
      format: 'pdf',
      fileName: 'Bauer_MultiYrGuidelineCollabCareBipolar_APJ2009.pdf',
      authoredAt: '2009',
      status: 'available',
    },
    // ─── Methodology / framework references ───
    {
      id: 'bennett-change-packages',
      title: 'ASQ/QP — Bennett Change Packages (2020)',
      description: 'Improvement-science reference on building structured change packages. The methodological lineage of Change Concept Cards.',
      kind: 'training_aid',
      format: 'pdf',
      fileName: 'ASQ_QP_Bennett_Change_Packages_20200101.pdf',
      authoredAt: '2020-01',
      status: 'available',
    },
    {
      id: 'elements-of-change',
      title: 'Elements of Change Table',
      description: 'Reference table of change concepts used across improvement work.',
      kind: 'training_aid',
      format: 'pdf',
      fileName: 'Elements of Change Table.pdf',
      status: 'available',
    },
    {
      id: 'ccc-spec-v2',
      title: 'Change Concept Card Specification v2',
      description: 'The structured spec every Change Card conforms to — three layers (Platform / Condition / Change Concept) and the Trigger·Actor·Action·Target·Timing grammar. PVP\'s card follows this.',
      kind: 'source_document',
      format: 'docx',
      fileName: 'Change_Concept_Card_Specification_v2.docx',
      authoredAt: '2026',
      status: 'available',
    },
    // ─── Field Guide / Spark framework context ───
    {
      id: 'lfg-concept-brief',
      title: 'Living Field Guide — Concept Brief v3',
      description: 'The concept brief describing the Living Field Guide itself — what it is, who it\'s for, how modules and Change Cards fit together.',
      kind: 'source_document',
      format: 'docx',
      fileName: 'Living_Field_Guide_Concept_Brief_v3.docx',
      status: 'available',
    },
    {
      id: 'lfg-team-orientation',
      title: 'Living Field Guide — Team Orientation',
      description: 'Team-level orientation to the Field Guide approach, language, and operating cadence.',
      kind: 'training_aid',
      format: 'docx',
      fileName: 'Living_Field_Guide_Team_Orientation.docx',
      status: 'available',
    },
    {
      id: 'spark-two-level',
      title: 'Spark Two-Level Orientation',
      description: 'Orientation to the Spark Networked Improvement two-level architecture (Platform / Condition) the Field Guide is built on.',
      kind: 'training_aid',
      format: 'docx',
      fileName: 'Spark_Two_Level_Orientation.docx',
      status: 'available',
    },
    {
      id: 'site-review-guide',
      title: 'Site Review Guide',
      description: 'Operational guide for site reviews — what BAN looks for, the cadence, and what sites prepare.',
      kind: 'training_aid',
      format: 'docx',
      fileName: 'Site_Review_Guide.docx',
      status: 'available',
    },
    {
      id: 'pvp-summary-tpl',
      title: 'PVP summary template',
      description: 'One-page template for the pre-visit summary the team builds before each visit.',
      kind: 'tool',
      format: 'docx',
      fileName: '',
      status: 'in_development',
    },
    {
      id: 'pvp-care-gap',
      title: 'Care gap report',
      description: 'Pre-visit report flagging open care gaps for each patient — measurement, monitoring, side-effects.',
      kind: 'tool',
      format: 'xlsx',
      fileName: '',
      status: 'in_development',
    },
    {
      id: 'pvp-huddle',
      title: 'PVP huddle script',
      description: 'Suggested verbal script for the brief pre-visit huddle between the provider and clinical support.',
      kind: 'training_aid',
      format: 'pdf',
      fileName: '',
      status: 'in_development',
    },
    {
      id: 'pvp-role-guide',
      title: 'PVP role guide (1-pager)',
      description: 'One-page role guide describing who does what in the PVP workflow across team compositions.',
      kind: 'training_aid',
      format: 'pdf',
      fileName: '',
      status: 'in_development',
    },
    {
      id: 'pvp-sample',
      title: 'Sample completed PVP summary',
      description: 'A worked example of a filled-in PVP summary, anonymized — useful as a reference when teams start.',
      kind: 'example',
      format: 'pdf',
      fileName: '',
      status: 'in_development',
    },
  ],
}

export function getModuleResources(id: ModuleId): ModuleResource[] {
  return moduleResources[id] ?? []
}

/** Flat lookup across all modules by resource id — used by the /api/resources route
 *  to resolve a request to a specific manifest entry. Returns undefined for
 *  unknown ids (→ 404). */
export function findResource(id: string): ModuleResource | undefined {
  for (const list of Object.values(moduleResources)) {
    const hit = list?.find(r => r.id === id)
    if (hit) return hit
  }
  return undefined
}
