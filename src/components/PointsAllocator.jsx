import { useEffect, useRef } from "react";
import { ALLOCATION_TOTAL } from "../config/activities.js";
import { burst } from "./Confetti.js";
import { haptic } from "../hooks/motion.js";
import Slider from "./Slider.jsx";
import { Minus, Plus, Cross } from "./Icons.jsx";

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// Spread exactly `total` points across rows. Slider, number box, +/- buttons and "Rest" all work (no dragging needed).
// A row cannot take more than the points still left, so the total can never go over. Placing the last point celebrates.
export default function PointsAllocator({ rows, values, onChange, onSpread, onClear, onRemove, total = ALLOCATION_TOTAL, unit = "points", note }) {
  const used = rows.reduce((a, r) => a + (values[r.id] ?? 0), 0);
  const left = total - used;
  const totalRef = useRef(null);
  const prevLeft = useRef(left);

  useEffect(() => {
    if (prevLeft.current !== 0 && left === 0 && used > 0) { burst(totalRef.current, { count: 30 }); haptic(25); }
    prevLeft.current = left;
  }, [left, used]);

  const set = (id, raw) => {
    const n = Number.parseInt(raw, 10);
    const others = used - (values[id] ?? 0);
    onChange(id, clamp(Number.isFinite(n) ? n : 0, 0, total - others));
  };
  return (
    <div className="alloc">
      <div ref={totalRef} className={`alloc-total${left === 0 ? " is-ok" : ""}`} role="status" aria-live="polite" aria-atomic="true">
        <span>Total {used} / {total}</span>
        <span className="bar" aria-hidden="true"><i style={{ width: `${(used / total) * 100}%` }} /></span>
        <span>{left === 0 ? "All points placed" : `${left} ${unit} left`}</span>
      </div>
      {note && <p className="hint">{note}</p>}
      <ul>
        {rows.map((r) => {
          const v = values[r.id] ?? 0;
          const others = used - v;
          const id = `alloc-${r.id}`;
          return (
            <li key={r.id} className="alloc-row">
              <span className="name" id={`${id}-n`}>{r.label}{r.own && <span className="muted"> (added by you)</span>}</span>
              <Slider value={v} min={0} max={total} labelledBy={`${id}-n`} valueText={`${v} ${unit}`} onChange={(n) => set(r.id, n)} />
              <span className="num">
                <input className="input" inputMode="numeric" pattern="[0-9]*" aria-label={`${r.label}, ${unit}`} value={values[r.id] === undefined ? "" : v} placeholder="0"
                  onChange={(e) => set(r.id, e.target.value.replace(/\D/g, ""))} onFocus={(e) => e.target.select()} />
                <span className="extras">
                  <button type="button" className="iconbtn" aria-label={`One less for ${r.label}`} aria-disabled={v === 0 || undefined} onClick={() => set(r.id, v - 1)}><Minus /></button>
                  <button type="button" className="iconbtn" aria-label={`One more for ${r.label}`} aria-disabled={others + v >= total || left === 0 || undefined} onClick={() => set(r.id, v + 1)}><Plus /></button>
                  {left > 0 && <button type="button" className="rest" aria-label={`Put the remaining ${left} ${unit} on ${r.label}`} onClick={() => set(r.id, v + left)}>+{left}</button>}
                  {onRemove && r.own && <button type="button" className="iconbtn" aria-label={`Remove ${r.label}`} onClick={() => onRemove(r.id)}><Cross /></button>}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="row">
        <button type="button" className="btn btn-ghost btn-small" onClick={onSpread}>Spread evenly</button>
        <button type="button" className="btn btn-ghost btn-small" onClick={onClear}>Clear all</button>
      </div>
    </div>
  );
}
