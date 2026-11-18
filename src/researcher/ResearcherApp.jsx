import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteByCode, loadSessions, signOut, whoami } from "./api.js";
import { sampleSessions } from "./sample.js";
import SignIn from "./SignIn.jsx";
import Dashboard from "./Dashboard.jsx";

export default function ResearcherApp() {
  const [user, setUser] = useState(undefined);   // undefined = checking
  const [data, setData] = useState({ sessions: [], offline: false });
  const [sampleOn, setSampleOn] = useState(false);
  const [err, setErr] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const sample = useMemo(() => sampleSessions(), []);

  const load = useCallback(async () => {
    try {
      const r = await loadSessions();
      if (!r.auth) { setUser(null); return; }
      setData({ sessions: r.sessions, offline: Boolean(r.offline) }); setUpdatedAt(new Date()); setErr("");
    } catch (e) { setErr(e.message); }
  }, []);

  useEffect(() => { document.title = "Researcher view · Learning Institutions by Design"; whoami().then((u) => { setUser(u ?? null); if (u) load(); }); }, [load]);

  const remove = async (code) => { try { await deleteByCode(code); await load(); } catch (e) { setErr(e.message); } };
  const out = async () => { await signOut(); setUser(null); setData({ sessions: [], offline: false }); };

  return (
    <div className="shell">
      <header className="wrap r-top">
        <a className="brand" href="/"><span>learning institutions by design</span><small>Researcher view</small></a>
        {user && <div className="topbar-actions"><button type="button" className="btn btn-soft btn-small" onClick={out}>Sign out</button></div>}
      </header>
      <main className="wrap" id="main" tabIndex={-1}>
        <h1 className="sr-only">Research dashboard</h1>
        {user === undefined && <p className="lede">Checking…</p>}
        {user === null && <SignIn onDone={(u) => { setUser(u); load(); }} />}
        {user && (
          <>
            {err && <p className="error" role="alert">{err}</p>}
            <Dashboard sessions={sampleOn ? sample : data.sessions} sample={sampleOn} offline={data.offline && !sampleOn} sampleOn={sampleOn} onSample={() => setSampleOn((v) => !v)} onDelete={remove} onRefresh={load} updatedAt={updatedAt} />
          </>
        )}
      </main>
    </div>
  );
}
