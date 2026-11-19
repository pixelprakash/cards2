// Calls to the sign-in and data endpoints.
const j = (res) => res.json().catch(() => ({}));

export async function whoami() {
  const res = await fetch("/api/session"); return res.ok ? (await j(res)).user : null;
}
export async function signIn(user, password) {
  const res = await fetch("/api/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user, password }) });
  const body = await j(res); if (!res.ok) throw new Error(body.error || "Could not sign in."); return body.user;
}
export async function signOut() { await fetch("/api/session", { method: "DELETE" }); }
// Loads every participant, a page at a time (one response from the server is limited in size).
export async function loadSessions() {
  const all = [];
  let after = "";
  for (let page = 0; page < 500; page++) {
    const res = await fetch(`/api/sessions${after ? `?after=${encodeURIComponent(after)}` : ""}`);
    if (res.status === 401) return { auth: false };
    if (res.status === 503) return { auth: true, sessions: [], offline: true };
    if (!res.ok) throw new Error("Could not load the data.");
    const body = await j(res);
    all.push(...(body.sessions ?? []));
    if (!body.next) return { auth: true, sessions: all };
    after = body.next;
  }
  throw new Error("There is more data than can be loaded at once. Please ask for a filtered export.");
}

export async function deleteByCode(code) {
  const res = await fetch("/api/sessions", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
  if (!res.ok) throw new Error((await j(res)).error || "Could not delete.");
  return (await j(res)).deleted ?? 0;
}
