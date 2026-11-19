// Sends the session to the shared database so the researchers can see it. The server cleans it again.
// The browser remembers which version the server last confirmed, so a failed send is retried (see SessionContext)
// instead of being lost: weak signal, a cold server or a rate limit must not cost a participant's submission.

const SYNCED = "lid.synced.v1";
const read = () => { try { return JSON.parse(localStorage.getItem(SYNCED) || "null"); } catch { return null; } };

export function markSynced(session) {
  try { localStorage.setItem(SYNCED, JSON.stringify({ id: session.id, at: session.updatedAt })); } catch { /* ignore */ }
}

// True when this browser holds a newer version than the one the server confirmed.
export function needsSync(session) {
  if (!session?.route) return false;
  const m = read();
  return !m || m.id !== session.id || m.at < session.updatedAt;
}

// "ok" = the server has it; "retry" = try again later (offline, busy, server error); "drop" = it will never be accepted, stop.
export async function syncSession(session, { beacon = false } = {}) {
  const body = JSON.stringify(session);
  try {
    if (beacon && navigator.sendBeacon) {
      // A beacon is fire-and-forget: it cannot tell us the result, so the version stays "unconfirmed" and is re-sent on the next visit.
      return navigator.sendBeacon("/api/sessions", new Blob([body], { type: "application/json" })) ? "ok" : "retry";
    }
    const res = await fetch("/api/sessions", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: body.length < 60000 });
    if (res.ok) { markSynced(session); return "ok"; }
    return res.status === 400 || res.status === 413 ? "drop" : "retry";
  } catch { return "retry"; }
}
