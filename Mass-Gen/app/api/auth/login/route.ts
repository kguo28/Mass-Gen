import { NextResponse } from 'next/server'
import { login } from '@/lib/server/db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : ''
  const accessCode = typeof body?.accessCode === 'string' ? body.accessCode : ''

  const session = login(email, accessCode)
  if (!session) {
    return NextResponse.json(
      { error: 'Email and access code did not match an account.' },
      { status: 401 },
    )
  }

  return NextResponse.json({
    session: {
      accountId: session.accountId,
      displayName: session.displayName,
      email: session.email,
      siteId: session.siteId,
      siteName: session.siteName,
      role: session.role,
      progressKey: session.siteId,
      sessionToken: session.token,
      signedInAt: new Date().toISOString(),
    },
  })
}
