import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getNetwork } from '@/networks/registry'

const client = new Anthropic()

/** Platform-layer preamble — describes the reusable scaffolding the
 *  Living Field Guide provides. Network-specific content gets appended
 *  per request from the active NetworkBundle.chatPromptBlock. */
const PLATFORM_SYSTEM = `You are a Living Field Guide assistant for a Networked Improvement collaborative. The Platform layer (skeleton) is reusable across networks; the Condition layer below specifies the active network's clinical area, modules, and operational realities.

Framework — the Territory Map regions a site moves through:
- Basecamp (pre-entry): readiness check + 3-step orientation arc + module selection
- Provisioning (onboarding): institutional setup (PDUA, IRB, Phlox) + team formation on chosen modules ("Preparing")
- Expedition (core changes): active PDSA work on selected modules ("Practicing")
- Deep terrain (advanced work): sustained, integrated practice across the full Chronic Care Model
- New ground: innovation branches from any region

The orientation arc (in Basecamp) has 3 steps:
1. What good bipolar care looks like — seven clinical care elements
2. How care delivery is organized — the Chronic Care Model with foundational modules placed inside it
3. Choose 1–2 foundational modules to begin with (soft limit; sites that begin 3+ in parallel typically stall on all)

Cross-cutting themes (Platform layer expectations): every network has a Patient/Youth/Family partnership theme, a Measurement & learning theme, and a Network citizenship theme — present in every region.

Be concise, warm, and practical. When a Team Context block is included in this prompt, use it to scope your answer to where the team actually is (region, hub state, selected modules, currently-loaded module unit). If a module unit is active, prefer answering in terms of that module's work; if not, answer at the orientation level. If unsure, direct the user to the network's onboarding contact.

Format with short paragraphs and bullet lists. Avoid horizontal rules and H1/H2 headers. Keep under 150 words unless detail is explicitly requested.`

const RAG_URL = 'http://localhost:8000'

async function retrieveContext(query: string): Promise<string> {
  try {
    const res = await fetch(`${RAG_URL}/retrieve?q=${encodeURIComponent(query)}&k=5`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return ''
    const { chunks } = await res.json()
    if (!chunks?.length) return ''
    return (
      '\n\nRelevant source material:\n' +
      (chunks as { source: string; text: string }[])
        .map((c) => `[${c.source}]\n${c.text}`)
        .join('\n\n---\n\n')
    )
  } catch {
    return ''
  }
}

interface TeamContext {
  region?: string
  hubState?: string
  arcCompleted?: boolean
  selectedModules?: string[]
  activeCardId?: string | null
  activeModuleId?: string | null
  activeModuleName?: string | null
  activeModuleKind?: 'clinical' | 'operational' | null
  synthesis?: string | null
  /** Network id (e.g. 'ban', 'icn-stub'). The server resolves this to
   *  a NetworkBundle and injects its chatPromptBlock so the chatbot
   *  knows which condition it's serving. */
  networkId?: string
}

function buildTeamContextBlock(ctx?: TeamContext): string {
  if (!ctx) return ''
  const lines: string[] = []
  if (ctx.region) lines.push(`- Current region: ${ctx.region}`)
  if (ctx.hubState) lines.push(`- Hub state: ${ctx.hubState}`)
  if (typeof ctx.arcCompleted === 'boolean') lines.push(`- Orientation arc completed: ${ctx.arcCompleted}`)
  if (ctx.selectedModules?.length) lines.push(`- Selected modules (in Preparing): ${ctx.selectedModules.join(', ')}`)
  if (ctx.activeModuleId) {
    const kind = ctx.activeModuleKind ? ` (${ctx.activeModuleKind})` : ''
    const name = ctx.activeModuleName ? ` — ${ctx.activeModuleName}` : ''
    lines.push(`- Currently FOCUSED module${kind}: ${ctx.activeModuleId}${name}. Scope answers to this module unless asked otherwise.`)
  }
  if (ctx.activeCardId && ctx.activeCardId !== ctx.activeModuleId) {
    lines.push(`- Currently loaded Change Card: ${ctx.activeCardId}`)
  }
  if (ctx.synthesis) lines.push(`- Readiness synthesis: ${ctx.synthesis}`)
  if (!lines.length) return ''
  return `\n\nTeam Context (scope your answer to this):\n${lines.join('\n')}`
}

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json()

  const lastUserMsg: string =
    [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content ?? ''

  const network = getNetwork(context?.networkId)
  const rag = await retrieveContext(lastUserMsg)
  const teamCtx = buildTeamContextBlock(context)
  const system = PLATFORM_SYSTEM + '\n\n--- Active network (Condition layer) ---\n\n' + network.chatPromptBlock + teamCtx + rag

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ text })
}
