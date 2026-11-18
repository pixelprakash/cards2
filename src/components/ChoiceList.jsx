import { useId } from "react";
import { Check } from "./Icons.jsx";
import { haptic } from "../hooks/motion.js";
import { burst } from "./Confetti.js";

// A bulleted list of choices. mode "multi" = checkboxes (optional max), "single" = one radio group.
// Choices are researcher-provided; anything the participant added is passed as `custom` and shown after them.
export default function ChoiceList({ legend, options, custom = [], value, onChange, mode = "multi", max, hint, columns, variant }) {
  const name = useId();
  const full = mode === "multi" && max != null && value.length >= max;
  const all = [...options.map((o) => ({ ...o })), ...custom.map((o) => ({ id: o.id, label: o.text, own: true }))];

  // Short, plain options become wrapping pills; options with explanations stay as full rows.
  const longest = Math.max(0, ...all.map((o) => o.label.length));
  const pills = (variant ?? (all.some((o) => o.def) || longest > 48 ? "rows" : "pills")) === "pills";

  const toggle = (id, el) => {
    haptic(6);
    if (pills && mode === "multi" && !value.includes(id) && el) burst(el, { count: 9, spread: 0.45 });
    if (mode === "single") return onChange([id]);
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0 }}>
      {legend && <legend className="label" style={{ font: "700 1.1875rem/1.3 var(--font)", marginBottom: "0.4rem" }}>{legend}</legend>}
      {hint && <p className="hint" style={{ marginBottom: "0.7rem" }}>{hint}</p>}
      <ul className={`choices${pills ? " pills" : columns ? " cols" : ""}`}>
        {all.map((o, k) => {
          const on = value.includes(o.id);
          const id = `${name}-${o.id}`;
          return (
            <li key={o.id} className={`choice${mode === "multi" ? " is-multi" : ""}`} style={{ "--k": k % 5 }}>
              <input id={id} type={mode === "multi" ? "checkbox" : "radio"} name={name} checked={on} disabled={full && !on} onChange={(e) => toggle(o.id, e.target.nextElementSibling)} />
              <label htmlFor={id}>
                <span className="mark"><Check /></span>
                <span>{o.label}{o.own && <small>Added by you</small>}{o.def && <small>{o.def}</small>}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
