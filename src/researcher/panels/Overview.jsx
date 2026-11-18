import { pct } from "../metrics.js";
import BarList from "../BarList.jsx";

const n1 = (v) => (Number.isInteger(v) ? v : v.toFixed(1));

// A headline figure. Pass num (with optional suffix and decimals), or v for text.
function Stat({ tone, num, suffix = "", decimals = 0, v, l, s }) {
  const shown = num == null ? v : `${num.toFixed(decimals)}${suffix}`;
  return <div className={`stat tone-${tone}`}><span className="v">{shown}</span><span className="l">{l}</span>{s && <span className="s">{s}</span>}</div>;
}

function DailyChart({ days }) {
  const top = Math.max(1, ...days.map((d) => d.started));
  return (
    <figure className="daily">
      <figcaption className="hint">Starts per day, last {days.length} days. The dark part is how many of them submitted.</figcaption>
      <ul className="daily-bars">
        {days.map((d) => (
          <li key={d.label} aria-label={`${d.label}: ${d.started} started, ${d.done} submitted`} title={`${d.label}: ${d.started} started, ${d.done} submitted`}>
            <span className="col" style={{ height: `${(d.started / top) * 100}%` }}><i style={{ height: d.started ? `${(d.done / d.started) * 100}%` : 0 }} /></span>
            <span className="lbl" aria-hidden="true">{d.label.split(" ")[0]}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export default function Overview({ M }) {
  const { o, fun, days } = M;
  return (
    <div className="stack-lg">
      <section className="rsec" aria-labelledby="o-h">
        <h2 id="o-h">At a glance</h2>
        <div className="stats">
          <Stat tone="pink" num={o.started} l="Started" s="chose a route" />
          <Stat tone="orange" num={o.completed} l="Submitted" s={`${o.completionRate}% of those who started`} />
          <Stat tone="blue" {...(o.completed ? { num: o.medianMinutes, suffix: " min", decimals: 1 } : { v: "–" })} l="Median time to submit" />
          <Stat tone="purple" num={pct(o.free, o.started)} suffix="%" l="Imagine Freely" s={`${o.free} free, ${o.configure} configured`} />
          <Stat tone="sand" num={pct(o.approved, o.withProfile)} suffix="%" l="Approved their profile" s={`${o.approved} of ${o.withProfile} who saw one`} />
          <Stat tone="green" num={pct(o.edited, o.withProfile)} suffix="%" l="Edited the profile" s={o.meanDrafts ? `${n1(Math.round(o.meanDrafts * 10) / 10)} drafts each on average` : undefined} />
        </div>
      </section>
      <section className="rsec" aria-labelledby="d-h">
        <h2 id="d-h">Over time</h2>
        <DailyChart days={days} />
      </section>
      <div className="grid2">
        <section className="rsec" aria-labelledby="fu-h">
          <h2 id="fu-h">Where people got to</h2>
          <p className="hint">Each bar counts the participants who reached that stage. Choosing a route is not a score.</p>
          <BarList items={fun.map((f) => ({ ...f, display: `${f.n} (${pct(f.n, fun[0].n)}%)` }))} tone="pink" />
        </section>
        <section className="rsec" aria-labelledby="dv-h">
          <h2 id="dv-h">Devices</h2>
          <p className="hint">What people used. Useful for deciding how much to test on phones.</p>
          {o.devices.length ? <BarList items={o.devices.map((d) => ({ ...d, display: `${d.n} (${pct(d.n, o.started)}%)` }))} tone="blue" /> : <p className="muted">Nothing yet.</p>}
        </section>
      </div>
    </div>
  );
}
