import { Link } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { ACTIVITIES } from "../config/activities.js";
import { PATH } from "../flow/flow.js";
import { activityState, allocationDone } from "../flow/validate.js";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import { Check } from "../components/Icons.jsx";
import { Glyph } from "../components/Glyphs.jsx";
import { useTitle } from "../hooks/useTitle.js";

const LABEL = { done: "Done", started: "In progress", skipped: "Skipped", todo: "Not started" };
const GLYPH = { allocation: "sliders", rethink: "process", signature: "pencil", tensions: "tensions", purpose: "purpose" };

// Stage 3: Resource Allocation is required; the others are a menu of optional activities, in any order.
export default function ActivitiesHub() {
  useTitle("Shared activities");
  const { session } = useSession();
  const ready = allocationDone(session);
  const row = (a) => {
    const st = activityState(session, a.id);
    return (
      <li key={a.id}>
        <Link to={PATH.activity(a.id)} className={`drow tone-${a.tone} st-${st}${!ready && a.required ? " is-next" : ""}`}>
          <span className="disc"><Glyph name={GLYPH[a.id]} /></span>
          <span className="dtxt"><span className="dn">{a.title}</span><span className="dq always">{a.blurb}</span></span>
          <span className="dst">{st === "done" ? <><Check /> Done</> : LABEL[st]}</span>
        </Link>
      </li>
    );
  };
  return (
    <>
      <div className="wrap">
        <header className="hubhead"><p className="eyebrow">Shared activities</p><h1 className="title">A few things everyone does</h1><p className="hint">Resource allocation is required. The rest are optional, in any order.</p></header>
        <div className="stack-lg">
          <section className="group" aria-labelledby="a-req"><h2 id="a-req">Required</h2><ul className="dlist">{ACTIVITIES.filter((a) => a.required).map(row)}</ul></section>
          <section className="group" aria-labelledby="a-opt"><h2 id="a-opt">Optional <span className="muted">· skip any you like</span></h2><ul className="dlist">{ACTIVITIES.filter((a) => !a.required).map(row)}</ul></section>
        </div>
      </div>
      <ActionBar back={<Back to={session.route === "free" ? PATH.experience : PATH.dimensions} />} need={ready ? undefined : "Complete resource allocation to continue."}>
        <Primary to={PATH.institution} disabled={!ready}>Continue</Primary>
      </ActionBar>
    </>
  );
}
