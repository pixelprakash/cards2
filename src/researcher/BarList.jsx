import { useEffect, useState } from "react";

// Horizontal bars with the value written out, so nothing depends on colour or length alone. Bars grow in when they appear.
export default function BarList({ items, max, unit = "", tone }) {
  const top = max ?? Math.max(1, ...items.map((i) => i.n ?? i.mean ?? 0));
  const [on, setOn] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setOn(true)); return () => cancelAnimationFrame(t); }, []);
  return (
    <ul className={`barlist${tone ? ` tone-${tone}` : ""}`}>
      {items.map((i, k) => {
        const v = i.n ?? i.mean ?? 0;
        return (
          <li className="bl" key={i.id ?? i.label}>
            <div className="t"><span>{i.label}</span><span>{i.display ?? `${Number.isInteger(v) ? v : v.toFixed(1)}${unit}`}</span></div>
            <div className="track" aria-hidden="true"><i style={{ width: on ? `${Math.min(100, (v / top) * 100)}%` : "0%", "--i": k }} /></div>
          </li>
        );
      })}
    </ul>
  );
}
