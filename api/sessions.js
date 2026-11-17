// Shared store for participant sessions (Vercel serverless function, Node runtime).
//   POST /api/sessions   a participant's browser saves or updates its session (no login; cleaned here)
//   GET  /api/sessions   the researcher view reads every session; needs the signed-in researcher cookie (see api/session.js)
// Without the database variables the function answers 503 and each browser keeps its own copy.
import { currentUser } from "./_auth.js";
import { sanitise } from "./_record.js";
import { redis, hasDb, HASH } from "./_db.js";

const MAX_BODY = 120_000;
const json = (res, status, body) => { res.setHeader("cache-control", "no-store"); res.status(status).json(body); };

export default async function handler(req, res) {
  if (req.method === "GET" && !currentUser(req)) return json(res, 401, { error: "Sign in first." });
  if (!hasDb()) return json(res, 503, { error: "The shared database is not connected." });
  try {
    if (req.method === "POST") {
      const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
      if (raw.length > MAX_BODY) return json(res, 413, { error: "Too large." });
      const rec = sanitise(typeof req.body === "string" ? JSON.parse(raw) : req.body);
      if (!rec) return json(res, 400, { error: "Not a valid session." });
      await redis("HSET", HASH, rec.id, JSON.stringify(rec));
      return json(res, 200, { ok: true });
    }
    if (req.method === "GET") {
      const rows = (await redis("HVALS", HASH)) || [];
      const sessions = rows.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
      sessions.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return json(res, 200, { sessions });
    }
    res.setHeader("allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed." });
  } catch {
    return json(res, 500, { error: "Something went wrong." });
  }
}
