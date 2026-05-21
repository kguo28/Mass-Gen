# Networks — the Condition layer

Per the Spark two-level architecture, the Platform layer (the rest of this app) must be content-agnostic. All network-specific content lives behind the `NetworkBundle` interface in `networks/types.ts`.

## Adding a new network

1. Create `networks/<your-id>/manifest.ts` that exports a `NetworkBundle`.
2. Register it in `networks/registry.ts`:
   ```ts
   import { yourNetwork } from './your-id/manifest'
   export const networks = { ban: banNetwork, 'icn-stub': icnStubNetwork, 'your-id': yourNetwork }
   ```
3. Switch to it at runtime: `?network=your-id` URL parameter.

## What a NetworkBundle supplies

See `networks/types.ts` for the full contract. Briefly:

- `name`, `tagline`, `welcomeBody` — Hub welcome copy
- `clinicalElements` — Arc Step 1 content
- `ccmComponents` — Arc Step 2 layout (CCM components + which modules sit inside)
- `modules` — the full module set (clinical + operational). Arc Step 3 selects from `kind: 'clinical'`; operational modules are always-on.
- `readinessDomains` + `suggestionRules` — Readiness page + Arc Step 3 suggestions
- `measures` — Measurement page rows + Hub module-card headline badges
- `crossCuttingThemes` — CrossCuttingStrip below Hub
- `chatPromptBlock` — appended to the Platform-layer system prompt so the chatbot scopes its answers to the network

## What the Platform layer supplies

The Platform layer is everything outside `networks/`:

- Implementation Hub (`components/Hub.tsx`) — state-aware home (basecamp / emerging / practicing)
- Region/Territory map (`components/TerritoryMap.tsx`, `data/regions.ts`)
- Orientation arc shell (`components/ArcStep1/2/3.tsx`, `components/Readiness.tsx`)
- Module unit dispatch + Change Card registry (`data/changeCardRegistry.ts`, `app/page.tsx::openModule`)
- Chatbot scope-context plumbing (`app/api/chat/route.ts`, `components/AiChat.tsx`)
- Measurement page (`components/MeasurementPage.tsx`) — renders any NetworkBundle's `measures`
- `useNetwork()` (`hooks/useNetwork.ts`), `useTeamState()` (`hooks/useTeamState.ts`)

## Current limitations (Step 13)

This is the first cut of the network layer — not a full refactor.

1. **Most pages still import from `data/*` directly**, not via `useNetwork()`. The places that DO swap correctly are the Hub welcome and the chatbot system prompt. To prove broader swap-ability, the arc steps and measurement page would need to read from `useNetwork().network.{clinicalElements, ccmComponents, ...}` instead of importing the BAN data files. Easy refactor — was deferred to keep this step shippable.
2. **`ModuleId` is a closed union** (`'pvp' | 'leadership' | ...`). Networks can't introduce new module ids without widening the type. Two options for the next refactor: widen to `string`, or move `ModuleId` to per-network branded strings.
3. **`changeCardRegistry`** uses module ids as card ids. Both networks currently reuse `'pvp'` to share the Change Card scaffold — that's fine for demoing reuse but isn't a real ICN module.
4. **No network switcher in the UI yet** — set `?network=icn-stub` in the URL. Add a dropdown to the Hub Reset row if needed.

## Demo

- `?network=ban` (default) — full BAN content
- `?network=icn-stub` — pediatric IBD stub network. Hub banner appears. Chatbot's system prompt swaps to ICN's `chatPromptBlock`.
