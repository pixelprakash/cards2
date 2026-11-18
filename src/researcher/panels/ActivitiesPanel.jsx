import BarList from "../BarList.jsx";

const n1 = (v) => (Number.isInteger(v) ? v : (Math.round(v * 10) / 10).toFixed(1));

export default function ActivitiesPanel({ M }) {
  const { al, te, ex, rt } = M;
  return (
    <div className="stack-lg">
      <section className="rsec" aria-labelledby="a-h">
        <h2 id="a-h">Resource allocation</h2>
        <p className="hint">{al.n} participants. Average points out of 100. Points show relative priority, not budget shares.</p>
        <BarList items={al.categories.map((c) => ({ ...c, display: `${n1(c.mean)} avg · ${c.zero} gave 0 · highest ${c.max}` }))} max={50} tone="sand" />
      </section>
      <div className="grid2">
        <section className="rsec" aria-labelledby="t-h">
          <h2 id="t-h">Tensions</h2>
          <p className="hint">{te.total} chosen in total. Where a slider was used, the first side&rsquo;s average share of 100.</p>
          {te.items.length ? <BarList items={te.items.map((t) => ({ ...t, label: `${t.a} / ${t.b}${t.own ? " (added)" : ""}`, display: `${t.n} chosen${t.meanA != null ? ` · ${t.a} ${Math.round(t.meanA)}` : ""}` }))} tone="blue" /> : <p className="muted">No tensions chosen yet.</p>}
        </section>
        <section className="rsec" aria-labelledby="x-h">
          <h2 id="x-h">Learning experiences</h2>
          <p className="hint">Built on either route.</p>
          <BarList items={[
            { label: "Built a learning experience", display: `${ex.answered} of ${ex.n}`, n: ex.answered },
            { label: "…with at least one step", display: `${ex.withSteps}`, n: ex.withSteps },
          ]} max={Math.max(1, ex.n)} tone="green" />
          <p className="muted">Average steps per experience: {n1(ex.meanSteps)}</p>
        </section>
      </div>
      <section className="rsec" aria-labelledby="r-h">
        <h2 id="r-h">Rethinking familiar practices</h2>
        <p className="hint">How many participants chose each action for each practice.</p>
        {rt.length ? (
          <div className="tbl-wrap" tabIndex={0} role="region" aria-label="Table, scrolls sideways on small screens">
            <table className="tbl">
              <thead><tr><th scope="col">Practice</th><th scope="col">Keep</th><th scope="col">Change</th><th scope="col">Leave behind</th><th scope="col">Combine</th><th scope="col">Add</th></tr></thead>
              <tbody>{rt.map((r) => <tr key={r.label}><th scope="row">{r.label}</th><td className="num">{r.keep}</td><td className="num">{r.change}</td><td className="num">{r.leave}</td><td className="num">{r.combine}</td><td className="num">{r.add}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="muted">Nobody has done this activity yet.</p>}
      </section>
    </div>
  );
}
