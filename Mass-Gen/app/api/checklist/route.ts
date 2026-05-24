import { NextResponse } from 'next/server'
import {
  canAccessSite,
  readChecklist,
  sessionFromRequest,
  writeChecklist,
} from '@/lib/server/db'

export const runtime = 'nodejs'

function siteIdFromUrl(request: Request) {
  return new URL(request.url).searchParams.get('siteId') || ''
}

export async function GET(request: Request) {
  const session = await sessionFromRequest(request)
  const siteId = siteIdFromUrl(request)

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!siteId || !canAccessSite(session, siteId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(await readChecklist(siteId))
}

export async function PUT(request: Request) {
  const session = await sessionFromRequest(request)
  const siteId = siteIdFromUrl(request)
  const body = await request.json().catch(() => null)

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!siteId || !canAccessSite(session, siteId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const checks = body?.checks && typeof body.checks === 'object' ? body.checks : {}
  await writeChecklist(siteId, session.userId, checks)
  return NextResponse.json({ ok: true })
}
