import { useSession } from "../state/SessionContext.jsx";
import { REFLECTION_PROMPTS } from "../config/activities.js";
import { PATH } from "../flow/flow.js";
import QBlock from "../components/QBlock.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import { TextArea } from "../components/Fields.jsx";
import { hasText } from "../state/model.js";
import { useTitle } from "../hooks/useTitle.js";

// Stage 5: three optional prompts (frozen wording), then submit.
export default function Reflection() {
  useTitle("Reflection");
  const { session, update } = useSession();
  const any = REFLECTION_PROMPTS.some((p) => hasText(session.reflection[p.id]));
  const submit = () => update((d) => { d.completedAt = new Date().toISOString(); d.furthest = "done"; });
  return (
    <>
      <div className="wrap narrow">
        <QBlock tone="blue" eyebrow="Reflection" badge="Optional" title="A last look back" hint="Answer any, all or none of these. Then submit." />
        <div className="qgrid">
          {REFLECTION_PROMPTS.map((p) => (
            <TextArea key={p.id} label={p.q} rows={5} maxLength={2000} value={session.reflection[p.id]} onChange={(v) => update((d) => { d.reflection[p.id] = v; })} />
          ))}
        </div>
      </div>
      <ActionBar back={<Back to={PATH.profile} />} need={any ? undefined : "All three are optional. You can submit without answering."}>
        <Primary to={PATH.done} onClick={submit}>Submit</Primary>
      </ActionBar>
    </>
  );
}
