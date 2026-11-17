import { useRef } from "react";
import { useAutoGrow, useFlip } from "../hooks/motion.js";
import { uid } from "../state/model.js";
import { Plus, Up, Down, Cross } from "./Icons.jsx";

function StepText({ id, setRef, value, onChange, placeholder, label }) {
  const own = useRef(null);
  useAutoGrow(own, value);
  return (
    <div className="field">
      <label className="sr-only" htmlFor={`st-${id}`}>{label}</label>
      <textarea id={`st-${id}`} ref={(el) => { own.current = el; setRef(el); }} className="textarea" rows={2} maxLength={400} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ minHeight: "4.25rem" }} />
    </div>
  );
}

// Add, reorder and remove steps. No fixed order and no drag needed: arrow buttons move a step.
export default function StepList({ steps, onChange, noun = "step", placeholder, tone, addLabel }) {
  const refs = useRef({});
  const listRef = useRef(null);
  useFlip(listRef, steps.map((x) => x.id).join());
  const set = (id, text) => onChange(steps.map((s) => (s.id === id ? { ...s, text } : s)));
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= steps.length) return;
    const next = [...steps]; [next[i], next[j]] = [next[j], next[i]]; onChange(next);
  };
  const add = () => {
    const id = uid("p");
    onChange([...steps, { id, text: "" }]);
    setTimeout(() => refs.current[id]?.focus(), 30);
  };
  return (
    <div className="stack" style={tone ? undefined : undefined}>
      <ol ref={listRef} className={`steps${tone ? ` tone-${tone}` : ""}`}>
        {steps.map((s, i) => (
          <li key={s.id} className="step" data-flip={s.id}>
            <StepText id={s.id} setRef={(el) => { refs.current[s.id] = el; }} value={s.text} placeholder={placeholder} label={`${noun[0].toUpperCase()}${noun.slice(1)} ${i + 1}`} onChange={(t) => set(s.id, t)} />
            <div className="controls">
              <button type="button" className="iconbtn" aria-label={`Move ${noun} ${i + 1} up`} aria-disabled={i === 0 || undefined} onClick={() => move(i, -1)}><Up /></button>
              <button type="button" className="iconbtn" aria-label={`Move ${noun} ${i + 1} down`} aria-disabled={i === steps.length - 1 || undefined} onClick={() => move(i, 1)}><Down /></button>
              <button type="button" className="iconbtn" aria-label={`Remove ${noun} ${i + 1}`} onClick={() => onChange(steps.filter((x) => x.id !== s.id))}><Cross /></button>
            </div>
          </li>
        ))}
      </ol>
      <div><button type="button" className="btn btn-soft" onClick={add}><Plus />{addLabel ?? `Add a ${noun}`}</button></div>
    </div>
  );
}
