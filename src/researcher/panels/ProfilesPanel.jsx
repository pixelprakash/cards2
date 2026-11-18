import { pct } from "../metrics.js";
import BarList from "../BarList.jsx";

export default function ProfilesPanel({ M }) {
  const { pr, o } = M;
  return (
    <div className="stack-lg">
      <section className="rsec" aria-labelledby="p-h">
        <h2 id="p-h">How people treated their profile</h2>
        <p className="hint">The profile is organised from each participant&rsquo;s own answers. They can edit it, regenerate it and approve it.</p>
        <BarList items={[
          { label: "Saw a profile", display: `${pr.n}`, n: pr.n },
          { label: "Approved it", display: `${pr.approved} (${pct(pr.approved, pr.n)}%)`, n: pr.approved },
          { label: "Edited at least one part", display: `${o.edited} (${pct(o.edited, pr.n)}%)`, n: o.edited },
        ]} max={Math.max(1, pr.n)} tone="sand" />
      </section>
      <section className="rsec" aria-labelledby="pe-h">
        <h2 id="pe-h">Which parts got edited</h2>
        <p className="hint">A part that is edited a lot may be where the organised draft misses what people meant.</p>
        <BarList items={pr.edits.map((e) => ({ ...e, display: `${e.n} of ${pr.n}` }))} max={Math.max(1, pr.n)} tone="purple" />
      </section>
    </div>
  );
}
