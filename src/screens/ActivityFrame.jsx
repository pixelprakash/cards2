import { useNavigate } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { ACTIVITY } from "../config/activities.js";
import QBlock from "../components/QBlock.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import { PATH } from "../flow/flow.js";
import { useTitle } from "../hooks/useTitle.js";

// Frame for a shared activity. Required activities (resource allocation) must meet their rule; the others can be skipped.
export default function ActivityFrame({ id, question, hint, valid, has, needText, onSave, children }) {
  const meta = ACTIVITY[id];
  useTitle(meta.title);
  const { session, update } = useSession();
  const navigate = useNavigate();
  const status = session.activities[id].status;
  const mark = (s) => { update((d) => { d.activities[id].status = s; }); navigate(PATH.activities); };
  const save = () => { onSave?.(); update((d) => { d.activities[id].status = "answered"; }); };
  const canSave = meta.required ? valid : has;
  return (
    <>
      <div className="wrap narrow">
        <QBlock tone={meta.tone} eyebrow="Shared activity" badge={meta.required ? "Required" : "Optional"} title={meta.title} question={question} hint={hint} />
        {status === "skipped" && <p className="hint" style={{ marginTop: "1rem" }}>You skipped this earlier. Add an answer, or leave it skipped.</p>}
        <div className={`qgrid tone-${meta.tone}`}>
          {children}
          {!meta.required && !has && (
            <div className="later"><button type="button" className="btn-text" onClick={() => mark("skipped")}>Skip this activity</button></div>
          )}
        </div>
      </div>
      <ActionBar back={<Back to={PATH.activities} />} need={!canSave ? needText : undefined}>
        <Primary to={PATH.activities} disabled={!canSave} onClick={save}>Save and continue</Primary>
      </ActionBar>
    </>
  );
}
