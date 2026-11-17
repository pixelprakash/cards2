import { haptic } from "../hooks/motion.js";

// A range slider with a filled track, a big thumb and a value bubble that appears while it is used.
// The native input does the work, so keyboard, touch and screen readers behave as expected.
export default function Slider({ value, min = 0, max = 100, step = 1, onChange, label, labelledBy, valueText, tone, disabled }) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div className={`slider${tone ? ` tone-${tone}` : ""}`} style={{ "--p": pct }}>
      <input className="range" type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        aria-label={labelledBy ? undefined : label} aria-labelledby={labelledBy} aria-valuetext={valueText}
        onChange={(e) => { onChange(Number(e.target.value)); if (Number(e.target.value) % 10 === 0) haptic(4); }} />
      <output className="bubble" aria-hidden="true">{value}</output>
    </div>
  );
}
