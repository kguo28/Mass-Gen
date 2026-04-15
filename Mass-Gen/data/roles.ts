export interface Role {
  name: string
  desc: string
}

export const roles: Role[] = [
  {
    name: 'Physician Leader (Champion)',
    desc: 'Organizes, leads, and advocates for QI work at your site. Attends Community Learning Sessions and monthly calls. Leads the team in reviewing performance data and aligning QI work with institutional priorities.',
  },
  {
    name: 'Improvement Coordinator (Key Contact)',
    desc: 'Primary liaison between your site and BAN staff. Facilitates QI meetings, completes monthly narrative reports, maintains run charts, and coordinates data entry and patient consenting.',
  },
  {
    name: 'Senior Leader (Sponsor)',
    desc: 'A senior administrator who connects QI work to institutional strategy. Has authority to free up resources and help overcome systemic barriers. Supports spread of successful changes.',
  },
  {
    name: 'Patient & Family Partners',
    desc: 'Full and essential partners in local improvement activities. Help select and evaluate tests of change. Participate in QI team meetings and network events. Ensure the patient voice is central to all work.',
  },
]
