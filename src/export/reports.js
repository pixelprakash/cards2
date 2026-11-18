// What the researcher can take away: a summary report (Word, PDF) and a workbook (Excel), and one participant's own report.
// Everything is built from the same metrics and flattened responses the dashboard shows, so the numbers always agree.
import { EDUCATOR_ROLES } from "../config/dimensions.js";
import { ALLOCATION_CATEGORIES } from "../config/activities.js";
import { SECTIONS, EMPTY_SECTION } from "../profile/organise.js";
import { COLUMNS, flatten } from "./flatten.js";
import { answer, itemLabel, sectionLabel } from "./labels.js";
import { STAGE_LABEL, allocation, dimensions, educators, funnel, overview, pct, profiles, tensions, writing } from "../researcher/metrics.js";
import { summaryRows } from "../researcher/exports.js";

const r1 = (n) => (Number.isInteger(n) ? String(n) : (Math.round(n * 10) / 10).toFixed(1));
const date = (iso) => (iso ? new Date(iso).toLocaleString() : "");
const stamp = () => new Date().toISOString().slice(0, 10);
export const fileStamp = stamp;
export { sectionLabel };

// ---------- one participant
export function participantReport(s, { own = false } = {}) {
  const versions = s.profile?.versions ?? [];
  const approved = versions.find((v) => v.id === s.profile?.approvedVersionId) ?? versions[versions.length - 1];
  if (own) return ownReport(s, approved);
  const blocks = [
    { type: "title", text: `Participant ${s.code}` },
    { type: "note", text: `Learning Institutions by Design · exported ${date(new Date().toISOString())}` },
    { type: "table", widths: [2, 5], rows: [["Detail", "Value"],
      ["Route", s.route === "free" ? "Imagine Freely" : "Configure Your Institution"],
      ["Device", s.device], ["Started", date(s.createdAt)], ["Submitted", s.completedAt ? date(s.completedAt) : "Not submitted"],
      ["Furthest stage", STAGE_LABEL[s.furthest] ?? s.furthest], ["Profile versions", String(versions.length)],
      ["Profile approved", s.profile?.approvedVersionId ? "Yes" : "No"]] },
  ];
  if (approved) {
    blocks.push({ type: "h1", text: approved.kind === "approved" ? "Approved profile" : "Latest profile draft" });
    SECTIONS.forEach((sec) => {
      blocks.push({ type: "h2", text: sec.title });
      blocks.push({ type: "p", text: approved.sections?.[sec.id] || EMPTY_SECTION });
    });
  }
  blocks.push({ type: "h1", text: "Every answer" });
  blocks.push({ type: "note", text: "Provenance shows where each piece came from: researcher-provided options, participant-selected, participant-generated (their own words), participant-modified, system-organised, participant-approved." });
  const rows = flatten(s).filter((r) => r.section !== "profile" && !(r.item === "status" && r.value === "unanswered" && r.section.startsWith("dimension") && s.route !== "configure"));
  blocks.push({ type: "table", widths: [3, 2, 5, 2, 3], rows: [["Part", "Item", "Answer", "Status", "Provenance"], ...rows.map((r) => [sectionLabel(r.section), itemLabel(r.item), answer(r), r.status, r.provenance])] });
  return blocks;
}

// What a participant takes home: their institution and their own answers, in plain words.
function ownReport(s, profile) {
  const blocks = [
    { type: "title", text: "My institution" },
    { type: "note", text: `Learning Institutions by Design · participant code ${s.code} · ${date(s.completedAt ?? new Date().toISOString())}` },
  ];
  if (profile) SECTIONS.forEach((sec) => { blocks.push({ type: "h1", text: sec.title }); blocks.push({ type: "p", text: profile.sections?.[sec.id] || EMPTY_SECTION }); });
  blocks.push({ type: "h1", text: "My answers" });
  blocks.push({ type: "note", text: "Everything you chose or wrote, in the order you went through it." });
  const rows = flatten(s).filter((r) => r.section !== "profile" && r.item !== "status" && answer(r) !== "" && answer(r) != null);
  blocks.push({ type: "table", widths: [3, 3, 6], rows: [["Part", "Item", "My answer"], ...rows.map((r) => [sectionLabel(r.section), itemLabel(r.item), answer(r)])] });
  return blocks;
}

// ---------- the summary report
export function summaryReport(sessions, filterNote = "") {
  const o = overview(sessions); const fun = funnel(sessions); const dims = dimensions(sessions); const ed = educators(sessions);
  const al = allocation(sessions); const te = tensions(sessions); const pr = profiles(sessions); const wr = writing(sessions);
  const blocks = [
    { type: "title", text: "Learning Institutions by Design" },
    { type: "note", text: `Research summary · ${date(new Date().toISOString())}${filterNote ? ` · ${filterNote}` : ""}` },
    { type: "h1", text: "Overview" },
    { type: "table", widths: [5, 3], rows: [["Measure", "Value"],
      ["Participants who started", String(o.started)], ["Submitted", `${o.completed} (${o.completionRate}%)`],
      ["Median time to submit", o.completed ? `${r1(o.medianMinutes)} minutes` : "–"],
      ["Imagine Freely", `${o.free} (${pct(o.free, o.started)}%)`], ["Configure Your Institution", `${o.configure} (${pct(o.configure, o.started)}%)`],
      ["Saw a profile", String(o.withProfile)], ["Approved their profile", `${o.approved} (${pct(o.approved, o.withProfile)}%)`], ["Edited their profile", `${o.edited} (${pct(o.edited, o.withProfile)}%)`],
      ["Devices", o.devices.map((d) => `${d.label} ${d.n}`).join(", ") || "–"]] },
    { type: "note", text: "Choosing a route is not a score. Stage counts use everyone who started; answer counts use those who reached that part." },
    { type: "h1", text: "Where people got to" },
    { type: "table", widths: [5, 2, 2], rows: [["Stage", "Reached", "Of those who started"], ...fun.map((f) => [f.label, String(f.n), `${pct(f.n, fun[0].n)}%`])] },
    { type: "h1", text: "Dimensions (Configure route)" },
    { type: "table", widths: [4, 1.2, 1.2, 1.2, 1.4, 5], rows: [["Dimension", "Answered", "Skipped", "Not applicable", "Unanswered", "Most common choices"],
      ...dims.map((d) => [`${d.dim.n}. ${d.dim.title}${d.dim.required ? " (required)" : ""}`, String(d.answered), String(d.skipped), String(d.na), String(d.unanswered), d.top.slice(0, 3).map((t) => `${t.label} (${t.n})`).join("; ")])] },
    { type: "h1", text: "Educators and their roles" },
    { type: "table", widths: [6, 2], rows: [["Who contributes", "Participants"], ...(ed.groups.length ? ed.groups.map((g) => [g.label, String(g.n)]) : [["No answers yet", ""]])] },
    { type: "table", widths: [6, 2], rows: [["Most regularly involved", "Participants"], ...(ed.regular.length ? ed.regular.map((g) => [g.label, String(g.n)]) : [["No answers yet", ""]])] },
    { type: "table", widths: [5, 2, 2], rows: [["Role", "Average points (of 100)", "Gave zero"], ...ed.roles.map((r) => [r.label, r1(r.mean), String(r.zero)])] },
    { type: "h1", text: "Resource allocation" },
    { type: "note", text: `${al.n} participants. Points show relative priority, not budget shares.` },
    { type: "table", widths: [5, 2, 2, 2], rows: [["Priority", "Average points", "Gave zero", "Highest"], ...al.categories.map((c) => [c.label, r1(c.mean), String(c.zero), String(c.max)])] },
    { type: "h1", text: "Institutional tensions" },
    { type: "table", widths: [5, 2, 3], rows: [["Tension", "Chosen", "Average split (first side)"], ...(te.items.length ? te.items.map((t) => [`${t.a} / ${t.b}${t.own ? " (added)" : ""}`, String(t.n), t.meanA != null ? `${t.a} ${Math.round(t.meanA)}` : "no slider used"]) : [["None chosen yet", "", ""]])] },
    { type: "h1", text: "Profiles" },
    { type: "table", widths: [5, 2], rows: [["Section edited by participants", "Participants"], ...pr.edits.map((e) => [e.label, `${e.n} of ${pr.n}`])] },
    { type: "h1", text: "In their own words" },
    { type: "note", text: "Verbatim. Written answers can contain personal details; handle this document as research data." },
  ];
  if (!wr.length) blocks.push({ type: "p", text: "Nothing written yet." });
  let last = "";
  wr.forEach((w) => { if (w.kind !== last) { blocks.push({ type: "h2", text: w.kind }); last = w.kind; } blocks.push({ type: "quote", text: `${w.text}\n— ${w.code}` }); });
  return blocks;
}

// ---------- Excel workbook
export function workbookSheets(sessions, filterNote = "") {
  const o = overview(sessions); const dims = dimensions(sessions); const wr = writing(sessions);
  const resp = sessions.flatMap(flatten);
  const bySession = (fn) => sessions.flatMap((s) => fn(s) ?? []);
  return [
    { name: "Read me", widths: [30, 90], rows: [
      ["Learning Institutions by Design", "Research export"],
      ["Exported", date(new Date().toISOString())], ["Filter", filterNote || "All participants"], ["Participants", sessions.length], ["Submitted", o.completed],
      ["", ""],
      ["Sheet", "What is in it"],
      ["Participants", "One row per participant: route, timings, status of every dimension, points per priority and per role, tensions."],
      ["Responses", "Every answer as one row, with a provenance and a status. This is the sheet to filter and pivot."],
      ["Allocation", "Resource allocation points per participant (each row totals 100)."],
      ["Educator roles", "Role points per participant (each row totals 100)."],
      ["Tensions", "Each chosen tension with the split between its two sides."],
      ["Writing", "Everything participants wrote in their own words."],
      ["Dimension summary", "Answered, skipped, not applicable and unanswered counts per dimension."],
      ["", ""],
      ["Status values", "answered · skipped · na (not applicable) · unanswered · zero (a points value of 0, which is a real answer)"],
      ["Provenance values", "researcher-provided · participant-selected · participant-generated · participant-modified · system-organised · participant-approved"],
    ] },
    { name: "Participants", rows: summaryRows(sessions), widths: [14, 12, 10, 22, 22, 9, 14, 9, 9, 9] },
    { name: "Responses", rows: [COLUMNS, ...resp.map((r) => COLUMNS.map((c) => r[c]))], widths: [14, 14, 12, 24, 24, 24, 30, 50, 11, 22] },
    { name: "Allocation", rows: [["participant", "route", ...ALLOCATION_CATEGORIES.map((c) => c.label), "total"], ...sessions.filter((s) => Object.keys(s.activities?.allocation?.values ?? {}).length).map((s) => { const v = s.activities.allocation.values; return [s.code, s.route, ...ALLOCATION_CATEGORIES.map((c) => v[c.id] ?? ""), Object.values(v).reduce((a, b) => a + b, 0)]; })], widths: [14, 12, ...ALLOCATION_CATEGORIES.map(() => 16), 8] },
    { name: "Educator roles", rows: [["participant", ...EDUCATOR_ROLES.map((r) => r.label), "total"], ...sessions.filter((s) => Object.keys(s.dims?.educators?.roles?.values ?? {}).length).map((s) => { const v = s.dims.educators.roles.values; return [s.code, ...EDUCATOR_ROLES.map((r) => v[r.id] ?? ""), Object.values(v).reduce((a, b) => a + b, 0)]; })], widths: [14, ...EDUCATOR_ROLES.map(() => 16), 8] },
    { name: "Tensions", rows: [["participant", "side A", "side B", "points A", "points B", "added by participant", "explanation"], ...bySession((s) => (s.activities?.tensions?.selected ?? []).map((t) => [s.code, t.a, t.b, t.useSlider && t.value != null ? t.value : "", t.useSlider && t.value != null ? 100 - t.value : "", t.own ? "yes" : "no", t.note]))], widths: [14, 22, 22, 9, 9, 12, 50] },
    { name: "Writing", rows: [["what", "participant", "route", "text"], ...wr.map((w) => [w.kind, w.code, w.route === "free" ? "Imagine Freely" : "Configure", w.text])], widths: [34, 14, 16, 100] },
    { name: "Dimension summary", rows: [["dimension", "required", "answered", "skipped", "not applicable", "unanswered", "most common choices"], ...dims.map((d) => [`${d.dim.n}. ${d.dim.title}`, d.dim.required ? "yes" : "no", d.answered, d.skipped, d.na, d.unanswered, d.top.slice(0, 5).map((t) => `${t.label} (${t.n})`).join("; ")])], widths: [44, 9, 10, 9, 14, 11, 80] },
  ];
}

// ---------- HTML for printing to PDF (the browser's own print dialog, so every script and font works)
const h = (s) => String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]).replace(/\n/g, "<br>");
export function reportHtml(blocks, title) {
  const body = blocks.map((b) => {
    if (b.type === "title") return `<h1 class="t">${h(b.text)}</h1>`;
    if (b.type === "h1") return `<h2>${h(b.text)}</h2>`;
    if (b.type === "h2") return `<h3>${h(b.text)}</h3>`;
    if (b.type === "note") return `<p class="n">${h(b.text)}</p>`;
    if (b.type === "quote") return `<blockquote>${h(b.text)}</blockquote>`;
    if (b.type === "table") { const [head, ...rows] = b.rows; return `<table><thead><tr>${head.map((c) => `<th>${h(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${h(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`; }
    if (b.type === "pagebreak") return '<div class="pb"></div>';
    return `<p>${h(b.text)}</p>`;
  }).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${h(title)}</title><style>
@page { size: A4; margin: 16mm 14mm; }
* { box-sizing: border-box; }
body { font: 10.5pt/1.5 "Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", "Nirmala UI", Arial, sans-serif; color: #201e1f; margin: 0; }
h1.t { font-size: 24pt; margin: 0 0 4pt; letter-spacing: -0.02em; } h2 { font-size: 15pt; margin: 20pt 0 6pt; break-after: avoid; } h3 { font-size: 11.5pt; margin: 14pt 0 4pt; break-after: avoid; }
p { margin: 0 0 6pt; } p.n { color: #5b5754; font-style: italic; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt; font-size: 9pt; }
th, td { border: 0.5pt solid #bdb8b2; padding: 3pt 5pt; text-align: left; vertical-align: top; } th { background: #f4efe8; } tr { break-inside: avoid; } thead { display: table-header-group; }
blockquote { margin: 0 0 6pt; padding: 2pt 0 2pt 8pt; border-left: 3pt solid #ffabc8; font-style: italic; break-inside: avoid; }
.pb { break-after: page; }
</style></head><body>${body}</body></html>`;
}
