'use client'
import { useEffect, useState } from 'react'
import type { AuthSession } from '@/data/demoAccounts'

const BASE_KEY = 'ban_checks'

export function useRemoteChecklist(session: AuthSession) {
  const key = `${BASE_KEY}:${session.progressKey}`
  const [checks, setChecks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false

    try {
      const raw = window.localStorage.getItem(key)
      setChecks(raw ? JSON.parse(raw) : {})
    } catch {
      setChecks({})
    }

    fetch(`/api/checklist?siteId=${encodeURIComponent(session.siteId)}`, {
      headers: { 'x-ban-session': session.sessionToken },
    })
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (cancelled || !payload?.checks) return
        setChecks(payload.checks)
        window.localStorage.setItem(key, JSON.stringify(payload.checks))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [key, session.sessionToken, session.siteId])

  function persist(next: Record<string, boolean>) {
    try {
      window.localStorage.setItem(key, JSON.stringify(next))
    } catch {}

    fetch(`/api/checklist?siteId=${encodeURIComponent(session.siteId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-ban-session': session.sessionToken,
      },
      body: JSON.stringify({ checks: next }),
    }).catch(() => {})
  }

  const setValue = (
    value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => {
    setChecks(previous => {
      const next = value instanceof Function ? value(previous) : value
      persist(next)
      return next
    })
  }

  return [checks, setValue] as const
}
