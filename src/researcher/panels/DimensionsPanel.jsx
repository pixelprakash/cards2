import BarList from "../BarList.jsx";

const n1 = (v) => (Number.isInteger(v) ? v : (Math.round(v * 10) / 10).toFixed(1));

export default function DimensionsPanel({ M }) {
  const { dims, ed } = M;
  return (
    <div className="stack-lg">
      <section className="rsec" aria-labelledby="d-h">
        <h2 id="d-h">The twelve dimensions</h2>
        <p className="hint">Configure route only. Skipped, not applicable and unanswered are kept apart. Open a row to see the most common choices.</p>
        <div className="tbl-wrap" tabIndex={0} role="region" aria-label="Table, scrolls sideways on small screens">
          <table className="tbl">
            <caption>Answers per dimension, out of {dims[0]?.base ?? 0} participants on this route</caption>
            <thead><tr><th scope="col">Dimension</th><th scope="col">Answered</th><th scope="col">Skipped</th><th scope="col">Not applicable</th><th scope="col">Unanswered</th></tr></thead>
            <tbody>
              {dims.map((d) => (
                <tr key={d.dim.id}>
                  <th scope="row">{d.dim.n}. {d.dim.title}{d.dim.required ? <span className="tag-req"> required</span> : null}
                    {d.top.length > 0 && <details className="more"><summary>Most common choices</summary><BarList items={d.top.slice(0, 6)} /></details>}
                  </th>
                  <td className="num">{d.answered}</td><td className="num">{d.skipped}</td><td className="num">{d.na}</td><td className="num">{d.unanswered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid2">
        <section className="rsec" aria-labelledby="e1-h">
          <h2 id="e1-h">Who contributes</h2>
          <p className="hint">{ed.n} participants answered the Educators dimension.</p>
          {ed.groups.length ? <BarList items={ed.groups} tone="purple" /> : <p className="muted">No answers yet.</p>}
          <h3 className="sub">Most regularly involved</h3>
          {ed.regular.length ? <BarList items={ed.regular} tone="purple" /> : <p className="muted">No answers yet.</p>}
        </section>
        <section className="rsec" aria-labelledby="e2-h">
          <h2 id="e2-h">Roles: average points</h2>
          <p className="hint">Points out of 100 across roles. Zero counts as a real answer.</p>
          <BarList items={ed.roles.map((r) => ({ ...r, display: `${n1(r.mean)} avg · ${r.zero} gave 0` }))} max={50} tone="orange" />
        </section>
      </div>
    </div>
  );
}
