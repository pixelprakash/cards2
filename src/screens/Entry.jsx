import { useNavigate } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { ROUTES } from "../config/stages.js";
import { PATH } from "../flow/flow.js";
import { Arrow } from "../components/Icons.jsx";
import { useTitle } from "../hooks/useTitle.js";

export default function Entry() {
  useTitle("Design Your Institution");
  const { session, update, reset, resumable } = useSession();
  const navigate = useNavigate();

  const choose = (route) => {
    if (session.route !== route) update((d) => { d.route = route; });
    navigate(route === "free" ? PATH.imagine : PATH.dimensions);
  };
  const resume = () => navigate(session.furthest === "entry" ? (session.route === "free" ? PATH.imagine : PATH.dimensions) : `/${session.furthest === "dimensions" ? (session.route === "free" ? "imagine" : "dimensions") : session.furthest}`);

  return (
    <div className="wrap hero">
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
      <h1 className="display">Design Your <b>Institution</b></h1>
      <p className="lede">What might a different institution for learning look like?</p>
      <div className="routes" role="group" aria-label="Choose how to start">
        <button type="button" className="route tone-pink" onClick={() => choose("free")}>
          <span className="rt">{ROUTES.free.title}</span>
          <span className="rs">Start with your idea</span>
          <span className="go">Begin<i><Arrow width="18" height="18" /></i></span>
        </button>
        <button type="button" className="route tone-orange" onClick={() => choose("configure")}>
          <span className="rt">{ROUTES.configure.title}</span>
          <span className="rs">Start with six required dimensions</span>
          <span className="go">Begin<i><Arrow width="18" height="18" /></i></span>
        </button>
      </div>
      <p className="hint">Your route is not a score. Either way you will finish with shared activities, a profile of your institution, and a short reflection.</p>
    </div>
  );
}
