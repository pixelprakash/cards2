import { useEffect, useRef, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { guard, stageOfPath, STAGE_RANK } from "../flow/flow.js";
import { progress } from "../flow/progress.js";
import { DIMENSION } from "../config/dimensions.js";
import { ACTIVITIES } from "../config/activities.js";
import { stagesFor } from "../config/stages.js";
import InfoDialog from "./InfoDialogs.jsx";
import Dialog from "./Dialog.jsx";
import { queueWithdrawal } from "../state/withdraw.js";
import { Check } from "./Icons.jsx";


// A sortable position for each screen, so we can tell whether someone is moving forward or back.
const ORDER = ["/", "/imagine", "/experience", "/dimensions", "/dimension", "/activities", "/activity", "/institution", "/profile", "/reflection", "/done"];
const place = (p) => {
  const base = p === "/" ? "/" : `/${p.split("/")[1]}`;
  const sub = p.startsWith("/dimension/") ? DIMENSION[p.split("/")[2]]?.n ?? 0 : p.startsWith("/activity/") ? ACTIVITIES.findIndex((a) => a.id === p.split("/")[2]) : 0;
  return Math.max(0, ORDER.indexOf(base)) * 100 + sub;
};

// One quiet line says where you are, instead of five chips competing for attention.
function StepLine({ stage, route }) {
  if (stage === "entry" || stage === "done") return <div className="stepline" aria-hidden="true" />;
  const stages = stagesFor(route);
  const i = stages.findIndex((x) => x.id === stage);
  return (
    <nav aria-label="Progress" className="stepline">
      <span className="sl-n">Stage {i + 1} of {stages.length}</span>
      <span className="sl-t">{stages[i]?.label}</span>
    </nav>
  );
}

// Screens where the participant answers something use one narrow column, so the eye has one place to stay.
const FOCUS = (p) => ["/imagine", "/experience", "/institution", "/profile", "/reflection", "/done"].includes(p) || p.startsWith("/dimension/") || p.startsWith("/activity/");

// Page frame: top bar with help, stage rail, the screen, footer links. Also guards the route and manages focus and the page title.
export default function Shell() {
  const { session, update, reset } = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const [info, setInfo] = useState(null);
  const [withdraw, setWithdraw] = useState(false);
  const [note, setNote] = useState("");
  const stage = stageOfPath(pathname);
  const redirect = guard(session, pathname);   // a screen that is not open yet is never drawn, not even for a frame

  // Direction of travel decides which way the screen glides in.
  const prevPlace = useRef(place(pathname));
  const dir = place(pathname) >= prevPlace.current ? "fwd" : "back";
  useEffect(() => { prevPlace.current = place(pathname); }, [pathname]);

  // Remember the furthest stage reached.
  useEffect(() => {
    if (!session.route || redirect) return;   // a screen the participant is sent away from has not been reached
    if (STAGE_RANK[stage] > STAGE_RANK[session.furthest]) update((d) => { d.furthest = stage; });
  }, [stage, redirect, session.route, session.furthest, update]);

  // New screen: move focus to the main area (so screen readers start at the top) and scroll up.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  if (redirect) return <Navigate to={redirect} replace />;

  return (
    <div className={`shell${FOCUS(pathname) ? " is-focus" : ""}`}>
      <div className="progress" aria-hidden="true"><i style={{ "--prog": progress(session, pathname) }} /></div>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>Skip to content</a>
      <header className="wrap topbar">
        <Link className="brand" to="/" aria-label="Learning Institutions by Design, start"><span>learning institutions by design</span></Link>
        <div className="topbar-actions">
          {session.route && <span className="saved" title="Your answers are kept in this browser"><Check /><span className="saved-t">Saved</span></span>}
          <button type="button" className="btn btn-soft btn-small" onClick={() => setInfo("help")}>Help</button>
        </div>
      </header>
      <div className="wrap"><StepLine stage={stage} route={session.route} /></div>
      <main id="main" ref={mainRef} tabIndex={-1}><div className="screen" key={pathname} data-dir={dir}><Outlet /></div></main>
      <footer className="wrap foot">
        <button type="button" onClick={() => setInfo("study")}>Study information</button>
        <button type="button" onClick={() => setInfo("data")}>AI and data</button>
        <button type="button" onClick={() => setInfo("access")}>Accessibility</button>
        {pathname !== "/" && <a href="/researcher">Researcher login</a>}
        {session.route && <button type="button" onClick={() => setWithdraw(true)}>Withdraw my answers</button>}
        <span style={{ marginLeft: "auto" }}>Participant code {session.route ? session.code : "is given when you start"}</span>
      </footer>
      <InfoDialog which={info} onClose={() => setInfo(null)} />
      <Dialog open={withdraw} onClose={() => setWithdraw(false)} title="Withdraw your answers?"
        actions={<button type="button" className="btn btn-soft" onClick={() => {
          queueWithdrawal({ id: session.id, code: session.code });   // instant here; the server delete finishes in the background
          setWithdraw(false); reset(); setNote("Done. Your answers are being removed."); navigate("/");
        }}>Withdraw</button>}>
        <p>This deletes everything stored for participant code {session.code}, here and with the research team, and clears this browser. It cannot be undone.</p>
      </Dialog>
      {note && <p className="toast" role="status" onAnimationEnd={() => setTimeout(() => setNote(""), 3500)}>{note}</p>}
    </div>
  );
}
