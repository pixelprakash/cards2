// A session as a long list of responses, one row each, with content provenance and distinct statuses.
// Used for the researcher's structured export and for the participant's own download.
//
// provenance: researcher-provided | participant-selected | participant-generated | participant-modified | system-organised | participant-approved
// ("system-organised" is the brief's "AI-organised": the profile is written by a rule-based organiser, not an AI model, so it is not called AI.)
// status: answered | skipped | na | unanswered | zero (a points value of 0 that the participant left or set)
import { DIMENSIONS, CONTRIBUTOR_GROUPS, EDUCATOR_ROLES, NO_SINGLE_GROUP, NO_SINGLE_GROUP_LABEL, EXPERIENCE_PROMPTS } from "../config/dimensions.js";
import { ALLOCATION_CATEGORIES, PRACTICES, PRACTICE_ACTIONS, SIGNATURE_FIELDS, TENSIONS, REFLECTION_PROMPTS, FORMATION_PROMPTS } from "../config/activities.js";
import { SECTIONS } from "../profile/organise.js";
import { experienceStatus } from "../flow/validate.js";

const text = (v) => (typeof v === "string" ? v.trim() : "");

export function flatten(s) {
  const rows = [];
  const base = { participant: s.code, session: s.id, route: s.route ?? "" };
  const push = (section, item, p) => rows.push({ ...base, section, item, option_id: "", option_label: "", value: "", status: "answered", provenance: "", timestamp: "", detail: "", ...p });

  push("entry", "route", { value: s.route ?? "", provenance: "participant-selected" });
  // Session facts the brief asks for: timestamps (started, last saved, submitted) and where the participant got to.
  push("session", "started", { value: s.createdAt ?? "", timestamp: s.createdAt ?? "" });
  push("session", "last_saved", { value: s.updatedAt ?? "", timestamp: s.updatedAt ?? "" });
  push("session", "submitted", { value: s.completedAt ?? "", status: s.completedAt ? "answered" : "unanswered", timestamp: s.completedAt ?? "" });
  push("session", "furthest_stage", { value: s.furthest ?? "" });
  push("session", "device", { value: s.device ?? "" });
  if (s.route === "free" || text(s.free?.text)) push("free", "description", { value: text(s.free?.text), status: text(s.free?.text) ? "answered" : "unanswered", provenance: "participant-generated" });

  const optionRows = (section, item, ids, choices, custom, provenance = "participant-selected") => {
    ids.forEach((id) => {
      const c = choices.find((x) => x.id === id);
      if (c) push(section, item, { option_id: id, option_label: c.label, provenance });
      else { const cu = custom.find((x) => x.id === id); if (cu) push(section, item, { option_id: id, option_label: cu.text, provenance: "participant-generated" }); }
    });
  };

  for (const dim of DIMENSIONS) {
    const d = s.dims?.[dim.id];
    const sec = `dimension:${dim.id}`;
    if (!d) { if (s.route === "configure") push(sec, "status", { status: "unanswered", provenance: "researcher-provided" }); continue; }
    push(sec, "status", { value: d.status, status: d.status, provenance: "participant-selected" });
    if (dim.kind === "choices" || dim.kind === "pathway") {
      optionRows(sec, "choice", d.picks, dim.choices ?? [], d.custom ?? []);
      (d.custom ?? []).forEach((c) => { if (!d.picks.includes(c.id)) push(sec, "choice", { option_id: c.id, option_label: c.text, provenance: "participant-generated" }); });
      if (d.most) push(sec, "most_important", { option_id: d.most, option_label: (dim.choices ?? []).find((c) => c.id === d.most)?.label ?? (d.custom ?? []).find((c) => c.id === d.most)?.text ?? "", provenance: "participant-selected" });
      if (text(d.note)) push(sec, "note", { value: text(d.note), provenance: "participant-generated" });
      (d.stages ?? []).forEach((st, i) => text(st.text) && push(sec, `stage_${i + 1}`, { value: text(st.text), provenance: "participant-generated" }));
    }
    if (dim.kind === "locations") {
      const all = dim.choices;
      if (d.primary) push(sec, "primary", { option_id: d.primary, option_label: all.find((c) => c.id === d.primary)?.label ?? d.custom.find((c) => c.id === d.primary)?.text ?? "", provenance: all.some((c) => c.id === d.primary) ? "participant-selected" : "participant-generated" });
      d.secondary.forEach((id) => push(sec, "secondary", { option_id: id, option_label: all.find((c) => c.id === id)?.label ?? d.custom.find((c) => c.id === id)?.text ?? "", provenance: all.some((c) => c.id === id) ? "participant-selected" : "participant-generated" }));
    }
    if (dim.kind === "educators") {
      optionRows(sec, "contributor", d.contributors.picks, CONTRIBUTOR_GROUPS, d.contributors.custom);
      d.contributors.custom.forEach((c) => push(sec, "contributor", { option_id: c.id, option_label: c.text, provenance: "participant-generated" }));
      if (d.regular) push(sec, "most_regular", { option_id: d.regular, option_label: d.regular === NO_SINGLE_GROUP ? NO_SINGLE_GROUP_LABEL : CONTRIBUTOR_GROUPS.find((g) => g.id === d.regular)?.label ?? d.contributors.custom.find((c) => c.id === d.regular)?.text ?? "", provenance: "participant-selected" });
      [...EDUCATOR_ROLES.map((r) => ({ id: r.id, label: r.label, own: false })), ...d.roles.custom.map((r) => ({ id: r.id, label: r.text, own: true }))].forEach((r) => {
        const v = d.roles.values[r.id];
        push(sec, "role_points", { option_id: r.id, option_label: r.label, value: v ?? "", status: v === undefined ? "unanswered" : v === 0 ? "zero" : "answered", provenance: r.own ? "participant-generated" : "participant-selected" });
      });
    }
  }
  s.customDims?.forEach((c) => push("custom_dimension", c.title, { option_id: c.id, value: c.text, provenance: "participant-generated" }));

  // Learning experience (Route A, or dimension 11)
  const e = s.experience;
  if (e) {
    const xs = experienceStatus(s);
    push("experience", "status", { value: xs, status: xs, provenance: "participant-selected" });
    e.ideas.forEach((i, n) => text(i.text) && push("experience", `${EXPERIENCE_PROMPTS.explore.q} #${n + 1}`, { value: text(i.text), provenance: "participant-generated" }));
    if (text(e.does)) push("experience", EXPERIENCE_PROMPTS.does.q, { value: text(e.does), provenance: "participant-generated" });
    // Linked choices can come from the standard lists, from what was added in this activity, or from what the participant
    // added on Locations / Educators (Route B), so look in all of them.
    const eduCustom = s.dims?.educators?.contributors?.custom ?? [];
    const locCustom = s.dims?.locations?.custom ?? [];
    const link = (prompt, id, standard, own) => {
      const std = standard.find((g) => g.id === id);
      const cu = [...own, ...(standard === CONTRIBUTOR_GROUPS ? eduCustom : locCustom)].find((c) => c.id === id);
      push("experience", prompt, { option_id: id, option_label: std?.label ?? cu?.text ?? "", provenance: std ? "participant-selected" : "participant-generated" });
    };
    e.takesPart.picks.forEach((id) => link(EXPERIENCE_PROMPTS.takesPart.q, id, CONTRIBUTOR_GROUPS, e.takesPart.custom));
    e.where.picks.forEach((id) => link(EXPERIENCE_PROMPTS.where.q, id, DIMENSIONS.find((d) => d.id === "locations").choices, e.where.custom));
    e.steps.forEach((st, i) => text(st.text) && push("experience", `step_${i + 1}`, { value: text(st.text), provenance: "participant-generated" }));
    if (text(e.outcomes)) push("experience", EXPERIENCE_PROMPTS.outcomes.q, { value: text(e.outcomes), provenance: "participant-generated" });
  }

  // Shared activities
  const a = s.activities;
  if (a) {
    push("activity:allocation", "status", { value: a.allocation.status, status: a.allocation.status, provenance: "participant-selected" });
    [...ALLOCATION_CATEGORIES.map((c) => ({ id: c.id, label: c.label, own: false })), ...a.allocation.custom.map((c) => ({ id: c.id, label: c.text, own: true }))].forEach((c) => {
      const v = a.allocation.values[c.id];
      push("activity:allocation", "points", { option_id: c.id, option_label: c.label, value: v ?? "", status: v === undefined ? "unanswered" : v === 0 ? "zero" : "answered", provenance: c.own ? "participant-generated" : "participant-selected" });
    });
    push("activity:rethink", "status", { value: a.rethink.status, status: a.rethink.status, provenance: "participant-selected" });
    PRACTICES.forEach((p) => { const act = a.rethink.items[p.id]?.action; if (act) push("activity:rethink", "practice", { option_id: p.id, option_label: p.label, value: PRACTICE_ACTIONS.find((x) => x.id === act)?.label ?? act, provenance: "participant-selected" }); });
    a.rethink.custom.forEach((c) => c.action && push("activity:rethink", "practice", { option_id: c.id, option_label: c.text, value: PRACTICE_ACTIONS.find((x) => x.id === c.action)?.label ?? c.action, provenance: "participant-generated" }));
    push("activity:signature", "status", { value: a.signature.status, status: a.signature.status, provenance: "participant-selected" });
    SIGNATURE_FIELDS.forEach((f) => text(a.signature[f.id]) && push("activity:signature", f.id, { value: text(a.signature[f.id]), provenance: "participant-generated" }));
    push("activity:tensions", "status", { value: a.tensions.status, status: a.tensions.status, provenance: "participant-selected" });
    a.tensions.selected.forEach((t) => {
      const known = TENSIONS.find((x) => x.id === t.id);
      push("activity:tensions", "tension", { option_id: t.id, option_label: `${t.a} / ${t.b}`, value: t.useSlider && t.value != null ? `${t.value}/${100 - t.value}` : "", provenance: known ? "participant-selected" : "participant-generated" });
      if (text(t.note)) push("activity:tensions", "tension_note", { option_id: t.id, value: text(t.note), provenance: "participant-generated" });
    });
    push("activity:purpose", "status", { value: a.purpose.status, status: a.purpose.status, provenance: "participant-selected" });
    if (text(a.purpose.text)) push("activity:purpose", "purpose", { value: text(a.purpose.text), provenance: "participant-generated" });
  }

  // Formation
  const f = s.formation;
  if (f) {
    [["begins", FORMATION_PROMPTS[0].q, f.begins, f.beginsUnsure], ["tried", FORMATION_PROMPTS[1].q, f.tried, f.triedUnsure]].forEach(([id, q, v, unsure]) => {
      if (text(v)) push("formation", id, { option_label: q, value: text(v), provenance: "participant-generated" });
      else if (unsure) push("formation", id, { option_label: q, status: "na", value: "not sure yet", provenance: "participant-selected" });
    });
    f.episodes.forEach((x, i) => text(x.text) && push("formation", `episode_${i + 1}`, { value: text(x.text), provenance: "participant-generated" }));
  }

  // Profile versions: participant input is the session itself; then the organised draft, the participant's edits and the
  // approved final, each linked to the version it came from. One row per version says how it was made and when.
  const versions = s.profile?.versions ?? [];
  versions.forEach((v, n) => {
    const prov = v.kind === "approved" ? "participant-approved" : v.kind === "edited" ? "participant-modified" : "system-organised";
    push("profile_version", `v${n + 1}`, { option_id: v.id, option_label: v.kind, value: v.id === s.profile?.approvedVersionId ? "approved final" : "", detail: `method=${v.method ?? "unknown"}; parent=${v.parentId ?? "none"}`, timestamp: v.at ?? "", provenance: prov });
    SECTIONS.forEach((sec) => push("profile", `v${n + 1}:${v.kind}:${sec.id}`, { option_id: v.id, value: v.sections?.[sec.id] ?? "", timestamp: v.at ?? "", provenance: v.kind === "approved" ? "participant-approved" : v.edited?.[sec.id] ? "participant-modified" : "system-organised" }));
  });

  // Reflection
  REFLECTION_PROMPTS.forEach((p) => {
    const v = text(s.reflection?.[p.id]);
    push("reflection", p.id, { option_label: p.q, value: v, status: v ? "answered" : s.completedAt ? "skipped" : "unanswered", provenance: "participant-generated", timestamp: v ? (s.completedAt ?? "") : "" });
  });
  return rows;
}

export const COLUMNS = ["participant", "session", "route", "section", "item", "option_id", "option_label", "value", "status", "provenance", "timestamp", "detail"];

// A cell that starts with = + - @ (or a tab or return) is run as a formula when a CSV is opened in Excel or Sheets, and
// participants can type anything. A leading apostrophe makes it plain text. Plain numbers are left alone.
export const safeCell = (v) => { const t = String(v ?? "").replace(/\r?\n/g, " "); return /^[=+\-@\t\r]/.test(t) && !/^-?\d+(\.\d+)?$/.test(t) ? `'${t}` : t; };
const quote = (v) => { const t = safeCell(v); return /[",]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
export const toCsv = (rows) => [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => quote(r[c])).join(","))].join("\n");
