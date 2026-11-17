// Turns what the participant supplied into a written profile. It only rearranges and connects their own answers:
// it adds no ideas, advice, missing features or effects, and it describes tensions without resolving them.
// (This is the rule-based organiser. A language model can be put in its place later behind the same function, with the same rule.)
import { DIMENSION, CONTRIBUTOR_GROUPS, EDUCATOR_ROLES, NO_SINGLE_GROUP } from "../config/dimensions.js";
import { PRACTICES, PRACTICE_ACTIONS } from "../config/activities.js";
import { dimOf, hasText } from "../state/model.js";
import { categoriesFor } from "../flow/validate.js";

export const SECTIONS = [
  { id: "purpose", title: "Purpose", tone: "pink" },
  { id: "learning", title: "Learning and knowledge", tone: "blue" },
  { id: "people", title: "People and roles", tone: "purple" },
  { id: "place", title: "Place and resources", tone: "sand" },
  { id: "change", title: "How it begins and changes", tone: "orange" },
];

export const EMPTY_SECTION = "You did not add anything for this part.";

// "a, b and c". If an item already contains "and", semicolons keep the list readable.
const list = (items) => {
  if (items.length <= 1) return items.join("");
  if (items.some((i) => /\band\b/i.test(i))) return `${items.slice(0, -1).join("; ")}; and ${items[items.length - 1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};
const lower = (s) => (s ? s[0].toLowerCase() + s.slice(1) : s);
const sentence = (s) => { const t = s.trim(); return /[.!?]$/.test(t) ? t : `${t}.`; };
const labelsOf = (dim, d) => [
  ...dim.choices.filter((c) => d.picks.includes(c.id)).map((c) => lower(c.label)),
  ...d.custom.map((c) => c.text.trim()),
];

function purpose(s) {
  const out = [];
  if (hasText(s.free.text)) out.push(`In your own words: ${sentence(s.free.text)}`);
  const p = s.activities.purpose;
  if (hasText(p.text)) out.push(`What it should make possible that existing institutions do not: ${sentence(p.text)}`);
  const g = s.activities.signature;
  if (hasText(g.practice)) out.push(`A practice that sets it apart: ${sentence(g.practice)}`);
  if (hasText(g.effect)) out.push(`This practice is meant to ${sentence(lower(g.effect).replace(/^to /, ""))}`);
  if (hasText(g.difficulty)) out.push(`A difficulty or side effect you named: ${sentence(g.difficulty)}`);
  return out;
}

function learning(s) {
  const out = [];
  const add = (id, topic) => { const dim = DIMENSION[id]; const l = labelsOf(dim, dimOf(s, id)); if (l.length) out.push(`On ${topic}, you chose ${sentence(list(l))}`); };
  add("knowledge", "how areas of knowledge come together");
  add("process", "how learning is organised");
  const note = dimOf(s, "process").note; if (hasText(note)) out.push(`On how these forms work together: ${sentence(note)}`);
  const e = s.experience;
  const bits = [];
  const ideas = e.ideas.map((i) => i.text.trim()).filter(Boolean);
  if (ideas.length) bits.push(`People explore, practise or create: ${list(ideas)}.`);
  if (hasText(e.does)) bits.push(`Learners ${sentence(lower(e.does).replace(/^learners\s+/, ""))}`);
  const who = [...CONTRIBUTOR_GROUPS.filter((g) => e.takesPart.picks.includes(g.id)).map((g) => lower(g.label)), ...e.takesPart.custom.filter((c) => e.takesPart.picks.includes(c.id)).map((c) => c.text.trim())];
  if (who.length) bits.push(`Taking part: ${sentence(list(who))}`);
  const where = [...DIMENSION.locations.choices.filter((c) => e.where.picks.includes(c.id)).map((c) => lower(c.label)), ...e.where.custom.filter((c) => e.where.picks.includes(c.id)).map((c) => c.text.trim()), ...dimOf(s, "locations").custom.filter((c) => e.where.picks.includes(c.id)).map((c) => c.text.trim())];
  if (where.length) bits.push(`It happens in ${sentence(list(where))}`);
  const steps = e.steps.map((x) => x.text.trim()).filter(Boolean);
  if (steps.length) bits.push(`It unfolds in ${steps.length === 1 ? "one step" : `${steps.length} steps`}: ${steps.map((t, i) => `${i + 1}) ${t.replace(/[.]+$/, "")}`).join("; ")}.`);
  if (hasText(e.outcomes)) bits.push(`People might make, understand or change: ${sentence(e.outcomes)}`);
  if (bits.length) out.push(`One learning experience you described. ${bits.join(" ")}`);
  const ev = dimOf(s, "evaluation");
  const evl = labelsOf(DIMENSION.evaluation, ev);
  if (evl.length) {
    const most = ev.most ? [...DIMENSION.evaluation.choices.filter((c) => c.id === ev.most).map((c) => lower(c.label)), ...ev.custom.filter((c) => c.id === ev.most).map((c) => c.text.trim())][0] : null;
    out.push(`On how people would know learning has taken place, you chose ${list(evl)}.${most ? ` You marked ${most} as the one that matters most.` : ""}`);
  }
  add("credentials", "how people receive recognition");
  add("work", "how learning relates to work and everyday life");
  const tech = labelsOf(DIMENSION.technology, dimOf(s, "technology")); if (tech.length) { out.push(`On the role of technology and AI, you chose ${sentence(list(tech))}`); const n = dimOf(s, "technology").note; if (hasText(n)) out.push(`Where: ${sentence(n)}`); }
  const pw = dimOf(s, "pathways"); const pl = labelsOf(DIMENSION.pathways, pw);
  if (pl.length) out.push(`On how people enter, progress, pause and return, you chose ${sentence(list(pl))}`);
  const stages = pw.stages.map((x) => x.text.trim()).filter(Boolean);
  if (stages.length) out.push(`A pathway you sketched: ${stages.map((t, i) => `${i + 1}) ${t.replace(/[.]+$/, "")}`).join("; ")}.`);
  return out;
}

function people(s) {
  const out = [];
  const gov = dimOf(s, "governance"); const g = labelsOf(DIMENSION.governance, gov);
  if (g.length) out.push(`On how decisions are made, you chose ${sentence(list(g))}`);
  if (hasText(gov.note)) out.push(`On which matters are decided how: ${sentence(gov.note)}`);
  const mem = dimOf(s, "membership"); const m = labelsOf(DIMENSION.membership, mem);
  if (m.length) out.push(`On how people belong, you chose ${sentence(list(m))}`);
  if (hasText(mem.note)) out.push(`On belonging: ${sentence(mem.note)}`);
  const ed = dimOf(s, "educators");
  const groups = [...CONTRIBUTOR_GROUPS.filter((x) => ed.contributors.picks.includes(x.id)).map((x) => lower(x.label)), ...ed.contributors.custom.map((x) => x.text.trim())];
  if (groups.length) out.push(`Contributors to learning: ${sentence(list(groups))}`);
  if (ed.regular) {
    const name = ed.regular === NO_SINGLE_GROUP ? null : [...CONTRIBUTOR_GROUPS.filter((x) => x.id === ed.regular).map((x) => lower(x.label)), ...ed.contributors.custom.filter((x) => x.id === ed.regular).map((x) => x.text.trim())][0];
    out.push(name ? `The group most regularly involved is ${name}.` : "No single group stands out; contributions would be broadly shared.");
  }
  const roles = [...EDUCATOR_ROLES.map((r) => ({ label: lower(r.label), n: ed.roles.values[r.id] ?? 0 })), ...ed.roles.custom.map((r) => ({ label: r.text.trim(), n: ed.roles.values[r.id] ?? 0 }))].filter((r) => r.n > 0).sort((a, b) => b.n - a.n);
  if (roles.length) out.push(`Roles the institution provides, by the weight you gave them (out of 100): ${roles.map((r) => `${r.label} ${r.n}`).join(", ")}.`);
  return out;
}

function place(s) {
  const out = [];
  const loc = DIMENSION.locations; const d = dimOf(s, "locations");
  const name = (id) => [...loc.choices.filter((c) => c.id === id).map((c) => lower(c.label)), ...d.custom.filter((c) => c.id === id).map((c) => c.text.trim())][0];
  if (d.primary) {
    const sec = d.secondary.map(name).filter(Boolean);
    out.push(`Learners spend most of their time in ${name(d.primary)}.${sec.length ? ` Other settings: ${list(sec)}.` : ""}`);
  }
  const a = s.activities.allocation;
  const rows = categoriesFor(a).map((r) => ({ label: lower(r.label), n: a.values[r.id] ?? 0 })).filter((r) => r.n > 0).sort((x, y) => y.n - x.n);
  if (rows.length) out.push(`Priorities for effort and resources, as relative weight out of 100: ${rows.map((r) => `${r.label} ${r.n}`).join(", ")}.`);
  const zeros = categoriesFor(a).filter((r) => a.values[r.id] === 0).map((r) => lower(r.label));
  if (rows.length && zeros.length) out.push(`You gave no weight to ${list(zeros)}.`);
  return out;
}

function change(s) {
  const out = [];
  const f = s.formation;
  if (hasText(f.begins)) out.push(`It comes into being through: ${sentence(f.begins)}`);
  else if (f.beginsUnsure) out.push("You are not sure yet how it begins.");
  const eps = f.episodes.map((x) => x.text.trim()).filter(Boolean);
  if (eps.length) out.push(`It grows and changes through ${eps.length === 1 ? "one episode" : `${eps.length} episodes`}: ${eps.map((t, i) => `${i + 1}) ${t.replace(/[.]+$/, "")}`).join("; ")}.`);
  if (hasText(f.tried)) out.push(`What is tried, adapted, continued or stopped: ${sentence(f.tried)}`);
  else if (f.triedUnsure) out.push("You are not sure yet what would be tried, adapted, continued or stopped.");
  const r = s.activities.rethink;
  const named = (act) => [...PRACTICES.filter((p) => r.items[p.id]?.action === act).map((p) => lower(p.label)), ...r.custom.filter((c) => c.action === act).map((c) => c.text.trim())];
  const parts = PRACTICE_ACTIONS.map((a) => ({ a, items: named(a.id) })).filter((x) => x.items.length).map((x) => `${x.a.label.toLowerCase()} ${list(x.items)}`);
  if (parts.length) out.push(`Familiar practices: ${parts.join("; ")}.`);
  const t = s.activities.tensions.selected;
  if (t.length) out.push(`Tensions you chose to hold, not to resolve: ${t.map((x) => {
    const base = `${x.a} and ${x.b}`;
    const split = x.useSlider && x.value != null ? ` (${x.a} ${x.value}, ${x.b} ${100 - x.value})` : "";
    return `${base}${split}${hasText(x.note) ? ` — ${x.note.trim().replace(/[.]+$/, "")}` : ""}`;
  }).join("; ")}.`);
  return out;
}

const BUILD = { purpose, learning, people, place, change };

// A fingerprint of the inputs, so the profile screen can tell when answers have changed since the draft.
export const inputHash = (s) => {
  const str = JSON.stringify([s.free, s.dims, s.customDims, s.experience, s.activities, s.formation]);
  let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return String(h >>> 0);
};

export function organise(session) {
  const sections = {};
  for (const sec of SECTIONS) { const lines = BUILD[sec.id](session); sections[sec.id] = lines.length ? lines.join("\n\n") : ""; }
  return sections;
}

export const profileText = (sections) => SECTIONS.map((s) => `${s.title}\n${sections[s.id] || EMPTY_SECTION}`).join("\n\n");
