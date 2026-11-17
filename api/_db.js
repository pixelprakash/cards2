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

let ready;
const setup = () => (ready ??= (async () => {
  await run(`CREATE TABLE IF NOT EXISTS lid_sessions (
    id text PRIMARY KEY, code text NOT NULL, route text NOT NULL, furthest text NOT NULL,
    created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL, completed_at timestamptz, data jsonb NOT NULL)`);
  await run("CREATE INDEX IF NOT EXISTS lid_sessions_code ON lid_sessions (code)");
  await run("CREATE TABLE IF NOT EXISTS lid_rate (key text NOT NULL, bucket bigint NOT NULL, n integer NOT NULL DEFAULT 0, PRIMARY KEY (key, bucket))");
})().catch((e) => { ready = undefined; throw e; }));

export async function saveSession(rec) {
  await setup();
  await run(
    `INSERT INTO lid_sessions (id, code, route, furthest, created_at, updated_at, completed_at, data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     ON CONFLICT (id) DO UPDATE SET furthest = EXCLUDED.furthest, updated_at = EXCLUDED.updated_at, completed_at = EXCLUDED.completed_at, data = EXCLUDED.data
     WHERE lid_sessions.code = EXCLUDED.code`,
    [rec.id, rec.code, rec.route, rec.furthest, rec.createdAt, rec.updatedAt, rec.completedAt, JSON.stringify(rec)],
  );
}

export async function listSessions() {
  await setup();
  const rows = await run("SELECT data FROM lid_sessions ORDER BY created_at");
  return rows.map((r) => (typeof r.data === "string" ? JSON.parse(r.data) : r.data));
}

// A participant withdraws with their own session id and code (both are needed). A researcher deletes by code alone.
export async function deleteSession({ id, code }) {
  await setup();
  const rows = id
    ? await run("DELETE FROM lid_sessions WHERE id = $1 AND code = $2 RETURNING id", [id, code])
    : await run("DELETE FROM lid_sessions WHERE code = $1 RETURNING id", [code]);
  return rows.length;
}

// Counts how many times a key (an IP address) has been seen in the current window. Old windows are tidied now and then.
export async function hit(key, windowSeconds = 600) {
  await setup();
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const rows = await run("INSERT INTO lid_rate (key, bucket, n) VALUES ($1, $2, 1) ON CONFLICT (key, bucket) DO UPDATE SET n = lid_rate.n + 1 RETURNING n", [key, bucket]);
  if (Math.random() < 0.02) await run("DELETE FROM lid_rate WHERE bucket < $1", [bucket - 2]);
  return Number(rows[0]?.n ?? 1);
}
