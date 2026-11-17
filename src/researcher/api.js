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
export async function loadSessions() {
  const res = await fetch("/api/sessions");
  if (res.status === 401) return { auth: false };
  if (res.status === 503) return { auth: true, sessions: [], offline: true };
  if (!res.ok) throw new Error("Could not load the data.");
  return { auth: true, sessions: (await j(res)).sessions ?? [] };
}
