import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { ROUTES } from "../config/stages.js";
import { PATH } from "../flow/flow.js";
import { Arrow } from "../components/Icons.jsx";
import { Ring, Spark, Blob, Squiggle } from "../components/Decor.jsx";
import { useTilt } from "../hooks/motion.js";
import { useTitle } from "../hooks/useTitle.js";

function RouteCard({ tone, title, line, onClick }) {
  const ref = useRef(null);
  useTilt(ref);
  return (
    <button ref={ref} type="button" className={`route tone-${tone}`} onClick={onClick}>
      <span className="rt">{title}</span>
      <span className="rs">{line}</span>
      <span className="go">Begin<i><Arrow width="18" height="18" /></i></span>
    </button>
  );
}

const Words = ({ text, from = 0 }) => text.split(" ").map((w, i) => <span key={w + i}><span className="word" style={{ "--w": from + i }}>{w}</span>{" "}</span>);

export default function Entry() {
  useTitle("Design Your Institution");
  const { session, update, reset, resumable } = useSession();
  const navigate = useNavigate();

  const choose = (route) => {
    if (session.route !== route) update((d) => { d.route = route; });
    navigate(route === "free" ? PATH.imagine : PATH.dimensions);
  };
  const resume = () => navigate(session.furthest === "entry" || session.furthest === "dimensions" ? (session.route === "free" ? PATH.imagine : PATH.dimensions) : `/${session.furthest}`);

  return (
    <div className="wrap hero">
      <Spark className="d1" /><Blob className="d2" /><Ring className="d3" /><Squiggle className="d4" />
      {resumable && session.id === resumable.id && (
        <div className="resume" role="region" aria-label="Continue where you left off">
          <p><b>Welcome back.</b> Your earlier answers are still here.</p>
          <div className="row">
            <button type="button" className="btn btn-soft btn-small" onClick={resume}>Continue where I left off</button>
            <button type="button" className="btn btn-ghost btn-small" onClick={reset}>Start again</button>
          </div>
        </div>
      )}
      <p className="eyebrow">Learning Institutions by Design</p>
      <h1 className="display"><Words text="Design Your" /><b><Words text="Institution" from={2} /></b></h1>
      <p className="lede">What might a different institution for learning look like?</p>
      <div className="routes" role="group" aria-label="Choose how to start">
        <RouteCard tone="pink" title={ROUTES.free.title} line="Start with your idea" onClick={() => choose("free")} />
        <RouteCard tone="orange" title={ROUTES.configure.title} line="Start with six required dimensions" onClick={() => choose("configure")} />
      </div>
      <a className="corner-link" href="/researcher" aria-label="Researcher login">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        Researcher
      </a>
      <p className="hint">Your route is not a score. Either way you will finish with shared activities, a profile of your institution, and a short reflection.</p>
    </div>
  );
}
