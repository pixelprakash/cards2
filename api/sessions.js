// Shared store for participant sessions (Vercel serverless function, Node runtime).
//   POST   /api/sessions   a participant's browser saves or updates its session (no login; cleaned here; rate limited)
//   GET    /api/sessions   the researcher view reads every session; needs the signed-in researcher cookie (see api/session.js)
//   DELETE /api/sessions   a participant withdraws ({ id, code } together), or a researcher deletes by code ({ code }, signed in)
// Without a database the function answers 503 and each browser keeps its own copy.
import { currentUser } from "./_auth.js";
import { sanitise } from "./_record.js";
import { deleteSession, hasDb, hit, listSessions, saveSession, validCursor } from "./_db.js";

const MAX_BODY = 1_000_000;   // the cleaned copy is capped again in _record.js; a very thorough participant can reach several hundred KB
const POSTS_PER_10_MIN = 900;   // per IP; a whole class behind one school network address (each person saves a handful of times) stays well under this
const json = (res, status, body) => { res.setHeader("cache-control", "no-store"); res.status(status).json(body); };
const parse = (body) => { if (typeof body === "string") { try { return JSON.parse(body); } catch { return null; } } return body ?? null; };
const ip = (req) => String(req.headers["x-forwarded-for"] || "local").split(",")[0].trim().slice(0, 64);
const CODE = /^LID-[A-Z0-9]{6}$/;
const ID = /^[a-z0-9_-]{1,40}$/;

export default async function handler(req, res) {
  if (req.method === "GET" && !currentUser(req)) return json(res, 401, { error: "Sign in first." });
  if (!hasDb()) return json(res, 503, { error: "The shared database is not connected." });
  try {
    if (req.method === "POST") {
      let sent; try { sent = req.body; } catch { return json(res, 400, { error: "Not valid JSON." }); }
      const raw = typeof sent === "string" ? sent : JSON.stringify(sent ?? {});
      if (raw.length > MAX_BODY) return json(res, 413, { error: "Too large." });
      if ((await hit(`post:${ip(req)}`)) > POSTS_PER_10_MIN) return json(res, 429, { error: "Too many requests for now." });
      const rec = sanitise(parse(sent));
      if (!rec) return json(res, 400, { error: "Not a valid session." });
      await saveSession(rec);
      return json(res, 200, { ok: true });
    }
    if (req.method === "GET") {
      const after = new URL(req.url || "/", "http://x").searchParams.get("after") || "";
      if (after && !validCursor(after)) return json(res, 400, { error: "Not a valid page." });
      return json(res, 200, await listSessions({ after }));
    }
    if (req.method === "DELETE") {
      let sent; try { sent = req.body; } catch { return json(res, 400, { error: "Not valid JSON." }); }
      const body = parse(sent) ?? {};
      const code = typeof body.code === "string" ? body.code : "";
      const id = typeof body.id === "string" ? body.id : "";
      if (!CODE.test(code)) return json(res, 400, { error: "Not a valid code." });
      if (id) {
        if (!ID.test(id)) return json(res, 400, { error: "Not a valid session." });
        return json(res, 200, { deleted: await deleteSession({ id, code }) });   // a participant withdrawing: both must match
      }
      if (!currentUser(req)) return json(res, 401, { error: "Sign in first." });   // a researcher deleting by code
      return json(res, 200, { deleted: await deleteSession({ code }) });
    }
    res.setHeader("allow", "GET, POST, DELETE");
    return json(res, 405, { error: "Method not allowed." });
  } catch {
    return json(res, 500, { error: "Something went wrong." });
  }
}
