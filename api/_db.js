// Postgres store for participant sessions. Files starting with _ are not public routes.
//
// Production: a Postgres database reached over HTTP with @neondatabase/serverless (Neon, or any Postgres that speaks its protocol).
//   DATABASE_URL_POOLED, POSTGRES_URL or DATABASE_URL   the connection string (set it in the host's environment variables, never in the repo)
// Local testing without any account: LID_LOCAL_DB=1 uses an in-memory Postgres (PGlite) that is empty on every start.
//
// One row per session: a few columns to filter on, and the cleaned session itself as JSON.
import { neon } from "@neondatabase/serverless";

const URL_ = process.env.DATABASE_URL_POOLED || process.env.POSTGRES_URL || process.env.DATABASE_URL;
const LOCAL = process.env.LID_LOCAL_DB === "1";
export const hasDb = () => Boolean(URL_) || LOCAL;

let runner;
async function run(text, params = []) {
  if (!runner) {
    if (!URL_ && LOCAL) {
      const { PGlite } = await import("@electric-sql/pglite");
      const db = new PGlite();
      runner = async (t, p) => (await db.query(t, p)).rows;
    } else {
      const sql = neon(URL_);
      runner = (t, p) => sql.query(t, p);
    }
  }
  return runner(text, params);
}

// Tables are created only when a query finds them missing, so the common path is a single round trip
// (the database can be an ocean away from the function, and every trip counts).
let ready;
const setup = () => (ready ??= (async () => {
  await run(`CREATE TABLE IF NOT EXISTS lid_sessions (
    id text PRIMARY KEY, code text NOT NULL, route text NOT NULL, furthest text NOT NULL,
    created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL, completed_at timestamptz, data jsonb NOT NULL)`);
  await run("CREATE INDEX IF NOT EXISTS lid_sessions_code ON lid_sessions (code)");
  await run("CREATE TABLE IF NOT EXISTS lid_rate (key text NOT NULL, bucket bigint NOT NULL, n integer NOT NULL DEFAULT 0, PRIMARY KEY (key, bucket))");
  await run("CREATE TABLE IF NOT EXISTS lid_withdrawn (id text PRIMARY KEY, at timestamptz NOT NULL DEFAULT now())");
})().catch((e) => { ready = undefined; throw e; }));

const missing = (e) => e?.code === "42P01" || /does not exist/i.test(String(e?.message));
async function query(text, params) {
  try { return await run(text, params); }
  catch (e) { if (!missing(e)) throw e; await setup(); return run(text, params); }
}

// A session that was withdrawn is never saved again, even if a slow save from the browser arrives afterwards.
// A save only replaces what is stored if it is at least as new, so a slow older request that arrives late cannot undo a later one
// (for example a mid-journey save landing after the final submit).
export async function saveSession(rec) {
  await query(
    `INSERT INTO lid_sessions (id, code, route, furthest, created_at, updated_at, completed_at, data)
     SELECT $1::text, $2::text, $3::text, $4::text, $5::timestamptz, $6::timestamptz, $7::timestamptz, $8::jsonb
     WHERE NOT EXISTS (SELECT 1 FROM lid_withdrawn WHERE id = $1::text)
     ON CONFLICT (id) DO UPDATE SET furthest = EXCLUDED.furthest, updated_at = EXCLUDED.updated_at, completed_at = EXCLUDED.completed_at, data = EXCLUDED.data
     WHERE lid_sessions.code = EXCLUDED.code AND EXCLUDED.updated_at >= lid_sessions.updated_at`,
    [rec.id, rec.code, rec.route, rec.furthest, rec.createdAt, rec.updatedAt, rec.completedAt, JSON.stringify(rec)],
  );
}

// Sessions come back in pages, oldest first, because one response from a serverless function is limited to about 4.5 MB.
// A page stops at `budget` characters of data or `step` rows, and `next` is the cursor for the page after it (null at the end).
const CURSOR = /^\d{4}-\d\d-\d\dT[\d:.]+Z\|[a-z0-9_-]{1,40}$/;
export const validCursor = (c) => typeof c === "string" && CURSOR.test(c);
export async function listSessions({ after = "", budget = 2_500_000, step = 100 } = {}) {
  const [at, id] = validCursor(after) ? after.split("|") : [null, null];
  const rows = await query(
    `SELECT id, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS c, length(data::text) AS n, data
     FROM lid_sessions WHERE ($1::timestamptz IS NULL OR (created_at, id) > ($1::timestamptz, $2::text))
     ORDER BY created_at, id LIMIT $3`,
    [at, id, step],
  );
  const out = []; let size = 0; let last = null; let cut = false;
  for (const r of rows) {
    const n = Number(r.n) || 0;
    if (out.length && size + n > budget) { cut = true; break; }
    out.push(typeof r.data === "string" ? JSON.parse(r.data) : r.data); size += n; last = `${r.c}|${r.id}`;
  }
  return { sessions: out, next: cut || rows.length === step ? last : null };
}

// A participant withdraws with their own session id and code (both are needed). A researcher deletes by code alone.
// Either way the session id is remembered, so a late save from the browser cannot bring it back.
export async function deleteSession({ id, code }) {
  const rows = id
    ? await query("DELETE FROM lid_sessions WHERE id = $1 AND code = $2 RETURNING id", [id, code])
    : await query("DELETE FROM lid_sessions WHERE code = $1 RETURNING id", [code]);
  for (const r of rows) await query("INSERT INTO lid_withdrawn (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [r.id]);
  return rows.length;
}

// Counts how many times a key (an IP address) has been seen in the current window. Old windows are tidied now and then.
export async function hit(key, windowSeconds = 600) {
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const rows = await query("INSERT INTO lid_rate (key, bucket, n) VALUES ($1, $2, 1) ON CONFLICT (key, bucket) DO UPDATE SET n = lid_rate.n + 1 RETURNING n", [key, bucket]);
  if (Math.random() < 0.02) await query("DELETE FROM lid_rate WHERE bucket < $1", [bucket - 2]);
  return Number(rows[0]?.n ?? 1);
}
