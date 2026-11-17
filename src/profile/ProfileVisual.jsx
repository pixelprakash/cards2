import { EDUCATOR_ROLES } from "../config/dimensions.js";
import { dimOf } from "../state/model.js";
import { categoriesFor } from "../flow/validate.js";

function Bars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return rows.map((r) => (
    <div className="vbar" key={r.label}>
      <div className="vl"><span>{r.label}</span><span>{r.n}</span></div>
      <div className="vt" aria-hidden="true"><i style={{ width: `${(r.n / max) * 100}%` }} /></div>
    </div>
  ));
}

// The visual side of the profile: plain bars drawn from the participant's own numbers. Nothing here is added by the system.
export default function ProfileVisual({ session }) {
  const a = session.activities.allocation;
  const prio = categoriesFor(a).map((r) => ({ label: r.label, n: a.values[r.id] ?? 0 })).filter((r) => r.n > 0).sort((x, y) => y.n - x.n);
  const ed = dimOf(session, "educators");
  const roles = [...EDUCATOR_ROLES.map((r) => ({ label: r.label, n: ed.roles.values[r.id] ?? 0 })), ...ed.roles.custom.map((r) => ({ label: r.text, n: ed.roles.values[r.id] ?? 0 }))].filter((r) => r.n > 0).sort((x, y) => y.n - x.n);
  const tensions = session.activities.tensions.selected.filter((t) => t.useSlider && t.value != null);
  if (!prio.length && !roles.length && !tensions.length) return null;
  return (
    <section className="vis" aria-labelledby="vis-h">
      <h3 id="vis-h">Your numbers, shown</h3>
      <div className="vis-grid">
        {prio.length > 0 && <div><p className="vs"><b>Priorities</b> (points out of 100)</p><Bars rows={prio} /></div>}
        {roles.length > 0 && <div><p className="vs"><b>Roles</b> (points out of 100)</p><Bars rows={roles} /></div>}
        {tensions.length > 0 && (
          <div>
            <p className="vs"><b>Tensions</b> (each pair adds to 100)</p>
            {tensions.map((t) => (
              <div className="vbar" key={t.id}>
                <div className="vl"><span>{t.a} {t.value}</span><span>{t.b} {100 - t.value}</span></div>
                <div className="vt" aria-hidden="true"><i style={{ width: `${t.value}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
