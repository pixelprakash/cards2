import { Link } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { ACTIVITIES } from "../config/activities.js";
import { PATH } from "../flow/flow.js";
import { activityState, allocationDone } from "../flow/validate.js";
import QBlock from "../components/QBlock.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import { Check } from "../components/Icons.jsx";
import { useTitle } from "../hooks/useTitle.js";

const LABEL = { done: "Done", started: "In progress", skipped: "Skipped", todo: "Not started" };

// Stage 3: Resource Allocation is required; the others are a menu of optional activities, in any order.
export default function ActivitiesHub() {
  useTitle("Shared activities");
  const { session } = useSession();
  const ready = allocationDone(session);
  return (
    <>
      <div className="wrap">
        <QBlock tone="green" eyebrow="Shared activities" title="A few things everyone does" hint="Resource allocation is required. The rest are optional and can be done in any order, or skipped." layered />
        <div className="tiles" style={{ marginTop: "2.5rem" }}>
          {ACTIVITIES.map((a) => {
            const st = activityState(session, a.id);
            return (
              <Link key={a.id} to={PATH.activity(a.id)} className={`tile tone-${a.tone}${st === "todo" && !a.required ? " is-todo optional" : ""}`}>
                <span className="t">{a.title}</span>
                <span style={{ fontSize: "1.0625rem" }}>{a.blurb}</span>
                <span className="meta"><span className="badge">{a.required ? "Required" : "Optional"}</span><span className="st">{st === "done" && <Check />}{LABEL[st]}</span></span>
              </Link>
            );
          })}
        </div>
      </div>
      <ActionBar back={<Back to={session.route === "free" ? PATH.experience : PATH.dimensions} />} need={ready ? undefined : "Complete resource allocation to continue."}>
        <Primary to={PATH.institution} disabled={!ready}>Continue to your institution</Primary>
      </ActionBar>
    </>
  );
}
