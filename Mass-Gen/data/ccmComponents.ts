import type { ModuleId } from './modules'

export type CcmComponentId =
  | 'hco'
  | 'community'
  | 'work_role'
  | 'decision_support'
  | 'info_mgmt'
  | 'self_mgmt'

export interface CcmComponent {
  id: CcmComponentId
  name: string
  moduleIds: ModuleId[]
  note?: string
}

export const CCM_FRAMING = `The Chronic Care Model organizes care delivery into six components. BAN sites start by working on a subset of seven foundational elements that sit inside the model — places where evidence and experience tell us reliable change pays off most quickly. You'll choose where to begin in the next step.`

export const CCM_SUBSET_NOTE = `Sites that try to work on the whole model at once typically work on none of it well. The seven foundational elements are where BAN sites have seen the clearest path from work to results. Other CCM components grow from this base — they are not skipped, they follow.`

export const CCM_OUTCOMES_LINE = `These components produce productive interactions between informed, activated patients and prepared, proactive practice teams — which in turn produce functional and clinical outcomes.`

export const ccmComponents: CcmComponent[] = [
  {
    id: 'hco',
    name: 'Health care organization',
    moduleIds: ['leadership', 'aligned_payment'],
    note: 'Institutional context modules. Aligned payment uses Principal Care Management codes.',
  },
  {
    id: 'community',
    name: 'Community resources and policies',
    moduleIds: [],
    note: 'Community partnerships develop alongside foundational work.',
  },
  {
    id: 'work_role',
    name: 'Work role design',
    moduleIds: ['pvp', 'population_mgmt'],
    note: 'Clinical workflow modules. Most BAN sites\' first action-oriented work.',
  },
  {
    id: 'decision_support',
    name: 'Provider decision support',
    moduleIds: ['mbc'],
    note: 'Tools and routines that inform clinical decisions in real time.',
  },
  {
    id: 'info_mgmt',
    name: 'Information management',
    moduleIds: ['population_registry', 'outcome_tracking'],
    note: 'Data infrastructure. Registry typically a foundational investment.',
  },
  {
    id: 'self_mgmt',
    name: 'Patient self-management support',
    moduleIds: [],
    note: 'Addressed through the cross-cutting Patient & family partnership theme.',
  },
]
