export interface Catch22 {
  sev: 'hi' | 'md'
  t: string
  b: string
  tip: string
}

export const catch22s: Catch22[] = [
  {
    sev: 'hi',
    t: 'Legal won\'t start until IRB weighs in — but IRB wants legal clarity first',
    b: 'Many sites find that their legal team won\'t review the PDUA until the IRB has determined whether participation requires full review or qualifies for ceding to MGB. Simultaneously, the IRB may want to see the PDUA before advising on the reliance pathway. Neither group moves first, and onboarding stalls.',
    tip: 'Ask BAN to share the IRB summary document and the PDUA sample simultaneously at your initial orientation. Frame the IRB determination as legally independent from PDUA contracting — the reliance question and the contracting question are separate processes that can run in parallel.',
  },
  {
    sev: 'hi',
    t: 'IT won\'t scope the data work until the PDUA is signed',
    b: 'IT and informatics teams often won\'t commit to data extraction planning until there is a signed data agreement. But PDUA negotiations may require knowing what data is being shared — creating a circular dependency that delays both.',
    tip: 'Ask your IT team to do a preliminary \'pre-decisional technical review\' without committing to build anything. BAN can provide the data dictionary and Data Use Overview early (Phase I) to support this conversation before legal review is complete.',
  },
  {
    sev: 'hi',
    t: 'Single clinician champion carries the whole process before a team is formed',
    b: 'Early onboarding work typically falls on one clinician before the full site team is assembled. If that person hits a barrier — leadership disengages, legal is slow, IT is unavailable — the entire onboarding stalls because there is no one else to carry it forward.',
    tip: 'Identify a second internal champion early — ideally a CRC or research administrator who can own the administrative and regulatory track while the clinician champion owns the clinical and leadership track. BAN\'s onboarding orientation (Phase II) is the right moment to formalize this.',
  },
  {
    sev: 'md',
    t: 'IRB ceding stalls because your IRB office is unfamiliar with SMART IRB',
    b: 'Some institutional IRB offices are unfamiliar with the SMART IRB framework or the single-IRB ceding model. They may treat it as a novel arrangement requiring full committee review rather than a standard administrative reliance process — adding weeks or months.',
    tip: 'BAN can provide a short briefing document for your IRB office explaining the SMART IRB framework. Connecting your IRB administrator directly with BAN staff who have supported the process at other institutions often accelerates review.',
  },
  {
    sev: 'md',
    t: 'Finance won\'t approve costs until leadership commitment is confirmed — but leadership won\'t commit until costs are known',
    b: 'Leadership may want finance to greenlight the participation fee before formally committing, while finance may require a leadership decision before beginning budget analysis. This is particularly common at academic medical centers with layered approval processes.',
    tip: 'Break the loop by getting leadership to agree to \'evaluate\' rather than \'approve\' — a soft verbal endorsement that lets finance begin their analysis without a binding commitment. BAN can provide budget justification language and a cost structure document.',
  },
  {
    sev: 'md',
    t: 'Phlox data setup waits for PDUA, IRB, and IT — three parallel tracks that rarely align',
    b: 'The Phlox technical setup requires data access agreements (tied to PDUA), IRB approval for data sharing, and IT capacity. These three tracks move at different speeds and are often managed by different people. Sites frequently find that two of the three are ready while the third causes a delay of weeks.',
    tip: 'Map all three tracks on a shared timeline at the start of Phase II. Assign a single person (often the Improvement Coordinator) to track dependencies across tracks and flag when one is blocking another. BAN\'s 90-day planning template helps structure this.',
  },
]
