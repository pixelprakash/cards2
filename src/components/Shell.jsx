import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { guard, stageOfPath, STAGE_RANK } from "../flow/flow.js";
import { stagesFor } from "../config/stages.js";
import InfoDialog from "./InfoDialogs.jsx";
import { Check } from "./Icons.jsx";

const TONES = ["orange", "blue", "purple", "pink", "sand"];

function Rail({ stage, route }) {
  const stages = stagesFor(route);
  return (
    <nav aria-label="Progress">
      <ol className="rail">
        {stages.map((s, i) => {
          const done = STAGE_RANK[s.id] < STAGE_RANK[stage] && s.id !== "entry";
          const cur = s.id === stage;
          return (
            <li key={s.id}>
              <span className={`chip tone-${TONES[i]}${done ? " is-done" : ""}`} aria-current={cur ? "step" : undefined}>
                {done && <Check />}
                <span className="sr-only">{`Stage ${i + 1} of ${stages.length}: `}</span>
                <span className="lbl">{s.label}</span><span className="n" aria-hidden="true">{i + 1}</span>
                {done && <span className="sr-only"> (done)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Page frame: top bar with help, stage rail, the screen, footer links. Also guards the route and manages focus and the page title.
export default function Shell() {
  const { session, update } = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const [info, setInfo] = useState(null);
  const stage = stageOfPath(pathname);

  // Screens that are not available yet send the participant to the right place.
  useEffect(() => {
    const to = guard(session, pathname);
    if (to) navigate(to, { replace: true });
  }, [session, pathname, navigate]);

  // Remember the furthest stage reached.
  useEffect(() => {
    if (!session.route) return;
    if (STAGE_RANK[stage] > STAGE_RANK[session.furthest]) update((d) => { d.furthest = stage; });
  }, [stage, session.route, session.furthest, update]);

  // New screen: move focus to the main area (so screen readers start at the top) and scroll up.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="shell">
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>Skip to content</a>
      <header className="wrap topbar">
        <Link className="brand" to="/" aria-label="Learning Institutions by Design, start"><span>learning institutions by design</span></Link>
        <div className="topbar-actions"><button type="button" className="btn btn-soft btn-small" onClick={() => setInfo("help")}>Help</button></div>
      </header>
      <div className="wrap"><Rail stage={stage} route={session.route} /></div>
      <main id="main" ref={mainRef} tabIndex={-1}><Outlet /></main>
      <footer className="wrap foot">
        <button type="button" onClick={() => setInfo("study")}>Study information</button>
        <button type="button" onClick={() => setInfo("data")}>AI and data</button>
        <button type="button" onClick={() => setInfo("access")}>Accessibility</button>
        <span style={{ marginLeft: "auto" }}>Participant code {session.route ? session.code : "is given when you start"}</span>
      </footer>
      <InfoDialog which={info} onClose={() => setInfo(null)} />
    </div>
  );
}
