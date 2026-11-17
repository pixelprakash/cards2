import { DIMENSION } from "../config/dimensions.js";

// The coloured block at the top of a question screen. One headline: the question itself, with the dimension or
// activity name as a small label above it. A single short line of help sits underneath.
export default function QBlock({ tone = "orange", eyebrow, badge, title, question, hint, layered }) {
  const label = question && title ? `${eyebrow} · ${title}` : eyebrow;
  return (
    <header className={`qblock tone-${tone} tone-block${layered ? " layered" : ""}`}>
      <p className="eyebrow">{label}{badge && <span className={`badge${badge === "Required" ? "" : " light"}`}>{badge}</span>}</p>
      <h1 className={`title${question ? " title-q" : ""}`}>{question ?? title}</h1>
      {hint && <p className="hint">{hint}</p>}
    </header>
  );
}

export const dimEyebrow = (dim) => `${dim.n} of ${Object.keys(DIMENSION).length}`;
