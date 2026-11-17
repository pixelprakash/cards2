import { useId, useRef, useState } from "react";
import { Plus, Cross } from "./Icons.jsx";

// "Add your own" stays a quiet text button until it is wanted. Added with the button or Enter; Esc closes.
export function AddOwn({ label = "Add your own", placeholder, onAdd, max = 120, buttonLabel = "Add" }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const id = useId();
  const input = useRef(null);
  const add = () => { const t = text.trim(); if (!t) return; onAdd(t); setText(""); input.current?.focus(); };
  if (!open) {
    return (
      <div className="addwrap">
        <button type="button" className="btn-text" aria-expanded="false" onClick={() => { setOpen(true); setTimeout(() => input.current?.focus(), 30); }}>+ {label}</button>
      </div>
    );
  }
  return (
    <div className="addwrap">
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <div className="addrow">
          <input id={id} ref={input} className="input" value={text} maxLength={max} placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } if (e.key === "Escape") { setOpen(false); setText(""); } }} />
          <button type="button" className="btn btn-soft" onClick={add}><Plus />{buttonLabel}</button>
          <button type="button" className="iconbtn" aria-label={`Close ${label.toLowerCase()}`} onClick={() => { setOpen(false); setText(""); }}><Cross /></button>
        </div>
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
