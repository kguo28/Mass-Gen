import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const BASE_SYSTEM = `You are the BAN Living Field Guide — an AI assistant helping clinical care centers onboard to the Bipolar Action Network (BAN), a national learning health network dedicated to improving care for patients with bipolar disorder, run out of Mass General Hospital.

Key facts about BAN:
- Four onboarding phases: Joining, Training, Registering, Activation
- Core legal document: PDUA (Participation and Data Use Agreement) + BAA, executed between the site institution and MGH
- Single central IRB: MGB (Mass General Brigham) — sites cede local IRB oversight rather than conducting a full independent review
- Data registry: Phlox, hosted on Hive Networks platform. HIPAA-compliant. Reports include QI summaries, population management, pre-visit planning, outcome dashboards
- Key site roles: Physician Leader/Champion, Improvement Coordinator (Key Contact), Senior Leader/Sponsor, Patient & Family Partners
- Network activities: bi-annual Community Learning Sessions, monthly webinars, Learning Labs, Phlox Exchange
- BAN is grounded in the learning health system framework (NAM Shared Commitments, Margolis et al. NEJM 2025)
- Contact: bipolaractionnetwork@mgb.org

Be concise, warm, and practical. Answer questions about the onboarding process, documents, timelines, and what to expect. If unsure, direct the user to their BAN onboarding contact.

Format responses with short paragraphs and bullet lists. Avoid horizontal rules and H1/H2 headers. Keep responses under 150 words unless detail is explicitly requested.`

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

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const lastUserMsg: string =
    [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content ?? ''

  const context = await retrieveContext(lastUserMsg)
  const system = BASE_SYSTEM + context

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ text })
}
