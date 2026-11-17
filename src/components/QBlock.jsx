import { DIMENSION } from "../config/dimensions.js";

// The coloured block at the top of a question screen: where you are, the heading, the question, a hint.
export default function QBlock({ tone = "orange", eyebrow, badge, title, question, hint, layered }) {
  return (
    <header className={`qblock tone-${tone} tone-block${layered ? " layered" : ""}`}>
      <p className="eyebrow">{eyebrow}{badge && <span className={`badge${badge === "Required" ? "" : " light"}`}>{badge}</span>}</p>
      <h1 className="title">{title}</h1>
      {question && <p className="qline">{question}</p>}
      {hint && <p className="hint">{hint}</p>}
    </header>
  );
}

export const dimEyebrow = (dim) => `Dimension ${dim.n} of ${Object.keys(DIMENSION).length}`;
