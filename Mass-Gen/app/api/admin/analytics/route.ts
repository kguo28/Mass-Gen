import { NextResponse } from 'next/server'
import { readAdminAnalytics, sessionFromRequest } from '@/lib/server/db'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const session = sessionFromRequest(request)

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ban') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(readAdminAnalytics())
}
