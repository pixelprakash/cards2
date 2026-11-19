import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { ROUTES } from "../config/stages.js";
import { PATH } from "../flow/flow.js";
import { Arrow } from "../components/Icons.jsx";
import { ArrowDoodle, Building, Glyph, Underline } from "../components/Glyphs.jsx";
import { useTilt } from "../hooks/motion.js";
import { useTitle } from "../hooks/useTitle.js";

function RouteCard({ tone, glyph, title, caption, line, onClick }) {
  const ref = useRef(null);
  useTilt(ref, { max: 4 });
  return (
    <button ref={ref} type="button" className={`route tone-${tone}`} onClick={onClick}>
      <Glyph name={glyph} className="route-glyph" />
      <span className="route-cap">{caption}</span>
      <span className="rt">{title}</span>
      <span className="rs">{line}</span>
      <span className="go">Begin<i><Arrow width="18" height="18" /></i></span>
    </button>
  );
}

const STEPS = [
  ["Pick a way in", "Start with your own idea, or work through the dimensions."],
  ["Build it up", "A few shared activities, then how your institution begins and changes."],
  ["See it, shape it", "You get a profile of your institution to edit, approve and reflect on."],
];
const PROMISES = [
  ["Anonymous", "No name or email. Just a random code."],
  ["Saved as you go", "Close it, come back later."],
  ["Yours to withdraw", "Delete your answers any time."],
];

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
    <div className="wrap landing">
      {resumable && session.id === resumable.id && (
        <div className="resume" role="region" aria-label="Continue where you left off">
          <p><b>Welcome back.</b> Your earlier answers are still here.</p>
          <div className="row">
            <button type="button" className="btn btn-soft btn-small" onClick={resume}>Pick up where I left off</button>
            <button type="button" className="btn btn-ghost btn-small" onClick={reset}>Start again</button>
          </div>
        </div>
      )}

      <section className="hero2">
        <div className="copy">
          <p className="note-hand">A research study about places for learning</p>
          <h1 className="display">Design Your <span className="ul"><b>Institution</b><Underline /></span></h1>
          <p className="lede">What might a different institution for learning look like?</p>
          <p className="soft">There are no right answers. Go with what feels true, and skip anything you like.</p>
        </div>
        <Building className="hero-art" />
      </section>

      <div className="point"><ArrowDoodle /><span>Choose how you want to start</span></div>
      <div className="routes" role="group" aria-label="Choose how to start">
        <RouteCard tone="pink" glyph="pencil" title={ROUTES.free.title} caption="Start with your idea" line="Write it your own way first, then add detail." onClick={() => choose("free")} />
        <RouteCard tone="orange" glyph="sliders" title={ROUTES.configure.title} caption="Start with six required dimensions" line="Work through the questions at your own pace." onClick={() => choose("configure")} />
      </div>
      <p className="soft small-note">Your route is not a score. You can change your mind and come back to anything.</p>

      <ol className="steps3" aria-label="How it works">
        {STEPS.map(([t, d], i) => <li key={t}><span className="num" aria-hidden="true">{i + 1}</span><div><h2>{t}</h2><p>{d}</p></div></li>)}
      </ol>
      <ul className="promises" aria-label="What to expect">
        {PROMISES.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
      </ul>

      <a className="corner-link" href="/researcher" aria-label="Researcher login">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        Researcher
      </a>
    </div>
  );
}
