import { MAX_TENSIONS, TENSIONS } from "../../config/activities.js";
import { useActivity } from "../../hooks/useActivity.js";
import { uid } from "../../state/model.js";
import ChoiceList from "../../components/ChoiceList.jsx";
import TensionSlider from "../../components/TensionSlider.jsx";
import { TextArea } from "../../components/Fields.jsx";
import { TextInput } from "../../components/Fields.jsx";
import ActivityFrame from "../ActivityFrame.jsx";
import { useState } from "react";

// Up to three tensions. Each gets a paired 100-point slider (or none) and an optional explanation. No winner is asked for.
export default function Tensions() {
  const [a, edit] = useActivity("tensions");
  const [pa, setPa] = useState("");
  const [pb, setPb] = useState("");
  const label = (t) => `${t.a} and ${t.b}`;
  const options = TENSIONS.map((t) => ({ id: t.id, label: label(t) }));
  const customOpts = a.selected.filter((s) => s.own).map((s) => ({ id: s.id, text: label(s) }));
  const ids = a.selected.map((s) => s.id);
  const full = a.selected.length >= MAX_TENSIONS;

  const setIds = (next) => edit((x) => {
    const keep = x.selected.filter((s) => next.includes(s.id));
    next.filter((id) => !keep.some((s) => s.id === id)).forEach((id) => {
      const t = TENSIONS.find((y) => y.id === id); keep.push({ id, a: t.a, b: t.b, own: false, useSlider: false, value: null, note: "" });
    });
    x.selected = keep;
  });
  const patch = (id, p) => edit((x) => { x.selected = x.selected.map((s) => (s.id === id ? { ...s, ...p } : s)); });
  const addOwn = () => {
    if (!pa.trim() || !pb.trim() || full) return;
    edit((x) => { x.selected.push({ id: uid("c"), a: pa.trim().slice(0, 60), b: pb.trim().slice(0, 60), own: true, useSlider: false, value: null, note: "" }); });
    setPa(""); setPb("");
  };

  return (
    <ActivityFrame id="tensions" question="Which tensions would your institution have to live with?" hint="Choose up to three. You do not have to pick a winner: a tension can stay a tension." has={a.selected.length > 0} valid>
      <ChoiceList legend={`Choose up to ${MAX_TENSIONS}`} hint={`${a.selected.length} of ${MAX_TENSIONS} chosen`} options={options} custom={customOpts} value={ids} max={MAX_TENSIONS} onChange={setIds} columns />
      {a.selected.map((s) => (
        <section key={s.id} className="tension" aria-label={`${s.a} and ${s.b}`}>
          <h2 style={{ font: "700 1.3125rem/1.25 var(--font)" }}>{s.a} <span className="muted">and</span> {s.b}</h2>
          {s.useSlider
            ? <TensionSlider a={s.a} b={s.b} value={s.value} onChange={(v) => patch(s.id, { value: v })} />
            : <div><button type="button" className="btn btn-ghost btn-small" onClick={() => patch(s.id, { useSlider: true, value: s.value ?? 50 })}>Use a slider</button></div>}
          {s.useSlider && <div><button type="button" className="btn-text" onClick={() => patch(s.id, { useSlider: false, value: null })}>Remove the slider</button></div>}
          <TextArea label="Say more about this tension" optional rows={3} value={s.note} onChange={(v) => patch(s.id, { note: v })} />
        </section>
      ))}
      <details className="more">
        <summary>Add your own tension</summary>
      <section className="panel" aria-labelledby="own-t" style={{ marginTop: "0.8rem" }}>
        <h2 id="own-t" style={{ font: "700 1.25rem/1.2 var(--font)" }}>Add your own tension</h2>
        <div className="poles">
          <TextInput label="One side" value={pa} onChange={setPa} maxLength={60} />
          <TextInput label="The other side" value={pb} onChange={setPb} maxLength={60} />
        </div>
        <div><button type="button" className="btn btn-soft" onClick={addOwn} aria-disabled={full || undefined}>Add this tension</button>{full && <span className="hint" style={{ marginLeft: "0.8rem" }}>You have chosen three.</span>}</div>
      </section>

      </details>
    </ActivityFrame>
  );
}
