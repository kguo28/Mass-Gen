import type { NetworkBundle } from '../types'
import { clinicalElements } from '@/data/clinicalElements'
import { ccmComponents } from '@/data/ccmComponents'
import { foundationalModules } from '@/data/modules'
import { readinessDomains, suggestionRules } from '@/data/readinessDomains'
import { measures } from '@/data/measures'
import { crossCuttingThemes } from '@/data/crossCutting'

/** Bipolar Action Network manifest.
 *  All BAN-specific content already lives in data/* — this manifest
 *  aggregates it into a NetworkBundle the Platform layer can consume.
 *  When the data/* files migrate to networks/ban/* later, only these
 *  imports need to change. */
export const banNetwork: NetworkBundle = {
  id: 'ban',
  name: 'Bipolar Action Network',
  tagline: 'A national learning health network for sites improving bipolar care',
  welcomeBody:
    "BAN is a national learning health network for sites improving care for people with bipolar disorder. You're in Basecamp — the place every site starts before working on any module.",
  clinicalElements,
  ccmComponents,
  modules: foundationalModules,
  readinessDomains,
  suggestionRules,
  measures,
  crossCuttingThemes,
  workflowActivities: [
    'Screening/diagnosis',
    'Routine monitoring',
    'Treatment optimization',
    'Follow-up/coordination',
    'Safety monitoring',
    'Recovery supports',
  ],
  chatPromptBlock: `Network: Bipolar Action Network (BAN), run out of Mass General Hospital.

The seven clinical care elements:
1. Systematic diagnosis
2. Treatment selection and optimization (treat to target)
3. Routine monitoring and stability assessment
4. Relapse and crisis planning and prevention
5. Care coordination
6. Safety monitoring and side-effect management
7. Peer and community supports

CCM placement of BAN's foundational modules:
- Health care organization: Leadership engagement, Aligned payment (PCM codes for dyadic practice)
- Work role design: Pre-visit planning, Population management
- Provider decision support: Measurement-based care
- Information management: Population registry, Outcome tracking
- Community resources + Patient self-management: addressed via cross-cutting themes

Provisioning (operational): PDUA (with BAA) executed with MGH; IRB ceding to MGB recommended (NOT required — sites may keep their own IRB); Phlox registry hosted on Hive Networks; annual participation fee (NEVER say "no-fee"); contact bipolaractionnetwork@mgb.org.`,
}
