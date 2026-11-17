import { useId, useState } from "react";
import { Plus, Cross } from "./Icons.jsx";

// "Add your own": a single line, added with the button or Enter. Added items can be removed.
export function AddOwn({ label = "Add your own", placeholder, onAdd, max = 120, buttonLabel = "Add" }) {
  const [text, setText] = useState("");
  const id = useId();
  const add = () => { const t = text.trim(); if (!t) return; onAdd(t); setText(""); };
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="addrow">
        <input id={id} className="input" value={text} maxLength={max} placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" className="btn btn-soft" onClick={add}><Plus />{buttonLabel}</button>
      </div>
    </div>
  );
}

export function OwnTags({ items, onRemove }) {
  if (!items.length) return null;
  return (
    <ul className="chips" aria-label="Added by you">
      {items.map((i) => (
        <li key={i.id} className="tag">{i.text}
          <button type="button" onClick={() => onRemove(i.id)} aria-label={`Remove ${i.text}`}><Cross /></button>
        </li>
      ))}
    </ul>
  );
}
