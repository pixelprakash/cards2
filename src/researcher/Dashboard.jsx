import { useMemo, useState } from "react";
import { allocation, dimensions, educators, experience, funnel, inPeriod, overview, pct, profiles, tensions, writing } from "./metrics.js";
import BarList from "./BarList.jsx";
import { useCountUp } from "../hooks/motion.js";
import { download, responsesCsv, summaryCsv } from "./exports.js";

const n1 = (v) => (Number.isInteger(v) ? v : v.toFixed(1));

// A headline figure that counts up. Pass num (with optional suffix and decimals), or v for text.
function Stat({ tone, num, suffix = "", decimals = 0, v, l, s }) {
  const n = useCountUp(num ?? 0);
  const shown = num == null ? v : `${n.toFixed(decimals)}${suffix}`;
  return <div className={`stat tone-${tone}`}><span className="v">{shown}</span><span className="l">{l}</span>{s && <span className="s">{s}</span>}</div>;
}

export default function Dashboard({ sessions, sample, offline, onSample, sampleOn }) {
  const [days, setDays] = useState(0);
  const [route, setRoute] = useState("");
  const [only, setOnly] = useState("");
  const [kind, setKind] = useState("");

  const list = useMemo(() => inPeriod(sessions, days).filter((s) => (!route || s.route === route) && (!only || (only === "done" ? s.completedAt : !s.completedAt))), [sessions, days, route, only]);
  const o = useMemo(() => overview(list), [list]);
  const fun = useMemo(() => funnel(list), [list]);
  const dims = useMemo(() => dimensions(list), [list]);
  const ed = useMemo(() => educators(list), [list]);
  const al = useMemo(() => allocation(list), [list]);
  const te = useMemo(() => tensions(list), [list]);
  const ex = useMemo(() => experience(list), [list]);
  const pr = useMemo(() => profiles(list), [list]);
  const wr = useMemo(() => writing(list), [list]);
  const kinds = [...new Set(wr.map((w) => w.kind))];
  const shownWr = wr.filter((w) => !kind || w.kind === kind).slice(0, 60);

  return (
    <div className="stack-lg r-wrap">
      <div className={`source${sample ? " sample" : ""}`} role="status">
        {sample ? "Showing made-up sample data. Nothing here is real, and it is not stored." : offline ? "The shared database is not connected, so there is nothing to show yet. Use the sample preview to see how this page will look." : `Showing ${sessions.length} participant ${sessions.length === 1 ? "session" : "sessions"} from the shared database.`}
      </div>

      <section className="rsec" aria-labelledby="f-h">
        <h2 id="f-h" className="sr-only">Filters and downloads</h2>
        <form className="r-filters" onSubmit={(e) => e.preventDefault()}>
          <div className="field"><label htmlFor="f-days">Period</label><select id="f-days" className="select" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value="0">All time</option><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></div>
          <div className="field"><label htmlFor="f-route">Route</label><select id="f-route" className="select" value={route} onChange={(e) => setRoute(e.target.value)}><option value="">Both routes</option><option value="free">Imagine Freely</option><option value="configure">Configure Your Institution</option></select></div>
          <div className="field"><label htmlFor="f-only">Status</label><select id="f-only" className="select" value={only} onChange={(e) => setOnly(e.target.value)}><option value="">All</option><option value="done">Submitted</option><option value="open">Not finished</option></select></div>
        </form>
        <div className="row">
          <button type="button" className="btn btn-soft" onClick={() => download("lid-responses.csv", "text/csv", responsesCsv(list))}>Download responses (CSV)</button>
          <button type="button" className="btn btn-soft" onClick={() => download("lid-participants.csv", "text/csv", summaryCsv(list))}>Download one row per participant (CSV)</button>
          <button type="button" className="btn btn-soft" onClick={() => download("lid-sessions.json", "application/json", JSON.stringify(list, null, 2))}>Download everything (JSON)</button>
          <button type="button" className="btn btn-ghost" aria-pressed={sampleOn} onClick={onSample}>{sampleOn ? "Hide sample data" : "Preview with sample data"}</button>
        </div>
      </section>

      <section className="rsec" aria-labelledby="o-h">
        <h2 id="o-h">Overview</h2>
        <div className="stats">
          <Stat tone="pink" num={o.started} l="Started" s="chose a route" />
          <Stat tone="orange" num={o.completed} l="Submitted" s={`${o.completionRate}% of those who started`} />
          <Stat tone="blue" {...(o.completed ? { num: o.medianMinutes, suffix: " min", decimals: 1 } : { v: "–" })} l="Median time to submit" />
          <Stat tone="purple" num={pct(o.free, o.started)} suffix="%" l="Imagine Freely" s={`${o.free} free, ${o.configure} configured`} />
          <Stat tone="sand" num={pct(o.approved, o.withProfile)} suffix="%" l="Approved their profile" s={`${o.approved} of ${o.withProfile} who saw one`} />
          <Stat tone="green" num={pct(o.edited, o.withProfile)} suffix="%" l="Edited the profile" s={o.meanDrafts ? `${n1(Math.round(o.meanDrafts * 10) / 10)} drafts each on average` : undefined} />
        </div>
      </section>

      <section className="rsec" aria-labelledby="fu-h">
        <h2 id="fu-h">Where people got to</h2>
        <p className="hint">Each bar counts the participants who reached that stage. Choosing a route is not a score.</p>
        <BarList items={fun.map((f) => ({ ...f, display: `${f.n} (${pct(f.n, fun[0].n)}%)` }))} tone="pink" />
      </section>

      <section className="rsec" aria-labelledby="d-h">
        <h2 id="d-h">Dimensions (Configure route)</h2>
        <p className="hint">Skipped, not applicable and unanswered are counted separately. Open a row for the most common choices.</p>
        <div className="tbl-wrap">
          <table className="tbl">
            <caption>Answers per dimension, out of {dims[0]?.base ?? 0} participants on this route</caption>
            <thead><tr><th scope="col">Dimension</th><th scope="col">Answered</th><th scope="col">Skipped</th><th scope="col">Not applicable</th><th scope="col">Unanswered</th></tr></thead>
            <tbody>
              {dims.map((d) => (
                <tr key={d.dim.id}>
                  <th scope="row">{d.dim.n}. {d.dim.title}{d.dim.required ? " (required)" : ""}
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
          <h3 style={{ font: "700 1.1875rem/1.3 var(--font)", marginTop: "0.8rem" }}>Most regularly involved</h3>
          {ed.regular.length ? <BarList items={ed.regular} tone="purple" /> : <p className="muted">No answers yet.</p>}
        </section>
        <section className="rsec" aria-labelledby="e2-h">
          <h2 id="e2-h">Roles: average points</h2>
          <p className="hint">Points out of 100 across roles. Zero is counted as a real answer.</p>
          <BarList items={ed.roles.map((r) => ({ ...r, display: `${n1(Math.round(r.mean * 10) / 10)} avg · ${r.zero} gave 0` }))} max={50} tone="orange" />
        </section>
      </div>

      <section className="rsec" aria-labelledby="a-h">
        <h2 id="a-h">Resource allocation: average points</h2>
        <p className="hint">{al.n} participants. Points show relative priority, not budget shares.</p>
        <BarList items={al.categories.map((c) => ({ ...c, display: `${n1(Math.round(c.mean * 10) / 10)} avg · ${c.zero} gave 0 · highest ${c.max}` }))} max={50} tone="sand" />
      </section>

      <div className="grid2">
        <section className="rsec" aria-labelledby="t-h">
          <h2 id="t-h">Tensions</h2>
          <p className="hint">{te.total} tensions chosen in total. For paired sliders, the first side&rsquo;s average share of 100.</p>
          {te.items.length ? <BarList items={te.items.map((t) => ({ ...t, label: `${t.a} / ${t.b}${t.own ? " (added)" : ""}`, display: `${t.n} chosen${t.meanA != null ? ` · ${t.a} ${Math.round(t.meanA)}` : ""}` }))} tone="blue" /> : <p className="muted">No tensions chosen yet.</p>}
        </section>
        <section className="rsec" aria-labelledby="x-h">
          <h2 id="x-h">Learning experiences and profiles</h2>
          <BarList items={[
            { label: "Built a learning experience", display: `${ex.answered} of ${ex.n}`, n: ex.answered },
            { label: "…with at least one step", display: `${ex.withSteps}`, n: ex.withSteps },
            ...pr.edits.map((e) => ({ label: `Edited: ${e.label}`, display: `${e.n} of ${pr.n}`, n: e.n })),
          ]} max={Math.max(1, ex.n, pr.n)} tone="green" />
        </section>
      </div>

      <section className="rsec" aria-labelledby="w-h">
        <h2 id="w-h">In their own words</h2>
        <p className="hint">Written answers can contain personal details. Treat these and the downloads as research data.</p>
        <div className="field" style={{ maxWidth: "26rem" }}><label htmlFor="w-k">Show</label><select id="w-k" className="select" value={kind} onChange={(e) => setKind(e.target.value)}><option value="">Everything ({wr.length})</option>{kinds.map((k) => <option key={k} value={k}>{k}</option>)}</select></div>
        <div className="stack">{shownWr.length ? shownWr.map((w, i) => (<blockquote className="quote" key={i} style={{ margin: 0 }}><span className="k">{w.kind}</span><p>{w.text}</p><span className="c">{w.code} · {w.route === "free" ? "Imagine Freely" : "Configure"}</span></blockquote>)) : <p className="muted">Nothing written yet.</p>}</div>
        {wr.filter((w) => !kind || w.kind === kind).length > 60 && <p className="muted">Showing the first 60. Download the CSV for all of them.</p>}
      </section>
      <p className="hint">Counts about stages use every participant who started. Counts about answers use those who reached that part. Each participant is an anonymous code.</p>
    </div>
  );
}
