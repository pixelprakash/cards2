import { useSession } from "../state/SessionContext.jsx";
import { CONTRIBUTOR_GROUPS, DIMENSION, EXPERIENCE_PROMPTS as P } from "../config/dimensions.js";
import { AddOwn } from "../components/AddOwn.jsx";
import ChoiceList from "../components/ChoiceList.jsx";
import StepList from "../components/StepList.jsx";
import { TextArea } from "../components/Fields.jsx";
import { Plus, Cross } from "../components/Icons.jsx";
import { uid, dimOf } from "../state/model.js";

// "Build one learning experience" (brief section 4.1). Six prompts, none required, in the participant's own words.
// Used on Route A after the free description, and as dimension 11 on Route B.
export default function ExperienceBuilder() {
  const { session, update } = useSession();
  const e = session.experience;
  const set = (fn) => update((d) => { fn(d.experience); });

  // Where and who can link to what the participant already chose on Route B (otherwise the standard lists).
  const loc = DIMENSION.locations;
  const locDim = dimOf(session, "locations");
  const placeOptions = loc.choices;
  const placeCustom = locDim.custom;
  const eduDim = dimOf(session, "educators");
  const whoCustom = eduDim.contributors.custom;

  const setIdea = (id, text) => set((x) => { x.ideas = x.ideas.map((i) => (i.id === id ? { ...i, text } : i)); });
  const addIdea = () => set((x) => { x.ideas.push({ id: uid("p"), text: "" }); });
  const removeIdea = (id) => set((x) => { x.ideas = x.ideas.filter((i) => i.id !== id); });

  return (
    <div className="exp">
      <section className="exp-item" aria-labelledby="ex-explore">
        <h2 className="q" id="ex-explore">{P.explore.q}</h2>
        <p className="act">{P.explore.action}</p>
        {e.ideas.map((i, n) => (
          <div className="addrow" key={i.id}>
            <label className="sr-only" htmlFor={`idea-${i.id}`}>{`Idea ${n + 1}`}</label>
            <input id={`idea-${i.id}`} className="input" maxLength={300} value={i.text} placeholder="An idea, a skill, a thing to make…" onChange={(ev) => setIdea(i.id, ev.target.value)} />
            <button type="button" className="iconbtn" aria-label={`Remove idea ${n + 1}`} onClick={() => removeIdea(i.id)}><Cross /></button>
          </div>
        ))}
        <div><button type="button" className="btn btn-soft" onClick={addIdea}><Plus />Add an idea</button></div>
      </section>

      <section className="exp-item" aria-labelledby="ex-does">
        <h2 className="q" id="ex-does">{P.does.q}</h2>
        <TextArea label="Describe what learners do" id="ex-does-t" rows={3} value={e.does} onChange={(v) => set((x) => { x.does = v; })} placeholder="What learners actually do, step by step or in general" />
      </section>

      <section className="exp-item" aria-labelledby="ex-who">
        <h2 className="q" id="ex-who">{P.takesPart.q}</h2>
        <ChoiceList legend="Link a contributor" options={CONTRIBUTOR_GROUPS} custom={[...whoCustom, ...e.takesPart.custom]} value={e.takesPart.picks} onChange={(v) => set((x) => { x.takesPart.picks = v; })} columns />
        <AddOwn label="Or add who or what takes part" placeholder="A person, a group, a place, a tool…" onAdd={(t) => set((x) => { const id = uid("c"); x.takesPart.custom.push({ id, text: t }); x.takesPart.picks.push(id); })} />
      </section>

      <section className="exp-item" aria-labelledby="ex-where">
        <h2 className="q" id="ex-where">{P.where.q}</h2>
        <ChoiceList legend="Link a setting" options={placeOptions} custom={[...placeCustom, ...e.where.custom]} value={e.where.picks} onChange={(v) => set((x) => { x.where.picks = v; })} columns />
        <AddOwn label="Or add a setting" placeholder="Where else could it happen?" onAdd={(t) => set((x) => { const id = uid("c"); x.where.custom.push({ id, text: t }); x.where.picks.push(id); })} />
      </section>

      <section className="exp-item" aria-labelledby="ex-unfold">
        <h2 className="q" id="ex-unfold">{P.unfolds.q}</h2>
        <p className="act">{P.unfolds.action}. There is no fixed order.</p>
        <StepList steps={e.steps} onChange={(steps) => set((x) => { x.steps = steps; })} noun="step" placeholder="What happens in this step?" tone="pink" addLabel={e.steps.length ? "Add another step" : "Add a step"} />
      </section>

      <section className="exp-item" aria-labelledby="ex-out">
        <h2 className="q" id="ex-out">{P.outcomes.q}</h2>
        <TextArea label="Describe" id="ex-out-t" rows={3} value={e.outcomes} onChange={(v) => set((x) => { x.outcomes = v; })} placeholder="What people might make, understand or change" />
      </section>
    </div>
  );
}
