import { NextResponse } from 'next/server'
import {
  canAccessSite,
  sessionFromRequest,
  writeModuleInput,
} from '@/lib/server/db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = sessionFromRequest(request)
  const body = await request.json().catch(() => null)
  const siteId = typeof body?.siteId === 'string' ? body.siteId : ''
  const cardId = typeof body?.cardId === 'string' ? body.cardId : ''
  const inputType = typeof body?.inputType === 'string' ? body.inputType : 'module_state'

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!siteId || !canAccessSite(session, siteId) || !cardId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  writeModuleInput({
    siteId,
    userId: session.userId,
    moduleId: typeof body?.moduleId === 'string' ? body.moduleId : null,
    cardId,
    inputType,
    payload: body?.payload ?? {},
  })

  return NextResponse.json({ ok: true })
}
