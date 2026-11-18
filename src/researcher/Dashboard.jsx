import { useEffect, useMemo, useRef, useState } from "react";
import { allocation, daily, dimensions, educators, experience, funnel, inPeriod, overview, profiles, rethink, tensions, writing } from "./metrics.js";
import Overview from "./panels/Overview.jsx";
import DimensionsPanel from "./panels/DimensionsPanel.jsx";
import ActivitiesPanel from "./panels/ActivitiesPanel.jsx";
import ProfilesPanel from "./panels/ProfilesPanel.jsx";
import WritingPanel from "./panels/WritingPanel.jsx";
import PeoplePanel from "./panels/PeoplePanel.jsx";
import DownloadPanel from "./panels/DownloadPanel.jsx";
import ParticipantSheet from "./ParticipantSheet.jsx";

const TABS = [["overview", "Overview"], ["dimensions", "Dimensions"], ["activities", "Activities"], ["profiles", "Profiles"], ["writing", "In their words"], ["people", "Participants"], ["download", "Download"]];
const FILTERS_OFF = { days: 0, route: "", only: "", q: "" };

const useTab = () => {
  const read = () => { const t = location.hash.slice(1); return TABS.some(([k]) => k === t) ? t : "overview"; };
  const [tab, setTab] = useState(read);
  useEffect(() => { const on = () => setTab(read()); addEventListener("hashchange", on); return () => removeEventListener("hashchange", on); }, []);
  return [tab, (t) => { location.hash = t; }];
};

export default function Dashboard({ sessions, sample, offline, onSample, sampleOn, onDelete, onRefresh, updatedAt }) {
  const [tab, setTab] = useTab();
  const [f, setF] = useState(FILTERS_OFF);
  const [openCode, setOpenCode] = useState(null);
  const tabRefs = useRef({});

  const list = useMemo(() => inPeriod(sessions, f.days).filter((s) => (!f.route || s.route === f.route) && (!f.only || (f.only === "done" ? s.completedAt : !s.completedAt)) && (!f.q || s.code.toLowerCase().includes(f.q.trim().toLowerCase()))), [sessions, f]);
  const M = useMemo(() => ({ o: overview(list), fun: funnel(list), days: daily(list), dims: dimensions(list), ed: educators(list), al: allocation(list), te: tensions(list), ex: experience(list), pr: profiles(list), wr: writing(list), rt: rethink(list) }), [list]);
  const filtered = f.days || f.route || f.only || f.q;
  const filterNote = [f.days ? `last ${f.days} day${f.days > 1 ? "s" : ""}` : "", f.route === "free" ? "Imagine Freely" : f.route === "configure" ? "Configure route" : "", f.only === "done" ? "submitted only" : f.only === "open" ? "not finished" : "", f.q ? `code contains “${f.q}”` : ""].filter(Boolean).join(", ");
  const sel = openCode ? sessions.find((s) => s.code === openCode) : null;

  const key = (e) => {
    const i = TABS.findIndex(([k]) => k === tab); let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length; else if (e.key === "ArrowLeft") n = (i - 1 + TABS.length) % TABS.length; else if (e.key === "Home") n = 0; else if (e.key === "End") n = TABS.length - 1; else return;
    e.preventDefault(); setTab(TABS[n][0]); tabRefs.current[TABS[n][0]]?.focus();
  };

  const empty = !sessions.length && !sampleOn;
  const counts = { people: list.length, writing: M.wr.length };

  return (
    <div className="dash">
      <div className={`source${sample ? " sample" : ""}`} role="status">
        <span>{sample ? "Made-up sample data. Nothing here is real, and it is not stored."
          : offline ? "The shared database is not connected, so there is nothing to show yet."
            : `${sessions.length} ${sessions.length === 1 ? "participant" : "participants"} in the shared database${updatedAt ? ` · updated ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`}</span>
        <span className="src-actions">
          {!sample && <button type="button" className="btn-text" onClick={onRefresh}>Refresh</button>}
          <button type="button" className="btn-text" aria-pressed={sampleOn} onClick={onSample}>{sampleOn ? "Hide sample data" : "Preview with sample data"}</button>
        </span>
      </div>

      {empty ? (
        <section className="empty">
          <h2>No one has taken part yet</h2>
          <p>Once someone chooses a route on the live site, they appear here within a few seconds of each stage. Share the link, then press Refresh.</p>
          <p className="muted">Want to see how this will look with real answers? <button type="button" className="btn-text" onClick={onSample}>Preview with sample data</button></p>
        </section>
      ) : (
        <>
          <form className="toolbar" onSubmit={(e) => e.preventDefault()} aria-label="Filters">
            <div className="field"><label htmlFor="f-days">Period</label><select id="f-days" className="select" value={f.days} onChange={(e) => setF({ ...f, days: Number(e.target.value) })}><option value="0">All time</option><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></div>
            <div className="field"><label htmlFor="f-route">Route</label><select id="f-route" className="select" value={f.route} onChange={(e) => setF({ ...f, route: e.target.value })}><option value="">Both</option><option value="free">Imagine Freely</option><option value="configure">Configure</option></select></div>
            <div className="field"><label htmlFor="f-only">Status</label><select id="f-only" className="select" value={f.only} onChange={(e) => setF({ ...f, only: e.target.value })}><option value="">All</option><option value="done">Submitted</option><option value="open">Not finished</option></select></div>
            <div className="field grow"><label htmlFor="f-q">Find a participant</label><input id="f-q" className="input" type="search" placeholder="Code, e.g. LID-K3" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} /></div>
            <p className="count" role="status">{list.length} of {sessions.length}{filtered ? <> · <button type="button" className="btn-text" onClick={() => setF(FILTERS_OFF)}>Clear filters</button></> : null}</p>
          </form>

          <div role="tablist" aria-label="Sections" className="tabs" onKeyDown={key}>
            {TABS.map(([k, name]) => (
              <button key={k} ref={(el) => { tabRefs.current[k] = el; }} type="button" role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls="panel" tabIndex={tab === k ? 0 : -1} className="tab" onClick={() => setTab(k)}>
                {name}{counts[k] != null && <span className="n">{counts[k]}</span>}
              </button>
            ))}
          </div>

          <div role="tabpanel" id="panel" aria-labelledby={`tab-${tab}`} className="panel-body">
            {!list.length ? (
              <section className="empty"><h2>No one matches these filters</h2><p>Try a longer period or clear the filters.</p><button type="button" className="btn btn-soft" onClick={() => setF(FILTERS_OFF)}>Clear filters</button></section>
            ) : (
              <>
                {tab === "overview" && <Overview M={M} />}
                {tab === "dimensions" && <DimensionsPanel M={M} />}
                {tab === "activities" && <ActivitiesPanel M={M} />}
                {tab === "profiles" && <ProfilesPanel M={M} />}
                {tab === "writing" && <WritingPanel M={M} onOpen={setOpenCode} />}
                {tab === "people" && <PeoplePanel list={list} onOpen={setOpenCode} />}
                {tab === "download" && <DownloadPanel list={list} filterNote={filterNote} />}
              </>
            )}
          </div>
        </>
      )}
      <p className="hint foot-note">Stage counts use every participant who started; answer counts use those who reached that part. Each participant is an anonymous code. Choosing a route is never a score.</p>
      <ParticipantSheet key={openCode ?? "none"} session={sel} sample={sample} onClose={() => setOpenCode(null)} onDelete={onDelete} />
    </div>
  );
}
