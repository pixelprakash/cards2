import { PRACTICES, PRACTICE_ACTIONS } from "../../config/activities.js";
import { useActivity } from "../../hooks/useActivity.js";
import { uid } from "../../state/model.js";
import { AddOwn } from "../../components/AddOwn.jsx";
import ActivityFrame from "../ActivityFrame.jsx";

// For each familiar practice: keep, change, leave behind, combine or add. Nothing is assumed to be undesirable.
function Row({ id, label, value, onPick, onRemove }) {
  return (
    <fieldset className="exp-item" style={{ border: 0, minInlineSize: 0, margin: 0 }}>
      <legend className="q" style={{ font: "700 1.3125rem/1.3 var(--font)", padding: 0, marginBottom: "0.6rem" }}>{label}</legend>
      <ul className="chips">
        {PRACTICE_ACTIONS.map((a) => {
          const on = value === a.id;
          return (
            <li key={a.id} className="choice" style={{ position: "relative" }}>
              <input type="radio" name={`pr-${id}`} id={`pr-${id}-${a.id}`} checked={on} onChange={() => onPick(a.id)} />
              <label htmlFor={`pr-${id}-${a.id}`} style={{ padding: "0.55rem 1.1rem", borderRadius: "999px", fontSize: "1.0625rem" }}>
                <span className="mark" style={{ width: "1.15rem", height: "1.15rem" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>{a.label}
              </label>
            </li>
          );
        })}
        {value && <li><button type="button" className="btn-text" onClick={() => onPick(null)}>Clear</button></li>}
        {onRemove && <li><button type="button" className="btn-text" onClick={onRemove}>Remove this practice</button></li>}
      </ul>
    </fieldset>
  );
}

export default function Rethink() {
  const [a, edit] = useActivity("rethink");
  const has = Object.values(a.items).some((i) => i.action) || a.custom.some((c) => c.action);
  return (
    <ActivityFrame id="rethink" question="Which familiar practices would your institution keep, change, leave behind, combine or add?"
      hint="Some practices may be worth keeping. Choose what fits, and leave the rest."
      has={has} valid>
      {PRACTICES.map((p) => (
        <Row key={p.id} id={p.id} label={p.label} value={a.items[p.id]?.action ?? null} onPick={(act) => edit((x) => { x.items[p.id] = { action: act }; })} />
      ))}
      {a.custom.map((c) => (
        <Row key={c.id} id={c.id} label={c.text} value={c.action ?? null}
          onPick={(act) => edit((x) => { x.custom = x.custom.map((y) => (y.id === c.id ? { ...y, action: act } : y)); })}
          onRemove={() => edit((x) => { x.custom = x.custom.filter((y) => y.id !== c.id); })} />
      ))}
      <AddOwn label="Add a practice" placeholder="Another familiar practice" buttonLabel="Add a practice" onAdd={(t) => edit((x) => { x.custom.push({ id: uid("c"), text: t, action: null }); })} />
    </ActivityFrame>
  );
}
