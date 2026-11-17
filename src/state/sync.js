// Sends the session to the shared database so the researchers can see it. The server cleans it again.
// Failures are silent: the participant's own copy is kept in the browser regardless.

export async function syncSession(session, { beacon = false } = {}) {
  const body = JSON.stringify(session);
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/sessions", new Blob([body], { type: "application/json" }));
      return true;
    }
    const res = await fetch("/api/sessions", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
    return res.ok;
  } catch { return false; }
}
