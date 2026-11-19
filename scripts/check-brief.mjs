// Checks the product against the Phase III designer brief (v0.5): the option inventory word for word, the rules that
// are frozen, and that the data the brief asks for is actually stored and exported. Run with `npm run check`.
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
globalThis.crypto ??= webcrypto;
globalThis.window = { innerWidth: 1200 };

const brief = JSON.parse(readFileSync(new URL("./brief-inventory.json", import.meta.url), "utf8"));
const { DIMENSIONS, CONTRIBUTOR_GROUPS, EDUCATOR_ROLES, EXPERIENCE_PROMPTS, HUB_REQUIRED, HUB_OPTIONAL, NO_SINGLE_GROUP_LABEL } = await import("../src/config/dimensions.js");
const { ALLOCATION_CATEGORIES, REFLECTION_PROMPTS, PURPOSE_PROMPT, MAX_TENSIONS } = await import("../src/config/activities.js");
const { newSession, newDimension } = await import("../src/state/model.js");
const { flatten } = await import("../src/export/flatten.js");
const { addDraft, approve, editSection } = await import("../src/profile/versions.js");
const { organise } = await import("../src/profile/organise.js");
const { sanitise } = await import("../api/_record.js");
const { guard } = await import("../src/flow/flow.js");
const { experience, completion } = await import("../src/researcher/metrics.js");
const { dimValid } = await import("../src/flow/validate.js");
const { ROUTES } = await import("../src/config/stages.js");

let failed = 0;
const ok = (cond, msg) => { if (!cond) { failed++; console.error("FAIL (brief):", msg); } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- the option inventory, in the brief's order and words
ok(DIMENSIONS.length === 12, "twelve dimensions");
brief.dimensions.forEach((b) => {
  const d = DIMENSIONS.find((x) => x.n === b.n);
  ok(d, `dimension ${b.n} exists`); if (!d) return;
  ok(d.required === b.required, `dimension ${b.n} ${d.title}: required = ${b.required}`);
  ok(d.question === b.question, `dimension ${b.n} question wording: "${d.question}" vs "${b.question}"`);
  if (d.choices) ok(same(d.choices.map((c) => c.label), b.choices), `dimension ${b.n} choices match the brief\n   ours : ${d.choices.map((c) => c.label).join(" | ")}\n   brief: ${b.choices.join(" | ")}`);
});
ok(same(CONTRIBUTOR_GROUPS.map((g) => g.label), brief.contributorGroups), "contributor groups");
ok(same(EDUCATOR_ROLES.map((r) => r.label), brief.roles), "educator roles");
ok(same(ALLOCATION_CATEGORIES.map((c) => c.label), brief.allocation), "resource allocation categories");
ok(same(REFLECTION_PROMPTS.map((p) => p.q), brief.reflection), "three reflection prompts, exact wording");
ok(same(Object.values(EXPERIENCE_PROMPTS).map((p) => p.q), brief.experiencePrompts), "six 'build one learning experience' prompts");
ok(same(HUB_REQUIRED.map((d) => d.short), brief.hubRequired), "required dimension order on the hub");
ok(same(HUB_OPTIONAL.map((d) => d.short), brief.hubOptional), "optional dimension order on the hub");
ok(NO_SINGLE_GROUP_LABEL === brief.noSingleGroup, "no-single-group wording");
ok(PURPOSE_PROMPT === brief.purpose, "purpose prompt wording");
ok(ROUTES.free.title === "Imagine Freely" && ROUTES.configure.title === "Configure Your Institution", "route names");
ok(MAX_TENSIONS === 3, "up to three tensions");
ok(REFLECTION_PROMPTS.length === 3, "no fourth reflection prompt");

// ---- frozen rules
const b = newSession(); b.route = "configure";
b.dims.educators = { ...newDimension(), contributors: { picks: ["peers"], custom: [] }, regular: "peers", roles: { values: { "teach-explain": 99 }, custom: [] } };
ok(!dimValid(b, DIMENSIONS.find((d) => d.id === "educators")), "educators roles must total exactly 100");
b.dims.educators.roles.values["teach-explain"] = 100;
ok(dimValid(b, DIMENSIONS.find((d) => d.id === "educators")), "educators valid at 100 with zeros elsewhere");
b.dims.locations = { ...newDimension(), primary: null, secondary: [] };
ok(!dimValid(b, DIMENSIONS.find((d) => d.id === "locations")), "locations needs a primary setting");
const f = newSession(); f.route = "free";
ok(guard(f, "/dimensions") === "/imagine", "Route A skips the dimensions");
ok(guard(f, "/activities") === "/imagine", "Route A needs the description before shared activities");
f.free.text = "x";
ok(guard(f, "/activities") === null, "Route A goes from the description to shared activities");
ok(guard(f, "/institution") === "/activities", "resource allocation is required before the institution stage");
ok(guard(b, "/activities") === "/dimensions", "Route B needs the six required dimensions before shared activities");

// ---- data the brief asks for is stored and exported
const s = newSession(); s.route = "configure";
const dim = (id, patch) => { s.dims[id] = { ...newDimension(), ...patch }; };
dim("locations", { status: "answered", primary: "classrooms", secondary: ["digital"], custom: [{ id: "c_loc1", text: "A ferry" }] });
dim("educators", { status: "answered", contributors: { picks: ["peers"], custom: [{ id: "c_edu1", text: "Elders" }] }, regular: "c_edu1", roles: { values: { "teach-explain": 60, guide: 40, assess: 0 }, custom: [] } });
dim("pedagogy", { status: "answered" });
s.customDims = [{ id: "c_dim1", title: "Rituals", text: "Opening and closing days" }];
s.experience.ideas = [{ id: "p_1", text: "Boat repair" }];
s.experience.takesPart = { picks: ["peers", "c_edu1"], custom: [] };
s.experience.where = { picks: ["classrooms", "c_loc1"], custom: [] };
s.experience.steps = [{ id: "p_2", text: "Meet at the pier" }];
s.activities.allocation = { values: { "people-mentoring": 100, "library-knowledge": 0 }, custom: [], status: "answered" };
s.activities.tensions.selected = [{ id: "stability-change", a: "Stability", b: "Change", own: false, useSlider: true, value: 0, note: "" }];
s.formation.begins = "A town meeting";
addDraft(s); editSection(s, "purpose", "My own words"); approve(s);
s.completedAt = new Date().toISOString();

const rows = flatten(s);
const q = (section, item) => rows.filter((r) => r.section === section && r.item.startsWith(item));
const where = q("experience", "Where does it happen?");
ok(where.find((r) => r.option_id === "classrooms")?.option_label === "Classrooms or lecture spaces", "experience: linked standard setting keeps its label");
ok(where.find((r) => r.option_id === "c_loc1")?.option_label === "A ferry" && where.find((r) => r.option_id === "c_loc1")?.provenance === "participant-generated", "experience: setting added on Locations is exported with its words");
ok(q("experience", "Who or what takes part?").find((r) => r.option_id === "c_edu1")?.option_label === "Elders", "experience: contributor added on Educators is exported with its words");
ok(rows.find((r) => r.section === "experience" && r.item === "status")?.value === "answered", "Route B experience is recorded as answered");
ok(experience([s]).n === 1, "dashboard counts Route B learning experiences");
ok(/Elders/.test(organise(s).learning), "profile mentions the contributor the participant linked");
ok(/Rituals/.test(organise(s).learning), "profile mentions a dimension the participant added");
ok(s.profile.versions.every((v) => v.method === "rule-based-v1"), "every profile version records how it was made");
ok(s.profile.versions[1].parentId === s.profile.versions[0].id && s.profile.versions[2].parentId === s.profile.versions[1].id, "draft → edit → approved are linked");
ok(sanitise(JSON.parse(JSON.stringify(s))).profile.versions.every((v) => v.method === "rule-based-v1"), "the stored copy keeps the organiser version");
const vrows = rows.filter((r) => r.section === "profile_version");
ok(vrows.length === 3 && vrows.every((r) => r.timestamp && /method=rule-based-v1; parent=/.test(r.detail)), "export has one linked, timestamped row per profile version");
ok(["started", "last_saved", "submitted"].every((i) => rows.some((r) => r.section === "session" && r.item === i && r.timestamp)), "export has started, last saved and submitted times");
ok(q("activity:allocation", "points").find((r) => r.option_id === "library-knowledge")?.status === "zero", "zero stays distinct from unanswered");
ok(q("activity:allocation", "points").find((r) => r.option_id === "studios-labs")?.status === "unanswered", "unanswered stays distinct from zero");
ok(q("activity:tensions", "tension")[0]?.value === "0/100", "tension slider values are exported");
ok(rows.every((r) => !r.provenance || ["researcher-provided", "participant-selected", "participant-generated", "participant-modified", "system-organised", "participant-approved"].includes(r.provenance)), "provenance uses the agreed labels (system-organised stands for the brief's AI-organised)");
const comp = completion([s]);
ok(comp.find((r) => r.id === "reflection-interesting")?.skipped === 1, "dashboard counts a blank reflection after submit as skipped");
ok(comp.find((r) => r.id === "allocation")?.answered === 1, "dashboard counts a finished allocation as answered");

if (failed) { console.error(`${failed} brief checks failed`); process.exit(1); }
console.log("brief checks passed");
