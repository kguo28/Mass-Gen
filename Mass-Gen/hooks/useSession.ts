'use client'
import { useEffect, useState } from 'react'
import type { AuthSession } from '@/data/demoAccounts'

const SESSION_KEY = 'ban_auth_session'

function isKnownSession(value: AuthSession | null): value is AuthSession {
  return !!value && typeof value.sessionToken === 'string' && value.sessionToken.length > 0
}

export function useSession() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY)
      const stored = raw ? JSON.parse(raw) as AuthSession : null
      setSession(isKnownSession(stored) ? stored : null)
    } catch {
      setSession(null)
    } finally {
      setHydrated(true)
    }
  }, [])

  async function signIn(email: string, accessCode: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessCode }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.session) {
        return {
          ok: false,
          error: payload?.error || 'Email and access code did not match an account.',
        }
      }

      const nextSession = payload.session as AuthSession
      setSession(nextSession)
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
      return { ok: true }
    } catch {
      return {
        ok: false,
        error: 'Could not reach the login server. Try again after the app finishes starting.',
      }
    }
  }

  function signOut() {
    setSession(null)
    window.localStorage.removeItem(SESSION_KEY)
  }

  return { session, hydrated, signIn, signOut }
}
