import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { DEMO_ACCOUNTS, type UserRole } from '@/data/demoAccounts'
import { INITIAL_TEAM_STATE, type TeamState } from '@/data/teamState'
import { phases } from '@/data/phases'

type DatabaseSync = {
  exec: (sql: string) => void
  prepare: (sql: string) => {
    all: (...params: unknown[]) => any[]
    get: (...params: unknown[]) => any
    run: (...params: unknown[]) => unknown
  }
}

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

const DB_PATH = process.env.BAN_DB_PATH || path.join(process.cwd(), '.data', 'ban.sqlite')
const CHECKLIST_TOTAL = phases.reduce(
  (total, phase) => total + phase.groups.reduce((groupTotal, group) => groupTotal + group.tasks.length, 0),
  0,
)

let db: DatabaseSync | null = null

function now() {
  return new Date().toISOString()
}

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
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

function ensureDb() {
  if (db) return db

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  const { DatabaseSync: NodeDatabaseSync } = require('node:sqlite') as {
    DatabaseSync: new (filename: string) => DatabaseSync
  }
  db = new NodeDatabaseSync(DB_PATH)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')
  db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL UNIQUE,
      site_id TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('site', 'ban')),
      access_code TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (site_id) REFERENCES sites(id)
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS site_progress (
      site_id TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (site_id) REFERENCES sites(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS checklist_progress (
      site_id TEXT PRIMARY KEY,
      checks_json TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (site_id) REFERENCES sites(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS module_inputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      module_id TEXT,
      card_id TEXT NOT NULL,
      input_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(site_id, card_id, input_type),
      FOREIGN KEY (site_id) REFERENCES sites(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)
  seedDemoData(db)
  return db
}

function seedDemoData(database: DatabaseSync) {
  const timestamp = now()
  for (const account of DEMO_ACCOUNTS) {
    database.prepare(`
      INSERT INTO sites (id, name, status, created_at, updated_at)
      VALUES (?, ?, 'active', ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        updated_at = excluded.updated_at
    `).run(account.siteId, account.siteName, timestamp, timestamp)

    database.prepare(`
      INSERT INTO users (id, account_id, site_id, email, display_name, role, access_code, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(account_id) DO UPDATE SET
        site_id = excluded.site_id,
        email = excluded.email,
        display_name = excluded.display_name,
        role = excluded.role,
        access_code = excluded.access_code,
        updated_at = excluded.updated_at
    `).run(
      account.id,
      account.id,
      account.siteId,
      account.email.toLowerCase(),
      account.displayName,
      account.role,
      account.accessCode.toUpperCase(),
      timestamp,
      timestamp,
    )

    database.prepare(`
      INSERT INTO site_progress (site_id, state_json, updated_by, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(site_id) DO NOTHING
    `).run(account.siteId, JSON.stringify(INITIAL_TEAM_STATE), account.id, timestamp)

    database.prepare(`
      INSERT INTO checklist_progress (site_id, checks_json, updated_by, updated_at)
      VALUES (?, '{}', ?, ?)
      ON CONFLICT(site_id) DO NOTHING
    `).run(account.siteId, account.id, timestamp)
  }
}

export function initDatabase() {
  ensureDb()
  return { dbPath: DB_PATH }
}

export function login(email: string, accessCode: string): DbSession | null {
  const database = ensureDb()
  const user = database.prepare(`
    SELECT
      users.id AS userId,
      users.account_id AS accountId,
      users.email,
      users.display_name AS displayName,
      users.role,
      users.site_id AS siteId,
      sites.name AS siteName
    FROM users
    JOIN sites ON sites.id = users.site_id
    WHERE lower(users.email) = ? AND upper(users.access_code) = ?
  `).get(email.trim().toLowerCase(), accessCode.trim().toUpperCase())

  if (!user) return null

  const token = crypto.randomBytes(32).toString('hex')
  const timestamp = now()
  database.prepare(`
    INSERT INTO auth_sessions (token, user_id, created_at, last_seen_at)
    VALUES (?, ?, ?, ?)
  `).run(token, user.userId, timestamp, timestamp)

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

export function getSession(token: string | null): DbSession | null {
  if (!token) return null
  const database = ensureDb()
  const session = database.prepare(`
    SELECT
      auth_sessions.token,
      users.id AS userId,
      users.account_id AS accountId,
      users.email,
      users.display_name AS displayName,
      users.role,
      users.site_id AS siteId,
      sites.name AS siteName
    FROM auth_sessions
    JOIN users ON users.id = auth_sessions.user_id
    JOIN sites ON sites.id = users.site_id
    WHERE auth_sessions.token = ?
  `).get(token)

  if (!session) return null

  database.prepare('UPDATE auth_sessions SET last_seen_at = ? WHERE token = ?').run(now(), token)
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

export function readSiteProgress(siteId: string): { state: TeamState; updatedAt: string | null } {
  const row = ensureDb().prepare('SELECT state_json, updated_at FROM site_progress WHERE site_id = ?').get(siteId)
  return {
    state: row ? { ...INITIAL_TEAM_STATE, ...safeJson<TeamState>(row.state_json, INITIAL_TEAM_STATE) } : INITIAL_TEAM_STATE,
    updatedAt: row?.updated_at ?? null,
  }
}

export function writeSiteProgress(siteId: string, userId: string, state: TeamState) {
  ensureDb().prepare(`
    INSERT INTO site_progress (site_id, state_json, updated_by, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(site_id) DO UPDATE SET
      state_json = excluded.state_json,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  `).run(siteId, JSON.stringify({ ...INITIAL_TEAM_STATE, ...state }), userId, now())
}

export function readChecklist(siteId: string): { checks: Record<string, boolean>; updatedAt: string | null } {
  const row = ensureDb().prepare('SELECT checks_json, updated_at FROM checklist_progress WHERE site_id = ?').get(siteId)
  return {
    checks: row ? safeJson<Record<string, boolean>>(row.checks_json, {}) : {},
    updatedAt: row?.updated_at ?? null,
  }
}

export function writeChecklist(siteId: string, userId: string, checks: Record<string, boolean>) {
  ensureDb().prepare(`
    INSERT INTO checklist_progress (site_id, checks_json, updated_by, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(site_id) DO UPDATE SET
      checks_json = excluded.checks_json,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at
  `).run(siteId, JSON.stringify(checks), userId, now())
}

export function writeModuleInput({
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
  const timestamp = now()
  ensureDb().prepare(`
    INSERT INTO module_inputs (site_id, user_id, module_id, card_id, input_type, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(site_id, card_id, input_type) DO UPDATE SET
      user_id = excluded.user_id,
      module_id = excluded.module_id,
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at
  `).run(siteId, userId, moduleId, cardId, inputType, JSON.stringify(payload), timestamp, timestamp)
}

export function readAdminAnalytics(): { sites: SiteAnalytics[]; totals: Record<string, number> } {
  const database = ensureDb()
  const rows = database.prepare(`
    SELECT
      sites.id AS siteId,
      sites.name AS siteName,
      sites.status,
      site_progress.state_json AS stateJson,
      site_progress.updated_at AS progressUpdatedAt,
      checklist_progress.checks_json AS checksJson,
      checklist_progress.updated_at AS checklistUpdatedAt,
      COUNT(module_inputs.id) AS moduleInputCount,
      MAX(module_inputs.updated_at) AS moduleUpdatedAt
    FROM sites
    LEFT JOIN site_progress ON site_progress.site_id = sites.id
    LEFT JOIN checklist_progress ON checklist_progress.site_id = sites.id
    LEFT JOIN module_inputs ON module_inputs.site_id = sites.id
    WHERE sites.id != 'ban-core'
    GROUP BY sites.id
    ORDER BY sites.name ASC
  `).all()

  const sites = rows.map(row => {
    const state = { ...INITIAL_TEAM_STATE, ...safeJson<TeamState>(row.stateJson, INITIAL_TEAM_STATE) }
    const checks = safeJson<Record<string, boolean>>(row.checksJson, {})
    const checklistDone = Object.values(checks).filter(Boolean).length
    const checklistPct = CHECKLIST_TOTAL ? Math.round((checklistDone / CHECKLIST_TOTAL) * 100) : 0
    const phase = state.arcCompleted ? checklistPhase(checks) : 'Joining'
    const lastActivityAt = [row.progressUpdatedAt, row.checklistUpdatedAt, row.moduleUpdatedAt]
      .filter(Boolean)
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
