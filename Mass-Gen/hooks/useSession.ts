'use client'
import { useEffect, useState } from 'react'
import {
  accountToSession,
  DEMO_ACCOUNTS,
  findDemoAccount,
  type AuthSession,
} from '@/data/demoAccounts'

const SESSION_KEY = 'ban_auth_session'

function isKnownSession(value: AuthSession | null): value is AuthSession {
  return !!value && DEMO_ACCOUNTS.some(account => account.id === value.accountId)
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

  function signIn(email: string, accessCode: string): { ok: boolean; error?: string } {
    const account = findDemoAccount(email, accessCode)

    if (!account) {
      return {
        ok: false,
        error: 'Email and access code did not match a demo account.',
      }
    }

    const nextSession = accountToSession(account)
    setSession(nextSession)
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    return { ok: true }
  }

  function signOut() {
    setSession(null)
    window.localStorage.removeItem(SESSION_KEY)
  }

  return { session, hydrated, signIn, signOut }
}
