import { useMemo, useState } from "react";
import { STAGE_LABEL, minutes } from "../metrics.js";

const SORTS = {
  new: (a, b) => b.createdAt.localeCompare(a.createdAt),
  old: (a, b) => a.createdAt.localeCompare(b.createdAt),
  far: (a, b) => (b.completedAt ? 1 : 0) - (a.completedAt ? 1 : 0) || a.createdAt.localeCompare(b.createdAt),
};

export default function PeoplePanel({ list, onOpen }) {
  const [sort, setSort] = useState("new");
  const rows = useMemo(() => [...list].sort(SORTS[sort]), [list, sort]);
  return (
    <section className="rsec" aria-labelledby="pp-h">
      <h2 id="pp-h">Participants</h2>
      <p className="hint">One row per anonymous code. Open one to read everything they did, or to download or delete it.</p>
      <div className="field" style={{ maxWidth: "16rem" }}><label htmlFor="pp-s">Order</label>
        <select id="pp-s" className="select" value={sort} onChange={(e) => setSort(e.target.value)}><option value="new">Newest first</option><option value="old">Oldest first</option><option value="far">Submitted first</option></select></div>
      <p className="muted" role="status">{rows.length} {rows.length === 1 ? "participant" : "participants"}</p>
      <div className="people">
        <div className="people-head" aria-hidden="true"><span>Code</span><span>Route</span><span>Reached</span><span>Started</span><span>Time</span></div>
        <ul>
          {rows.slice(0, 200).map((s) => (
            <li key={s.id}>
              <button type="button" className="person" onClick={() => onOpen(s.code)} aria-label={`Open ${s.code}`}>
                <span className="code-s">{s.code}</span>
                <span className="r">{s.route === "free" ? "Imagine Freely" : "Configure"}</span>
                <span className={`st-s${s.completedAt ? " done" : ""}`}>{s.completedAt ? "Submitted" : STAGE_LABEL[s.furthest]}</span>
                <span className="d">{new Date(s.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })} · {s.device}</span>
                <span className="m">{s.completedAt ? `${Math.round(minutes(s))} min` : "–"}</span>
              </button>
            </li>
          ))}
        </ul>
        {!rows.length && <p className="muted">No participants match the filters.</p>}
      </div>
      {rows.length > 200 && <p className="muted">Showing the first 200. Use the filters to narrow down.</p>}
    </section>
  );
}
