export type UserRole = 'site' | 'ban'

export interface DemoAccount {
  id: string
  displayName: string
  email: string
  accessCode: string
  siteId: string
  siteName: string
  role: UserRole
}

export interface AuthSession {
  accountId: string
  displayName: string
  email: string
  siteId: string
  siteName: string
  role: UserRole
  progressKey: string
  signedInAt: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'mgh-clinical-lead',
    displayName: 'Mass General clinical lead',
    email: 'mgh.lead@ban-demo.org',
    accessCode: 'MGH-BAN',
    siteId: 'mass-general',
    siteName: 'Mass General',
    role: 'site',
  },
  {
    id: 'cambridge-coordinator',
    displayName: 'Cambridge improvement coordinator',
    email: 'cambridge.coordinator@ban-demo.org',
    accessCode: 'CHA-BAN',
    siteId: 'cambridge-health-alliance',
    siteName: 'Cambridge Health Alliance',
    role: 'site',
  },
  {
    id: 'northwestern-champion',
    displayName: 'Northwestern clinical champion',
    email: 'northwestern.champion@ban-demo.org',
    accessCode: 'NM-BAN',
    siteId: 'northwestern-medicine',
    siteName: 'Northwestern Medicine',
    role: 'site',
  },
  {
    id: 'ban-core-admin',
    displayName: 'BAN core team',
    email: 'core@ban-demo.org',
    accessCode: 'BAN-ADMIN',
    siteId: 'ban-core',
    siteName: 'BAN Core Team',
    role: 'ban',
  },
]

export const DEMO_SITE_ROLLUPS = [
  { n: 'Mass General', ph: 'Joining', pc: 'ph-join', pct: 8 },
  { n: 'Cambridge Health Alliance', ph: 'Training', pc: 'ph-train', pct: 38 },
  { n: 'Northwestern Medicine', ph: 'Joining', pc: 'ph-join', pct: 17 },
  { n: 'UTSW / PCORI', ph: 'Registering', pc: 'ph-reg', pct: 68 },
  { n: 'Site #4 (pending LOJ)', ph: 'Joining', pc: 'ph-join', pct: 5 },
]

export function accountToSession(account: DemoAccount): AuthSession {
  return {
    accountId: account.id,
    displayName: account.displayName,
    email: account.email,
    siteId: account.siteId,
    siteName: account.siteName,
    role: account.role,
    progressKey: `${account.siteId}:${account.id}`,
    signedInAt: new Date().toISOString(),
  }
}

export function findDemoAccount(email: string, accessCode: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = accessCode.trim().toUpperCase()

  return DEMO_ACCOUNTS.find(
    account =>
      account.email.toLowerCase() === normalizedEmail &&
      account.accessCode.toUpperCase() === normalizedCode,
  )
}
