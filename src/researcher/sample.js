// Made-up sessions for previewing the dashboard. They are never stored or sent anywhere.
import { DIMENSIONS, CONTRIBUTOR_GROUPS, EDUCATOR_ROLES, NO_SINGLE_GROUP } from "../config/dimensions.js";
import { ALLOCATION_CATEGORIES, TENSIONS, PRACTICES } from "../config/activities.js";
import { newSession, newDimension } from "../state/model.js";
import { addDraft, approve, editSection } from "../profile/versions.js";

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (xs) => xs[Math.floor(rnd() * xs.length)];
const some = (xs, n) => [...xs].sort(() => rnd() - 0.5).slice(0, Math.max(1, Math.round(rnd() * n)));
const split100 = (ids) => { const w = ids.map(() => rnd() ** 2 + 0.05); const t = w.reduce((a, b) => a + b, 0); const v = w.map((x) => Math.round((x / t) * 100)); v[0] += 100 - v.reduce((a, b) => a + b, 0); if (v[0] < 0) v[0] = 0; return Object.fromEntries(ids.map((id, i) => [id, v[i]])); };

const FREE = ["A school with no walls where the town is the campus", "Learning organised around questions people bring from their own lives", "A cooperative where members teach each other and share the running of it"];
const STEPS = ["Meet a mentor", "Try a small project", "Share it with others", "Reflect together"];

export function sampleSessions(n = 36) {
  seed = 7;
  const out = [];
  for (let i = 0; i < n; i++) {
    const s = newSession();
    const age = Math.floor(rnd() * 14 * 86400000);
    s.createdAt = new Date(Date.now() - age).toISOString(); s.id = `s_sample${String(i).padStart(4, "0")}`; s.code = `LID-S${String(i).padStart(5, "0").slice(-5)}`.toUpperCase();
    s.route = rnd() < 0.45 ? "free" : "configure"; s.device = pick(["phone", "tablet", "desktop", "desktop"]);
    const reach = rnd();
    s.furthest = reach < 0.1 ? "dimensions" : reach < 0.2 ? "activities" : reach < 0.3 ? "institution" : reach < 0.38 ? "reflection" : "done";
    if (s.route === "free") { s.free.text = pick(FREE); s.experience = { ideas: [{ id: "p_a", text: "Growing food" }], does: "Plan, plant and share", takesPart: { picks: some(CONTRIBUTOR_GROUPS.map((g) => g.id), 2), custom: [] }, where: { picks: ["natural-outdoor"], custom: [] }, steps: some(STEPS, 4).map((t, k) => ({ id: `p_${k}`, text: t })), outcomes: "People understand where food comes from", status: "answered" }; }
    else {
      for (const dim of DIMENSIONS) {
        const d = newDimension();
        if (!dim.required && rnd() < 0.4) { d.status = rnd() < 0.7 ? "skipped" : "na"; s.dims[dim.id] = d; continue; }
        d.status = "answered";
        if (dim.kind === "choices" || dim.kind === "pathway") d.picks = some(dim.choices.map((c) => c.id), 3);
        if (dim.kind === "locations") { d.primary = pick(dim.choices).id; d.secondary = some(dim.choices.map((c) => c.id).filter((x) => x !== d.primary), 2); }
        if (dim.kind === "educators") { d.contributors.picks = some(CONTRIBUTOR_GROUPS.map((g) => g.id), 4); d.regular = rnd() < 0.2 ? NO_SINGLE_GROUP : d.contributors.picks[0]; d.roles.values = split100(EDUCATOR_ROLES.map((r) => r.id)); }
        s.dims[dim.id] = d;
      }
      s.experience = { ideas: [], does: "Learners make something with a mentor", takesPart: { picks: [], custom: [] }, where: { picks: [], custom: [] }, steps: [], outcomes: "", status: "unanswered" };
      s.dims.pedagogy = { ...newDimension(), status: "answered" };
    }
    if (["activities", "institution", "reflection", "done"].includes(s.furthest)) {
      const ids = ALLOCATION_CATEGORIES.map((c) => c.id); s.activities.allocation = { values: split100(ids), custom: [], status: "answered" };
      if (rnd() < 0.5) { const t = pick(TENSIONS); s.activities.tensions = { selected: [{ id: t.id, a: t.a, b: t.b, own: false, useSlider: true, value: Math.round(rnd() * 100), note: "" }], status: "answered" }; }
      if (rnd() < 0.5) s.activities.purpose = { text: "A place where people can change what they believe is possible", status: "answered" };
      s.activities.signature = rnd() < 0.3 ? { practice: "Every learner spends a season working beside someone in a trade", effect: "Learning is tied to real work", difficulty: "Hard to arrange for everyone", status: "answered" } : { ...s.activities.signature, status: rnd() < 0.35 ? "skipped" : "unanswered" };
      if (!s.activities.purpose.text && rnd() < 0.35) s.activities.purpose.status = "skipped";
      if (rnd() < 0.4) s.activities.rethink = { items: { [pick(PRACTICES).id]: { action: pick(["keep", "change", "leave"]) } }, custom: [], status: "answered" };
    }
    if (["institution", "reflection", "done"].includes(s.furthest)) {
      s.formation.begins = "A group of people who wanted somewhere to learn together";
      addDraft(s); if (rnd() < 0.35) editSection(s, "purpose", "My own wording of the purpose."); if (s.furthest !== "institution" && rnd() < 0.9) approve(s);
    }
    if (s.furthest === "done") { s.completedAt = new Date(Date.parse(s.createdAt) + (6 + rnd() * 24) * 60000).toISOString(); s.reflection.interesting = rnd() < 0.7 ? "The weighting of roles made me think about who really teaches." : ""; if (rnd() < 0.4) s.reflection.difficult = "People might disagree about what counts as learning."; }
    s.updatedAt = s.completedAt ?? s.createdAt;
    out.push(s);
  }
  return out;
}
