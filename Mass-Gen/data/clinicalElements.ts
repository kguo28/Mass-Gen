export interface ClinicalElement {
  n: number
  name: string
  description: string
}

export const FRAMING_INTRO = `Before we look at how care is organized, we want to be clear about what we're trying to do for the people we serve. BAN's clinical foundation describes excellent bipolar care as seven interlocking elements. None of them is sufficient alone. Together they describe the standard of care this network is built around.`

export const FRAMING_TREATMENT_GAP = `Bipolar disorder is a lifelong, episodic, and frequently severe illness. Excellent care is rarely a single intervention — it's the steady, integrated practice of several things at once, sustained over years. Most people with bipolar disorder do not currently receive this kind of care. Closing that gap is the work BAN exists to do.`

export const FRAMING_CLOSE = `Most BAN sites do parts of this well already. The point of naming all seven is to make the gaps visible — including the gaps the network as a whole still has to close. We'll come back to these elements throughout the work.`

export const clinicalElements: ClinicalElement[] = [
  {
    n: 1,
    name: 'Systematic diagnosis',
    description: 'Using structured assessment to distinguish bipolar disorder from unipolar depression, anxiety disorders, and substance-related conditions. Misdiagnosis is the most common entry-point failure in bipolar care.',
  },
  {
    n: 2,
    name: 'Treatment selection and optimization (treat to target)',
    description: 'Choosing evidence-supported pharmacological and psychosocial treatments and adjusting them based on measured response, until clinical targets are met or exceeded.',
  },
  {
    n: 3,
    name: 'Routine monitoring and stability assessment',
    description: 'Tracking mood, function, and stability between visits and at every visit, using consistent measures so trends are visible to both patient and clinician.',
  },
  {
    n: 4,
    name: 'Relapse and crisis planning and prevention',
    description: 'Anticipating recurrence with the patient — early warning signs, agreed responses, and plans for the most acute moments — rather than reacting only when crisis arrives.',
  },
  {
    n: 5,
    name: 'Care coordination',
    description: 'Working across primary care, psychiatry, therapy, and social services so that information moves with the patient and care decisions reflect the full picture.',
  },
  {
    n: 6,
    name: 'Safety monitoring and side-effect management',
    description: 'Ongoing vigilance for medication side effects, metabolic and cardiovascular risk, and suicidality — with structured response when concerns surface.',
  },
  {
    n: 7,
    name: 'Peer and community supports',
    description: 'Connecting patients to lived-experience peer support, family education, and community resources that extend care beyond the clinical visit.',
  },
]
