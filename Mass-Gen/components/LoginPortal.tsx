'use client'
import { FormEvent, useState } from 'react'
import { DEMO_ACCOUNTS, type DemoAccount } from '@/data/demoAccounts'

interface Props {
  onSignIn: (email: string, accessCode: string) => Promise<{ ok: boolean; error?: string }>
}

export default function LoginPortal({ onSignIn }: Props) {
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0]?.email ?? '')
  const [accessCode, setAccessCode] = useState(DEMO_ACCOUNTS[0]?.accessCode ?? '')
  const [selectedId, setSelectedId] = useState(DEMO_ACCOUNTS[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function chooseAccount(account: DemoAccount) {
    setSelectedId(account.id)
    setEmail(account.email)
    setAccessCode(account.accessCode)
    setError(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    const result = await onSignIn(email, accessCode)
    setSubmitting(false)
    setError(result.ok ? null : result.error ?? 'Unable to sign in.')
  }

  return (
    <main className="min-h-screen bg-gray-50-ban text-gray-900-ban">
      <div className="mx-auto grid min-h-screen max-w-[1120px] grid-cols-[1fr_420px] gap-10 px-8 py-10 max-lg:grid-cols-1 max-sm:px-5">
        <section className="flex flex-col justify-between rounded-[10px] bg-green-deep px-10 py-9 text-white max-sm:px-6">
          <div>
            <div className="mb-16 inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-mid text-sm font-semibold">
              BAN
            </div>
            <div className="max-w-[620px]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-green-light">
                Living Field Guide
              </p>
              <h1 className="font-serif text-[48px] leading-[1.02] max-sm:text-[36px]">
                Sign in to continue site onboarding.
              </h1>
              <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-white/70">
                Each demo account keeps its own readiness, orientation, module choices, and checklist progress.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 text-[12px] max-sm:grid-cols-1">
            {['Readiness', 'Orientation', 'Progress'].map(item => (
              <div key={item} className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-white/50">Portal area</div>
                <div className="mt-1 font-medium text-white">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[10px] border border-gray-200-ban bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="font-serif text-3xl text-gray-900-ban">Demo login</h2>
              <p className="mt-2 text-[13px] leading-6 text-gray-600-ban">
                Choose a seeded account or enter the credentials from the account card.
              </p>
            </div>

            <div className="mb-6 space-y-2">
              {DEMO_ACCOUNTS.map(account => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => chooseAccount(account)}
                  className={`w-full rounded-md border px-4 py-3 text-left transition-all ${
                    selectedId === account.id
                      ? 'border-green-mid bg-green-pale'
                      : 'border-gray-200-ban bg-white hover:border-green-light'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-semibold text-gray-900-ban">{account.siteName}</div>
                      <div className="mt-0.5 text-[12px] text-gray-600-ban">{account.displayName}</div>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      account.role === 'ban'
                        ? 'bg-blue-pale text-blue-mid'
                        : 'bg-green-bg text-green-deep'
                    }`}>
                      {account.role === 'ban' ? 'BAN' : 'Site'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-400-ban max-sm:grid-cols-1">
                    <span>{account.email}</span>
                    <span>Code: {account.accessCode}</span>
                  </div>
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban">
                  Email
                </span>
                <input
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full rounded-md border border-gray-200-ban px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-green-mid"
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban">
                  Access code
                </span>
                <input
                  value={accessCode}
                  onChange={event => setAccessCode(event.target.value)}
                  className="w-full rounded-md border border-gray-200-ban px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-green-mid"
                  autoComplete="current-password"
                />
              </label>

              {error && (
                <div className="rounded-md bg-red-pale px-3 py-2 text-[12px] text-red-mid">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-green-deep px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-green-mid"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
