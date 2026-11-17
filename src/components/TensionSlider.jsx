import { useId } from "react";

// One slider for a pair of poles. The two numbers always total 100. Numeric boxes and the keyboard work as well as dragging.
export default function TensionSlider({ a, b, value, onChange }) {
  const id = useId();
  const v = value ?? 50;
  const set = (raw) => {
    const n = Number.parseInt(raw, 10);
    onChange(Math.min(100, Math.max(0, Number.isFinite(n) ? n : 0)));
  };
  return (
    <div role="group" aria-label={`${a} and ${b}`} style={{ display: "grid", gap: "0.6rem" }}>
      <div className="poles">
        <div className="pole a">
          <label className="pname" htmlFor={`${id}-a`}>{a}</label>
          <input id={`${id}-a`} className="input" style={{ maxWidth: "6rem", textAlign: "center", fontWeight: 700 }} inputMode="numeric" value={v} onChange={(e) => set(e.target.value.replace(/\D/g, ""))} onFocus={(e) => e.target.select()} />
        </div>
        <div className="pole b">
          <label className="pname" htmlFor={`${id}-b`}>{b}</label>
          <input id={`${id}-b`} className="input" style={{ maxWidth: "6rem", textAlign: "center", fontWeight: 700 }} inputMode="numeric" value={100 - v} onChange={(e) => set(100 - Number.parseInt(e.target.value.replace(/\D/g, "") || "0", 10))} onFocus={(e) => e.target.select()} />
        </div>
      </div>
      <input className="range" type="range" min="0" max="100" step="1" value={v} aria-label={`${a} ${v}, ${b} ${100 - v}`} aria-valuetext={`${a} ${v} points, ${b} ${100 - v} points`} onChange={(e) => set(e.target.value)} />
      <p className="hint" style={{ margin: 0 }}>50 / 50 is the middle, not a recommended answer. The two numbers always add up to 100.</p>
    </div>
  );
}
