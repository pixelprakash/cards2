import { useState } from "react";
import { signIn } from "./api.js";

export default function SignIn({ onDone }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setMsg(""); setBusy(true);
    try { onDone(await signIn(user.trim(), password)); } catch (err) { setMsg(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="wrap narrow" style={{ paddingBlock: "2rem" }}>
      <p className="eyebrow">Researcher view</p>
      <h1 className="display" style={{ margin: "0.6rem 0 1rem" }}>Sign <b>in</b></h1>
      <p className="lede" style={{ marginBottom: "2rem" }}>This page is for the research team. Enter the user ID and password you were given.</p>
      <form className="login" onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="u">User ID</label><input id="u" className="input" name="user" autoComplete="username" autoCapitalize="off" spellCheck="false" value={user} onChange={(e) => setUser(e.target.value)} required /></div>
        <div className="field"><label htmlFor="p">Password</label><input id="p" className="input" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <div><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<span className="ico" aria-hidden="true">→</span></button></div>
        <p className="error" role="alert">{msg}</p>
      </form>
    </div>
  );
}
