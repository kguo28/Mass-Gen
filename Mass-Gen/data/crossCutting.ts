export interface CrossCuttingTheme {
  id: string
  name: string
  blurb: string
}

export const crossCuttingThemes: CrossCuttingTheme[] = [
  {
    id: 'patient_partnership',
    name: 'Patient partnership',
    blurb: 'Patients and families shape how the work happens, in every region.',
  },
  {
    id: 'measurement_learning',
    name: 'Measurement & learning',
    blurb: 'Consistent measures and shared learning across the network, in every region.',
  },
  {
    id: 'network_citizenship',
    name: 'Network citizenship',
    blurb: 'Sites both learn from and contribute to the network, in every region.',
  },
]
