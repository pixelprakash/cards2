import { useEffect, useMemo, useRef, useState } from "react";
import { flatten } from "../export/flatten.js";
import { answer as ans, itemLabel as label, sectionLabel } from "../export/labels.js";
import { SECTIONS, EMPTY_SECTION } from "../profile/organise.js";
import { STAGE_LABEL, minutes } from "./metrics.js";
import { download } from "./exports.js";
import { printHtml } from "./print.js";


// Everything one participant did, in a side sheet. Download it, or delete it (two steps, so it cannot happen by accident).
export default function ParticipantSheet({ session, onClose, onDelete, sample }) {
  const ref = useRef(null);
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState("");
  useEffect(() => { const d = ref.current; if (d && session && !d.open) d.showModal(); }, [session]);

  const groups = useMemo(() => {
    if (!session) return [];
    const map = new Map();
    flatten(session).filter((r) => r.section !== "profile").forEach((r) => {
      const key = sectionLabel(r.section);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return [...map.entries()].filter(([, rows]) => rows.some((r) => !(r.item === "status" && r.value === "unanswered")));
  }, [session]);

  if (!session) return <dialog ref={ref} className="drawer" onClose={onClose} />;
  const versions = session.profile?.versions ?? [];
  const shown = versions.find((v) => v.id === session.profile?.approvedVersionId) ?? versions[versions.length - 1];

  const word = async () => { setBusy("word"); try { const [{ buildDocx }, R] = await Promise.all([import("../export/office.js"), import("../export/reports.js")]); download(`participant-${session.code}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buildDocx(R.participantReport(session))); } finally { setBusy(""); } };
  const pdf = async () => { const R = await import("../export/reports.js"); printHtml(R.reportHtml(R.participantReport(session), `Participant ${session.code}`)); };

  return (
    <dialog ref={ref} className="drawer" aria-labelledby="sh-t" onClose={() => { setSure(false); onClose(); }} onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}>
      <div className="drawer-in">
        <header className="drawer-head">
          <div>
            <p className="eyebrow">{session.route === "free" ? "Imagine Freely" : "Configure Your Institution"}</p>
            <h2 id="sh-t">{session.code}</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => ref.current.close()}>Close</button>
        </header>

        <dl className="facts">
          <div><dt>Reached</dt><dd>{session.completedAt ? "Submitted" : STAGE_LABEL[session.furthest]}</dd></div>
          <div><dt>Started</dt><dd>{new Date(session.createdAt).toLocaleString()}</dd></div>
          <div><dt>Time</dt><dd>{session.completedAt ? `${Math.round(minutes(session))} min` : "–"}</dd></div>
          <div><dt>Device</dt><dd>{session.device}</dd></div>
          <div><dt>Profile</dt><dd>{session.profile?.approvedVersionId ? "Approved" : versions.length ? "Not approved" : "None"}</dd></div>
        </dl>

        <div className="row">
          <button type="button" className="btn btn-soft btn-small" onClick={word} disabled={Boolean(busy)}>{busy ? "Preparing…" : "Word"}</button>
          <button type="button" className="btn btn-soft btn-small" onClick={pdf}>PDF</button>
        </div>

        {shown && (
          <section aria-labelledby="sh-p">
            <h3 id="sh-p">{shown.kind === "approved" ? "Approved profile" : "Latest profile draft"}</h3>
            {SECTIONS.map((s) => <div key={s.id} className="sh-sec"><h4>{s.title}{shown.edited?.[s.id] ? <span className="tag-req"> edited by participant</span> : null}</h4><p>{shown.sections?.[s.id] || EMPTY_SECTION}</p></div>)}
          </section>
        )}

        <section aria-labelledby="sh-a">
          <h3 id="sh-a">Every answer</h3>
          {groups.map(([name, rows]) => (
            <details className="sh-group" key={name} open={rows.length < 12}>
              <summary>{name} <span className="muted">· {rows.length}</span></summary>
              <ul>
                {rows.map((r, i) => <li key={i}><span className="it">{label(r.item)}</span><span className="an">{ans(r) || "–"}</span><span className="pv">{r.status !== "answered" ? `${r.status} · ` : ""}{r.provenance}</span></li>)}
              </ul>
            </details>
          ))}
        </section>

        {!sample && (
          <footer className="drawer-foot">
            {!sure
              ? <button type="button" className="btn btn-ghost btn-small" onClick={() => setSure(true)}>Delete this participant…</button>
              : <div className="row"><p><b>Delete everything for {session.code}?</b> This cannot be undone.</p><button type="button" className="btn btn-soft btn-small" onClick={async () => { await onDelete(session.code); ref.current.close(); }}>Yes, delete</button><button type="button" className="btn-text" onClick={() => setSure(false)}>Keep</button></div>}
          </footer>
        )}
      </div>
    </dialog>
  );
}
