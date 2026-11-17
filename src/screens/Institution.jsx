import { useSession } from "../state/SessionContext.jsx";
import { FORMATION_PROMPTS } from "../config/activities.js";
import { PATH } from "../flow/flow.js";
import QBlock from "../components/QBlock.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import { TextArea } from "../components/Fields.jsx";
import StepList from "../components/StepList.jsx";
import { useTitle } from "../hooks/useTitle.js";

function Prompt({ id, q, hint, value, unsure, onText, onUnsure }) {
  return (
    <section className="exp-item" aria-labelledby={`f-${id}`}>
      <h2 className="q" id={`f-${id}`}>{q}</h2>
      <TextArea label="Your answer" id={`f-${id}-t`} hint={hint} rows={4} maxLength={1500} value={value} onChange={onText} />
      <div className="choice is-multi" style={{ position: "relative", maxWidth: "20rem" }}>
        <input id={`f-${id}-u`} type="checkbox" checked={unsure} onChange={(e) => onUnsure(e.target.checked)} />
        <label htmlFor={`f-${id}-u`}><span className="mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>Not sure yet</label>
      </div>
    </section>
  );
}

// Stage 4, part 1: the participant brings their ideas together. This is their own writing, not generated.
export default function Institution() {
  useTitle("Form your institution");
  const { session, update } = useSession();
  const f = session.formation;
  const [begins, tried] = FORMATION_PROMPTS;
  return (
    <>
      <div className="wrap narrow">
        <QBlock tone="orange" eyebrow="Your institution" title="Form your institution" question="How does it begin, and how does it change over time?" hint="This is speculative design, not planning. Incomplete answers and “not sure yet” are fine." />
        <div className="qgrid">
          <Prompt id="begins" q={begins.q} hint={begins.hint} value={f.begins} unsure={f.beginsUnsure}
            onText={(v) => update((d) => { d.formation.begins = v; })} onUnsure={(v) => update((d) => { d.formation.beginsUnsure = v; })} />
          <section className="exp-item" aria-labelledby="f-eps">
            <h2 className="q" id="f-eps">How does it grow or change?</h2>
            <p className="hint">Add the moments or episodes that change it, in any order. There is no fixed plan.</p>
            <StepList steps={f.episodes} noun="episode" tone="orange" placeholder="Describe a change episode" addLabel="Add episode" onChange={(eps) => update((d) => { d.formation.episodes = eps; })} />
          </section>
          <Prompt id="tried" q={tried.q} hint={tried.hint} value={f.tried} unsure={f.triedUnsure}
            onText={(v) => update((d) => { d.formation.tried = v; })} onUnsure={(v) => update((d) => { d.formation.triedUnsure = v; })} />
        </div>
      </div>
      <ActionBar back={<Back to={PATH.activities} />}>
        <Primary to={PATH.profile}>Continue to profile</Primary>
      </ActionBar>
    </>
  );
}
