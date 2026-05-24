import crypto from 'node:crypto'
import { Pool } from 'pg'
import { DEMO_ACCOUNTS, type UserRole } from '@/data/demoAccounts'
import { INITIAL_TEAM_STATE, type TeamState } from '@/data/teamState'
import { phases } from '@/data/phases'

export interface DbSession {
  token: string
  userId: string
  accountId: string
  displayName: string
  email: string
  role: UserRole
  siteId: string
  siteName: string
}

export interface SiteAnalytics {
  siteId: string
  siteName: string
  status: string
  phase: string
  phaseClass: string
  checklistDone: number
  checklistTotal: number
  checklistPct: number
  arcCompleted: boolean
  readinessComplete: boolean
  selectedModules: string[]
  moduleInputCount: number
  lastActivityAt: string | null
}

const CHECKLIST_TOTAL = phases.reduce(
  (total, phase) => total + phase.groups.reduce((groupTotal, group) => groupTotal + group.tasks.length, 0),
  0,
)

let pool: Pool | null = null
let initialized: Promise<void> | null = null

function now() {
  return new Date().toISOString()
}

function safeJson<T>(raw: unknown, fallback: T): T {
  if (!raw) return fallback
  if (typeof raw === 'object') return raw as T
  try {
    return JSON.parse(String(raw)) as T
  } catch {
    return fallback
  }
}

function phaseClass(phase: string) {
  if (phase === 'Training') return 'ph-train'
  if (phase === 'Registering') return 'ph-reg'
  if (phase === 'Activation') return 'ph-act'
  return 'ph-join'
}

function checklistPhase(checks: Record<string, boolean>) {
  const phaseNames = ['Joining', 'Training', 'Registering', 'Activation']
  let current = phaseNames[0]

  phases.forEach((phase, phaseIndex) => {
    let done = 0
    let total = 0
    phase.groups.forEach(group => group.tasks.forEach((_, taskIndex) => {
      total++
      if (checks[`${phaseIndex}-${group.lbl}-${taskIndex}`]) done++
    }))
    if (total > 0 && done === total) {
      current = phaseNames[Math.min(phaseIndex + 1, phaseNames.length - 1)]
    }
  })

  return current
}

function getPool() {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for database-backed progress.')
  }

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.co')
      ? { rejectUnauthorized: false }
      : undefined,
  })

  return pool
}

async function ensureDb() {
  if (!initialized) {
    initialized = (async () => {
      const db = getPool()
      await db.query(`
        CREATE TABLE IF NOT EXISTS sites (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL UNIQUE,
          site_id TEXT NOT NULL REFERENCES sites(id),
          email TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('site', 'ban')),
          access_code TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS auth_sessions (
          token TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id),
          created_at TIMESTAMPTZ NOT NULL,
          last_seen_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS site_progress (
          site_id TEXT PRIMARY KEY REFERENCES sites(id),
          state_json JSONB NOT NULL,
          updated_by TEXT REFERENCES users(id),
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS checklist_progress (
          site_id TEXT PRIMARY KEY REFERENCES sites(id),
          checks_json JSONB NOT NULL,
          updated_by TEXT REFERENCES users(id),
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS module_inputs (
          id BIGSERIAL PRIMARY KEY,
          site_id TEXT NOT NULL REFERENCES sites(id),
          user_id TEXT NOT NULL REFERENCES users(id),
          module_id TEXT,
          card_id TEXT NOT NULL,
          input_type TEXT NOT NULL,
          payload_json JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          UNIQUE(site_id, card_id, input_type)
        );
      `)
      await seedDemoData()
    })()
  }

  await initialized
  return getPool()
}

async function seedDemoData() {
  const db = getPool()
  const timestamp = now()

  for (const account of DEMO_ACCOUNTS) {
    await db.query(
      `
        INSERT INTO sites (id, name, status, created_at, updated_at)
        VALUES ($1, $2, 'active', $3, $3)
        ON CONFLICT(id) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = EXCLUDED.updated_at
      `,
      [account.siteId, account.siteName, timestamp],
    )

    await db.query(
      `
        INSERT INTO users (id, account_id, site_id, email, display_name, role, access_code, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        ON CONFLICT(account_id) DO UPDATE SET
          site_id = EXCLUDED.site_id,
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          role = EXCLUDED.role,
          access_code = EXCLUDED.access_code,
          updated_at = EXCLUDED.updated_at
      `,
      [
        account.id,
        account.id,
        account.siteId,
        account.email.toLowerCase(),
        account.displayName,
        account.role,
        account.accessCode.toUpperCase(),
        timestamp,
      ],
    )

    await db.query(
      `
        INSERT INTO site_progress (site_id, state_json, updated_by, updated_at)
        VALUES ($1, $2::jsonb, $3, $4)
        ON CONFLICT(site_id) DO NOTHING
      `,
      [account.siteId, JSON.stringify(INITIAL_TEAM_STATE), account.id, timestamp],
    )

    await db.query(
      `
        INSERT INTO checklist_progress (site_id, checks_json, updated_by, updated_at)
        VALUES ($1, '{}'::jsonb, $2, $3)
        ON CONFLICT(site_id) DO NOTHING
      `,
      [account.siteId, account.id, timestamp],
    )
  }
}

export async function initDatabase() {
  await ensureDb()
  return { provider: 'postgres' }
}

export async function login(email: string, accessCode: string): Promise<DbSession | null> {
  const db = await ensureDb()
  const { rows } = await db.query(
    `
      SELECT
        users.id AS "userId",
        users.account_id AS "accountId",
        users.email,
        users.display_name AS "displayName",
        users.role,
        users.site_id AS "siteId",
        sites.name AS "siteName"
      FROM users
      JOIN sites ON sites.id = users.site_id
      WHERE lower(users.email) = $1 AND upper(users.access_code) = $2
    `,
    [email.trim().toLowerCase(), accessCode.trim().toUpperCase()],
  )
  const user = rows[0]

  if (!user) return null

  const token = crypto.randomBytes(32).toString('hex')
  const timestamp = now()
  await db.query(
    `
      INSERT INTO auth_sessions (token, user_id, created_at, last_seen_at)
      VALUES ($1, $2, $3, $3)
    `,
    [token, user.userId, timestamp],
  )

  return {
    token,
    userId: user.userId,
    accountId: user.accountId,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    siteId: user.siteId,
    siteName: user.siteName,
  }
}

export async function getSession(token: string | null): Promise<DbSession | null> {
  if (!token) return null
  const db = await ensureDb()
  const { rows } = await db.query(
    `
      SELECT
        auth_sessions.token,
        users.id AS "userId",
        users.account_id AS "accountId",
        users.email,
        users.display_name AS "displayName",
        users.role,
        users.site_id AS "siteId",
        sites.name AS "siteName"
      FROM auth_sessions
      JOIN users ON users.id = auth_sessions.user_id
      JOIN sites ON sites.id = users.site_id
      WHERE auth_sessions.token = $1
    `,
    [token],
  )
  const session = rows[0]

  if (!session) return null

  await db.query('UPDATE auth_sessions SET last_seen_at = $1 WHERE token = $2', [now(), token])
  return {
    token: session.token,
    userId: session.userId,
    accountId: session.accountId,
    displayName: session.displayName,
    email: session.email,
    role: session.role,
    siteId: session.siteId,
    siteName: session.siteName,
  }
}

export function sessionFromRequest(request: Request) {
  return getSession(request.headers.get('x-ban-session'))
}

export function canAccessSite(session: DbSession, siteId: string) {
  return session.role === 'ban' || session.siteId === siteId
}

export async function readSiteProgress(siteId: string): Promise<{ state: TeamState; updatedAt: string | null }> {
  const db = await ensureDb()
  const { rows } = await db.query(
    'SELECT state_json AS "stateJson", updated_at AS "updatedAt" FROM site_progress WHERE site_id = $1',
    [siteId],
  )
  const row = rows[0]

  return {
    state: row ? { ...INITIAL_TEAM_STATE, ...safeJson<TeamState>(row.stateJson, INITIAL_TEAM_STATE) } : INITIAL_TEAM_STATE,
    updatedAt: row?.updatedAt?.toISOString?.() ?? row?.updatedAt ?? null,
  }
}

export async function writeSiteProgress(siteId: string, userId: string, state: TeamState) {
  const db = await ensureDb()
  await db.query(
    `
      INSERT INTO site_progress (site_id, state_json, updated_by, updated_at)
      VALUES ($1, $2::jsonb, $3, $4)
      ON CONFLICT(site_id) DO UPDATE SET
        state_json = EXCLUDED.state_json,
        updated_by = EXCLUDED.updated_by,
        updated_at = EXCLUDED.updated_at
    `,
    [siteId, JSON.stringify({ ...INITIAL_TEAM_STATE, ...state }), userId, now()],
  )
}

export async function readChecklist(siteId: string): Promise<{ checks: Record<string, boolean>; updatedAt: string | null }> {
  const db = await ensureDb()
  const { rows } = await db.query(
    'SELECT checks_json AS "checksJson", updated_at AS "updatedAt" FROM checklist_progress WHERE site_id = $1',
    [siteId],
  )
  const row = rows[0]

  return {
    checks: row ? safeJson<Record<string, boolean>>(row.checksJson, {}) : {},
    updatedAt: row?.updatedAt?.toISOString?.() ?? row?.updatedAt ?? null,
  }
}

export async function writeChecklist(siteId: string, userId: string, checks: Record<string, boolean>) {
  const db = await ensureDb()
  await db.query(
    `
      INSERT INTO checklist_progress (site_id, checks_json, updated_by, updated_at)
      VALUES ($1, $2::jsonb, $3, $4)
      ON CONFLICT(site_id) DO UPDATE SET
        checks_json = EXCLUDED.checks_json,
        updated_by = EXCLUDED.updated_by,
        updated_at = EXCLUDED.updated_at
    `,
    [siteId, JSON.stringify(checks), userId, now()],
  )
}

export async function writeModuleInput({
  siteId,
  userId,
  moduleId,
  cardId,
  inputType,
  payload,
}: {
  siteId: string
  userId: string
  moduleId: string | null
  cardId: string
  inputType: string
  payload: unknown
}) {
  const db = await ensureDb()
  const timestamp = now()
  await db.query(
    `
      INSERT INTO module_inputs (site_id, user_id, module_id, card_id, input_type, payload_json, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $7)
      ON CONFLICT(site_id, card_id, input_type) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        module_id = EXCLUDED.module_id,
        payload_json = EXCLUDED.payload_json,
        updated_at = EXCLUDED.updated_at
    `,
    [siteId, userId, moduleId, cardId, inputType, JSON.stringify(payload), timestamp],
  )
}

export async function readAdminAnalytics(): Promise<{ sites: SiteAnalytics[]; totals: Record<string, number> }> {
  const db = await ensureDb()
  const { rows } = await db.query(`
    SELECT
      sites.id AS "siteId",
      sites.name AS "siteName",
      sites.status,
      site_progress.state_json AS "stateJson",
      site_progress.updated_at AS "progressUpdatedAt",
      checklist_progress.checks_json AS "checksJson",
      checklist_progress.updated_at AS "checklistUpdatedAt",
      COUNT(module_inputs.id) AS "moduleInputCount",
      MAX(module_inputs.updated_at) AS "moduleUpdatedAt"
    FROM sites
    LEFT JOIN site_progress ON site_progress.site_id = sites.id
    LEFT JOIN checklist_progress ON checklist_progress.site_id = sites.id
    LEFT JOIN module_inputs ON module_inputs.site_id = sites.id
    WHERE sites.id != 'ban-core'
    GROUP BY sites.id, site_progress.state_json, site_progress.updated_at, checklist_progress.checks_json, checklist_progress.updated_at
    ORDER BY sites.name ASC
  `)

  const sites = rows.map(row => {
    const state = { ...INITIAL_TEAM_STATE, ...safeJson<TeamState>(row.stateJson, INITIAL_TEAM_STATE) }
    const checks = safeJson<Record<string, boolean>>(row.checksJson, {})
    const checklistDone = Object.values(checks).filter(Boolean).length
    const checklistPct = CHECKLIST_TOTAL ? Math.round((checklistDone / CHECKLIST_TOTAL) * 100) : 0
    const phase = state.arcCompleted ? checklistPhase(checks) : 'Joining'
    const lastActivityAt = [row.progressUpdatedAt, row.checklistUpdatedAt, row.moduleUpdatedAt]
      .filter(Boolean)
      .map(value => value?.toISOString?.() ?? String(value))
      .sort()
      .at(-1) ?? null

    return {
      siteId: row.siteId,
      siteName: row.siteName,
      status: row.status,
      phase,
      phaseClass: phaseClass(phase),
      checklistDone,
      checklistTotal: CHECKLIST_TOTAL,
      checklistPct,
      arcCompleted: !!state.arcCompleted,
      readinessComplete: !!state.readiness,
      selectedModules: state.selectedModules,
      moduleInputCount: Number(row.moduleInputCount || 0),
      lastActivityAt,
    }
  })

  const totals = {
    totalSites: sites.length,
    readinessComplete: sites.filter(site => site.readinessComplete).length,
    arcComplete: sites.filter(site => site.arcCompleted).length,
    moduleInputs: sites.reduce((sum, site) => sum + site.moduleInputCount, 0),
    averageChecklistPct: sites.length
      ? Math.round(sites.reduce((sum, site) => sum + site.checklistPct, 0) / sites.length)
      : 0,
  }

  return { sites, totals }
}
