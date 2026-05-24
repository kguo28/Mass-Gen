import { NextResponse } from 'next/server'
import {
  canAccessSite,
  readSiteProgress,
  sessionFromRequest,
  writeSiteProgress,
} from '@/lib/server/db'
import type { TeamState } from '@/data/teamState'

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

  return NextResponse.json(await readSiteProgress(siteId))
}

export async function PUT(request: Request) {
  const session = await sessionFromRequest(request)
  const siteId = siteIdFromUrl(request)
  const body = await request.json().catch(() => null)

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!siteId || !canAccessSite(session, siteId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await writeSiteProgress(siteId, session.userId, body?.state as TeamState)
  return NextResponse.json({ ok: true })
}
