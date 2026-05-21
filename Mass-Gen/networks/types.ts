import type { ClinicalElement } from '@/data/clinicalElements'
import type { CcmComponent } from '@/data/ccmComponents'
import type { FoundationalModule } from '@/data/modules'
import type { ReadinessDomain, SuggestionRule } from '@/data/readinessDomains'
import type { Measure } from '@/data/measures'
import type { CrossCuttingTheme } from '@/data/crossCutting'

/** A Network Bundle is everything the Platform layer needs to render
 *  a specific condition (clinical area, population, network rules).
 *  Same Platform skeleton, different Bundle → different network. */
export interface NetworkBundle {
  /** URL-safe id for ?network= */
  id: string

  /** Human-readable display name */
  name: string

  /** Short tagline shown on Hub welcome */
  tagline: string

  /** Long-form description used on Hub Basecamp welcome paragraph */
  welcomeBody: string

  /** Clinical care elements (Arc Step 1 content) */
  clinicalElements: ClinicalElement[]

  /** CCM components + which foundational modules sit in each (Arc Step 2) */
  ccmComponents: CcmComponent[]

  /** The full module set — clinical + operational. Arc Step 3 selects
   *  from kind === 'clinical'; operational modules render always-on. */
  modules: FoundationalModule[]

  /** Readiness domains + suggestion logic (Readiness page, Arc Step 3) */
  readinessDomains: ReadinessDomain[]
  suggestionRules: SuggestionRule[]

  /** Module-level measures (Measurement page, Hub badges) */
  measures: Measure[]

  /** Cross-cutting themes (CrossCuttingStrip on Hub) */
  crossCuttingThemes: CrossCuttingTheme[]

  /** Network-specific facts that get appended to the chatbot system
   *  prompt. The Platform layer supplies the framing; the network
   *  fills in its own substance. */
  chatPromptBlock: string
}
