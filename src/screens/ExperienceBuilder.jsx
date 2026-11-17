import { useEffect, useState } from "react";
import { useSession } from "../state/SessionContext.jsx";
import { CONTRIBUTOR_GROUPS, DIMENSION, EXPERIENCE_PROMPTS as P } from "../config/dimensions.js";
import { AddOwn } from "../components/AddOwn.jsx";
import ChoiceList from "../components/ChoiceList.jsx";
import StepList from "../components/StepList.jsx";
import { TextArea } from "../components/Fields.jsx";
import { Plus, Cross, Down, Check } from "../components/Icons.jsx";
import { uid, dimOf, hasText } from "../state/model.js";

// One prompt, one panel. Only one is open at a time, so there is only ever one thing to think about; the others
// stay folded with a one-line summary of what you wrote. All six are optional.
function Panel({ id, open, onToggle, q, hint, summary, done, last, onNext, children }) {
  return (
    <section className={`acc-item${open ? " open" : ""}${done ? " is-done" : ""}`}>
      <h2 style={{ margin: 0 }}>
        <button type="button" className="acc-head" aria-expanded={open} aria-controls={`${id}-body`} id={`${id}-head`} onClick={onToggle}>
          <span className="q">{q}</span>
          <span className="sum">{done ? <><Check width="14" height="14" style={{ display: "inline", verticalAlign: "-2px" }} /> {summary}</> : hint}</span>
          <span className="chev" aria-hidden="true"><Down /></span>
        </button>
      </h2>
      <div className="acc-body" id={`${id}-body`} role="region" aria-labelledby={`${id}-head`} inert={!open}>
        <div><div className="inner">
          {children}
          {!last && <div><button type="button" className="btn btn-soft btn-small" onClick={onNext}>Next question</button></div>}
        </div></div>
      </div>
    </section>
  );
}

// "Build one learning experience" (brief section 4.1). Six prompts, none required, in the participant's own words.
// Used on Route A after the free description, and as dimension 11 on Route B.
export default function ExperienceBuilder() {
  const { session, update } = useSession();
  const e = session.experience;
  const set = (fn) => update((d) => { fn(d.experience); });
  const [open, setOpen] = useState("explore");
  // Opening a prompt that takes a list starts you with one empty line, so there is nothing to hunt for.
  useEffect(() => {
    if (open === "explore") set((x) => { if (x.ideas.length === 0) x.ideas.push({ id: uid("p"), text: "" }); });
    if (open === "unfolds") set((x) => { if (x.steps.length === 0) x.steps.push({ id: uid("p"), text: "" }); });
  }, [open]); // eslint-disable-line

  // Where and who can link to what the participant already chose on Route B (otherwise the standard lists).
  const locDim = dimOf(session, "locations");
  const eduDim = dimOf(session, "educators");
  const order = ["explore", "does", "takesPart", "where", "unfolds", "outcomes"];
  const go = (k) => () => setOpen(open === k ? null : k);
  const nextOf = (k) => () => setOpen(order[order.indexOf(k) + 1]);

  const ideas = e.ideas.filter((i) => hasText(i.text));
  const steps = e.steps.filter((s) => hasText(s.text));
  const setIdea = (id, text) => set((x) => { x.ideas = x.ideas.map((i) => (i.id === id ? { ...i, text } : i)); });

  return (
    <div className="acc">
      <Panel id="ex-explore" q={P.explore.q} hint="Add an idea" open={open === "explore"} onToggle={go("explore")} onNext={nextOf("explore")}
        done={ideas.length > 0} summary={`${ideas.length} ${ideas.length === 1 ? "idea" : "ideas"}`}>
        {e.ideas.map((i, n) => (
          <div className="addrow" key={i.id}>
            <label className="sr-only" htmlFor={`idea-${i.id}`}>{`Idea ${n + 1}`}</label>
            <input id={`idea-${i.id}`} className="input" maxLength={300} value={i.text} placeholder="An idea, a skill, a thing to make…" onChange={(ev) => setIdea(i.id, ev.target.value)} />
            <button type="button" className="iconbtn" aria-label={`Remove idea ${n + 1}`} onClick={() => set((x) => { x.ideas = x.ideas.filter((y) => y.id !== i.id); })}><Cross /></button>
          </div>
        ))}
        <div><button type="button" className="btn btn-soft" onClick={() => set((x) => { x.ideas.push({ id: uid("p"), text: "" }); })}><Plus />Add an idea</button></div>
      </Panel>

      <Panel id="ex-does" q={P.does.q} hint="Describe actions" open={open === "does"} onToggle={go("does")} onNext={nextOf("does")}
        done={hasText(e.does)} summary={e.does.trim().slice(0, 60)}>
        <TextArea label="Describe what learners do" id="ex-does-t" rows={3} value={e.does} onChange={(v) => set((x) => { x.does = v; })} placeholder="What learners actually do, step by step or in general" />
      </Panel>

      <Panel id="ex-who" q={P.takesPart.q} hint="Add / link a contributor" open={open === "takesPart"} onToggle={go("takesPart")} onNext={nextOf("takesPart")}
        done={e.takesPart.picks.length > 0} summary={`${e.takesPart.picks.length} chosen`}>
        <ChoiceList legend="Link a contributor" options={CONTRIBUTOR_GROUPS} custom={[...eduDim.contributors.custom, ...e.takesPart.custom]} value={e.takesPart.picks} onChange={(v) => set((x) => { x.takesPart.picks = v; })} columns />
        <AddOwn label="Add who or what takes part" placeholder="A person, a group, a place, a tool…" onAdd={(t) => set((x) => { const id = uid("c"); x.takesPart.custom.push({ id, text: t }); x.takesPart.picks.push(id); })} />
      </Panel>

      <Panel id="ex-where" q={P.where.q} hint="Link a setting or add one" open={open === "where"} onToggle={go("where")} onNext={nextOf("where")}
        done={e.where.picks.length > 0} summary={`${e.where.picks.length} chosen`}>
        <ChoiceList legend="Link a setting" options={DIMENSION.locations.choices} custom={[...locDim.custom, ...e.where.custom]} value={e.where.picks} onChange={(v) => set((x) => { x.where.picks = v; })} columns />
        <AddOwn label="Add a setting" placeholder="Where else could it happen?" onAdd={(t) => set((x) => { const id = uid("c"); x.where.custom.push({ id, text: t }); x.where.picks.push(id); })} />
      </Panel>

      <Panel id="ex-unfold" q={P.unfolds.q} hint="Add, reorder or remove steps" open={open === "unfolds"} onToggle={go("unfolds")} onNext={nextOf("unfolds")}
        done={steps.length > 0} summary={`${steps.length} ${steps.length === 1 ? "step" : "steps"}`}>
        <StepList steps={e.steps} onChange={(list) => set((x) => { x.steps = list; })} noun="step" placeholder="What happens in this step?" tone="pink" addLabel={e.steps.length ? "Add another step" : "Add a step"} />
      </Panel>

      <Panel id="ex-out" q={P.outcomes.q} hint="Describe" open={open === "outcomes"} onToggle={go("outcomes")} last
        done={hasText(e.outcomes)} summary={e.outcomes.trim().slice(0, 60)}>
        <TextArea label="Describe" id="ex-out-t" rows={3} value={e.outcomes} onChange={(v) => set((x) => { x.outcomes = v; })} placeholder="What people might make, understand or change" />
      </Panel>
    </div>
  );
}
