// Everything the researcher dashboard counts. Pure functions of an array of sessions (as stored by api/sessions.js).
import { DIMENSIONS, CONTRIBUTOR_GROUPS, EDUCATOR_ROLES, NO_SINGLE_GROUP, NO_SINGLE_GROUP_LABEL } from "../config/dimensions.js";
import { ALLOCATION_CATEGORIES, TENSIONS, REFLECTION_PROMPTS } from "../config/activities.js";
import { SECTIONS } from "../profile/organise.js";

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const tally = (items) => { const m = new Map(); items.forEach((k) => m.set(k, (m.get(k) ?? 0) + 1)); return m; };
const rows = (m, labelOf) => [...m.entries()].map(([id, n]) => ({ id, label: labelOf(id), n })).sort((a, b) => b.n - a.n);

export const STAGE_ORDER = ["entry", "dimensions", "activities", "institution", "reflection", "done"];
export const STAGE_LABEL = { entry: "Chose a route", dimensions: "Dimensions or idea", activities: "Shared activities", institution: "Form and profile", reflection: "Reflection", done: "Submitted" };

const minutes = (s) => (s.completedAt ? Math.max(0, (Date.parse(s.completedAt) - Date.parse(s.createdAt)) / 60000) : null);
const latestVersion = (s) => s.profile?.versions?.[s.profile.versions.length - 1] ?? null;

export function overview(sessions) {
  const done = sessions.filter((s) => s.completedAt);
  const times = done.map(minutes).filter((m) => m != null);
  const free = sessions.filter((s) => s.route === "free").length;
  const approved = sessions.filter((s) => s.profile?.approvedVersionId).length;
  const edited = sessions.filter((s) => s.profile?.versions?.some((v) => Object.keys(v.edited ?? {}).length > 0)).length;
  const regens = sessions.map((s) => (s.profile?.versions ?? []).filter((v) => v.kind === "draft").length).filter((n) => n > 0);
  return {
    started: sessions.length, completed: done.length, completionRate: pct(done.length, sessions.length),
    medianMinutes: median(times), free, configure: sessions.length - free,
    withProfile: sessions.filter((s) => (s.profile?.versions?.length ?? 0) > 0).length, approved, edited, meanDrafts: mean(regens),
    devices: rows(tally(sessions.map((s) => s.device)), (d) => d),
  };
}

export function funnel(sessions) {
  const rank = (s) => STAGE_ORDER.indexOf(s.furthest);
  return STAGE_ORDER.map((st, i) => ({ id: st, label: STAGE_LABEL[st], n: sessions.filter((s) => rank(s) >= i).length }));
}

export function dimensions(sessions) {
  const cfg = sessions.filter((s) => s.route === "configure");
  return DIMENSIONS.map((dim) => {
    const ds = cfg.map((s) => s.dims?.[dim.id]);
    const st = (k) => ds.filter((d) => d?.status === k).length;
    const answered = st("answered"), skipped = st("skipped"), na = st("na");
    const unanswered = cfg.length - answered - skipped - na;
    const picks = [];
    ds.forEach((d) => { if (!d) return; [...(d.picks ?? [])].forEach((p) => picks.push(dim.choices?.find((c) => c.id === p)?.label ?? "Added by participant")); (d.custom ?? []).forEach(() => picks.push("Added by participant")); if (d.primary) picks.push(dim.choices?.find((c) => c.id === d.primary)?.label ?? "Added by participant"); });
    return { dim, base: cfg.length, answered, skipped, na, unanswered, top: rows(tally(picks), (l) => l) };
  });
}

export function educators(sessions) {
  const eds = sessions.map((s) => s.dims?.educators).filter(Boolean);
  const groups = [];
  eds.forEach((d) => { d.contributors.picks.forEach((p) => groups.push(CONTRIBUTOR_GROUPS.find((g) => g.id === p)?.label ?? "Added by participant")); d.contributors.custom.forEach(() => groups.push("Added by participant")); });
  const regular = eds.filter((d) => d.regular).map((d) => (d.regular === NO_SINGLE_GROUP ? NO_SINGLE_GROUP_LABEL : CONTRIBUTOR_GROUPS.find((g) => g.id === d.regular)?.label ?? "Added by participant"));
  const roles = EDUCATOR_ROLES.map((r) => {
    const vs = eds.filter((d) => Object.keys(d.roles.values ?? {}).length).map((d) => d.roles.values[r.id] ?? 0);
    return { id: r.id, label: r.label, mean: mean(vs), zero: vs.filter((v) => v === 0).length, n: vs.length };
  });
  return { n: eds.length, groups: rows(tally(groups), (l) => l), regular: rows(tally(regular), (l) => l), roles };
}

export function allocation(sessions) {
  const al = sessions.map((s) => s.activities?.allocation).filter((a) => a && Object.keys(a.values ?? {}).length);
  return {
    n: al.length,
    categories: ALLOCATION_CATEGORIES.map((c) => { const vs = al.map((a) => a.values[c.id] ?? 0); return { id: c.id, label: c.label, mean: mean(vs), zero: vs.filter((v) => v === 0).length, max: Math.max(0, ...vs) }; }),
    custom: al.flatMap((a) => a.custom.map((c) => c.text)).length,
  };
}

export function tensions(sessions) {
  const sel = sessions.flatMap((s) => s.activities?.tensions?.selected ?? []);
  const by = new Map();
  sel.forEach((t) => { const key = t.own ? `own:${t.a}/${t.b}` : t.id; const cur = by.get(key) ?? { id: key, a: t.a, b: t.b, own: t.own, n: 0, vals: [] }; cur.n++; if (t.useSlider && t.value != null) cur.vals.push(t.value); by.set(key, cur); });
  return { total: sel.length, items: [...by.values()].map((x) => ({ ...x, meanA: x.vals.length ? mean(x.vals) : null })).sort((a, b) => b.n - a.n), known: TENSIONS.length };
}

export function experience(sessions) {
  const ex = sessions.map((s) => s.experience).filter((e) => e && e.status !== "unanswered");
  return { n: ex.length, answered: ex.filter((e) => e.status === "answered").length, meanSteps: mean(ex.map((e) => e.steps.length)), withSteps: ex.filter((e) => e.steps.length).length };
}

export function writing(sessions) {
  const out = [];
  const add = (kind, s, text) => { if (text && text.trim()) out.push({ kind, code: s.code, route: s.route, text: text.trim(), at: s.createdAt }); };
  sessions.forEach((s) => {
    add("Imagine Freely description", s, s.free?.text);
    add("Purpose", s, s.activities?.purpose?.text);
    add("Signature practice", s, s.activities?.signature?.practice);
    add("How it begins", s, s.formation?.begins);
    REFLECTION_PROMPTS.forEach((p) => add(`Reflection: ${p.q}`, s, s.reflection?.[p.id]));
  });
  return out;
}

export function profiles(sessions) {
  const withV = sessions.filter((s) => (s.profile?.versions?.length ?? 0) > 0);
  const edits = SECTIONS.map((sec) => ({ id: sec.id, label: sec.title, n: withV.filter((s) => s.profile.versions.some((v) => v.edited?.[sec.id])).length }));
  return { n: withV.length, approved: withV.filter((s) => s.profile.approvedVersionId).length, edits, latest: withV.map(latestVersion).length };
}

export function inPeriod(sessions, days) {
  if (!days) return sessions;
  const cut = Date.now() - days * 86400000;
  return sessions.filter((s) => Date.parse(s.createdAt) >= cut);
}
export { pct, mean, minutes };

// Starts and submissions per day, oldest first, for the small chart on the overview.
export function daily(sessions, days = 14) {
  const out = []; const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const day = sessions.filter((s) => new Date(s.createdAt).toDateString() === d.toDateString());
    out.push({ label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), started: day.length, done: day.filter((s) => s.completedAt).length });
  }
  return out;
}

// Familiar practices: how often each was kept, changed, left behind, combined or added.
export function rethink(sessions) {
  const by = new Map();
  sessions.forEach((s) => {
    const r = s.activities?.rethink; if (!r) return;
    const add = (key, label, action) => { if (!action) return; const row = by.get(key) ?? { label, keep: 0, change: 0, leave: 0, combine: 0, add: 0 }; row[action]++; by.set(key, row); };
    Object.entries(r.items ?? {}).forEach(([id, v]) => add(id, id.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()), v.action));
    (r.custom ?? []).forEach((c) => add(`own:${c.text}`, `${c.text} (added)`, c.action));
  });
  return [...by.values()].sort((a, b) => (b.keep + b.change + b.leave + b.combine + b.add) - (a.keep + a.change + a.leave + a.combine + a.add));
}
