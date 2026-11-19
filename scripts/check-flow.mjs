// Quick regression check, no browser needed: npm run check
// Builds sample sessions, then checks that every one survives the server cleaning, flattens to rows,
// produces a profile from its own words only, and that the route guard sends people to the right place.
globalThis.window = { innerWidth: 1280 };
process.env.LID_LOCAL_DB = "1";   // in-memory Postgres, no account needed
const { sampleSessions } = await import("../src/researcher/sample.js");
const { sanitise } = await import("../api/_record.js");
const { flatten } = await import("../src/export/flatten.js");
const { organise, SECTIONS } = await import("../src/profile/organise.js");
const { guard, PATH } = await import("../src/flow/flow.js");
const { newSession } = await import("../src/state/model.js");
const { dimState, requiredDimensionsDone, allocationDone } = await import("../src/flow/validate.js");
const { DIMENSIONS } = await import("../src/config/dimensions.js");
const { overview, dimensions, educators, allocation, tensions, writing } = await import("../src/researcher/metrics.js");

let failed = 0;
const ok = (cond, msg) => { if (!cond) { failed++; console.error("FAIL:", msg); } };

const sessions = sampleSessions(60);
let rows = 0;
for (const s of sessions) {
  const clean = sanitise(JSON.parse(JSON.stringify(s)));
  ok(clean, `sanitise accepted ${s.code}`);
  if (!clean) continue;
  ok(JSON.stringify(Object.keys(clean.dims).sort()) === JSON.stringify(Object.keys(s.dims).sort()), `dimensions kept for ${s.code}`);
  ok(clean.activities.allocation.values && Object.values(clean.activities.allocation.values).every((v) => v >= 0 && v <= 100), `allocation values bounded for ${s.code}`);
  rows += flatten(clean).length;
  const sec = organise(clean);
  ok(SECTIONS.every((x) => typeof sec[x.id] === "string"), `profile sections for ${s.code}`);
}
ok(rows > 0, "flatten produced rows");

// Allocation always totals 100 when present in samples that reached it.
for (const s of sessions) { const a = s.activities.allocation; const t = Object.values(a.values).reduce((x, y) => x + y, 0); if (t) ok(t === 100, `sample allocation totals 100 (${s.code}: ${t})`); }

// Hostile input is cleaned, not stored.
const evil = { v: 1, id: "s_evil12345", code: "LID-ABC123", route: "free", createdAt: new Date().toISOString(), free: { text: "<script>x</script>".repeat(500) }, dims: { __proto__: {}, nope: { status: "answered" } }, activities: { allocation: { values: { a: 999, b: -5, c: 1.5 } } } };
const e = sanitise(evil);
ok(e && e.free.text.length <= 2000, "free text capped");
ok(e && !("nope" in e.dims), "unknown dimension dropped");
ok(e && Object.keys(e.activities.allocation.values).length === 0, "out-of-range points dropped");
ok(!sanitise({ ...evil, code: "bad" }), "bad participant code refused");
ok(!sanitise({ ...evil, route: "x" }), "bad route refused");

// Route guard.
const fresh = newSession();
ok(guard(fresh, PATH.dimensions) === PATH.entry, "no route: back to entry");
const b = newSession(); b.route = "configure";
ok(guard(b, PATH.activities) === PATH.dimensions, "configure: activities need the required dimensions");
ok(guard(b, PATH.imagine) === PATH.dimensions, "configure route cannot open the free screens");
const f = newSession(); f.route = "free";
ok(guard(f, PATH.experience) === PATH.imagine, "free: description is required first");
ok(guard(f, PATH.dimensions) === PATH.imagine, "free route skips dimensions");
f.free.text = "an idea";
ok(guard(f, PATH.experience) === null, "free: experience opens after the description");
ok(guard(f, PATH.institution) === PATH.activities, "institution needs resource allocation");
ok(DIMENSIONS.filter((d) => d.required).length === 6, "six required dimensions");
ok(!requiredDimensionsDone(b) && !allocationDone(b), "nothing done on a new session");
ok(DIMENSIONS.every((d) => dimState(b, d) === "todo"), "all dimensions start as not started");

// Database: save, update, list, rate limit, withdraw, researcher delete (in-memory Postgres).
const browserWindow = globalThis.window; delete globalThis.window;   // the in-memory Postgres behaves differently when it thinks it is in a browser
const db = await import("../api/_db.js");
const base = sanitise(JSON.parse(JSON.stringify(sessions.find((x) => x.route === "configure"))));
const make = (n) => ({ ...base, id: `s_check${n}`, code: `LID-CHECK${n}` });
const a1 = make(1);
await db.saveSession(a1);
await db.saveSession({ ...a1, furthest: "done", updatedAt: new Date().toISOString() });
let listed = (await db.listSessions()).sessions;
ok(listed.length === 1 && listed[0].furthest === "done", "save is an upsert and list returns the session");
await db.saveSession({ ...a1, code: "LID-ZZZZZZ", furthest: "entry" });
listed = (await db.listSessions()).sessions;
ok(listed[0].furthest === "done", "a different code cannot overwrite an existing session id");
ok((await db.deleteSession({ id: a1.id, code: "LID-ZZZZZZ" })) === 0, "withdraw needs the right code");
ok((await db.deleteSession({ id: a1.id, code: a1.code })) === 1, "withdraw with id and code deletes it");
await db.saveSession(a1);
ok((await db.listSessions()).sessions.length === 0, "a late save cannot bring a withdrawn session back");
const a2 = make(2);
await db.saveSession(a2);
ok((await db.deleteSession({ code: a2.code })) === 1, "researcher delete by code");
await db.saveSession(a2);
ok((await db.listSessions()).sessions.length === 0, "and it stays deleted");
for (let i = 10; i < 17; i++) await db.saveSession({ ...make(i), id: `s_page${i}`, code: `LID-PAGE${i}`.slice(0, 10), createdAt: new Date(Date.UTC(2026, 10, 1, 10, 0, i % 3)).toISOString(), updatedAt: new Date().toISOString() });
const seen = []; let cursor = ""; let pages = 0;
do { const pg = await db.listSessions({ after: cursor, step: 3, budget: 10_000_000 }); seen.push(...pg.sessions.map((x) => x.id)); cursor = pg.next ?? ""; pages++; } while (cursor && pages < 20);
ok(seen.filter((x) => x.startsWith("s_page")).length === 7 && new Set(seen).size === seen.length, `paged listing returns every session once (got ${seen.length}, ${new Set(seen).size} unique)`);
const tiny = []; cursor = ""; pages = 0;
do { const pg = await db.listSessions({ after: cursor, step: 50, budget: 1 }); tiny.push(...pg.sessions.map((x) => x.id)); cursor = pg.next ?? ""; pages++; } while (cursor && pages < 50);
ok(new Set(tiny).size === seen.length, "a page always holds at least one session even when the size budget is tiny, and nothing is skipped");
ok(!db.validCursor("x'; drop table lid_sessions;--") && db.validCursor("2026-11-01T10:00:00.000000Z|s_abc"), "page cursors are validated");
for (let i = 10; i < 17; i++) await db.deleteSession({ code: `LID-PAGE${i}`.slice(0, 10) });
const a3 = { ...make(3), updatedAt: "2026-11-19T10:09:00.000Z", completedAt: "2026-11-19T10:09:00.000Z", furthest: "done" };
await db.saveSession(a3);
await db.saveSession({ ...a3, updatedAt: "2026-11-19T10:05:00.000Z", completedAt: null, furthest: "activities" });
const kept = (await db.listSessions()).sessions.find((x) => x.id === a3.id);
ok(kept?.furthest === "done" && kept?.completedAt, "an older save that arrives late cannot undo a submitted session");
const hits = []; for (let i = 0; i < 3; i++) hits.push(await db.hit("test-ip", 600));
ok(hits.join() === "1,2,3", "rate counter counts up");
globalThis.window = browserWindow;

// Saved sessions in the browser: damaged or old data is repaired, good data is kept exactly.
const { repairSession } = await import("../src/state/model.js");
const good = JSON.parse(JSON.stringify(sessions.find((x) => x.route === "configure")));
ok(JSON.stringify(repairSession(good)) === JSON.stringify({ ...repairSession(good) }) && repairSession(good).activities.allocation.values["people-mentoring"] === good.activities.allocation.values["people-mentoring"] && repairSession(good).profile.versions.length === good.profile.versions.length, "repair keeps a good session");
for (const [name, mut] of [["activities null", (x) => { x.activities = null; }], ["allocation missing", (x) => { delete x.activities.allocation; }], ["formation missing", (x) => { delete x.formation; }], ["versions null", (x) => { x.profile.versions = null; }], ["reflection null", (x) => { x.reflection = null; }], ["picks a string", (x) => { x.dims.governance = { picks: "x", custom: 5 }; }], ["route bogus", (x) => { x.route = "banana"; }], ["experience steps not array", (x) => { x.experience.steps = "oops"; }]]) {
  const bad = JSON.parse(JSON.stringify(good)); mut(bad);
  let fine = true; try { const r = repairSession(bad); flatten(r); organise(r); if (r.dims.governance) { r.dims.governance.picks.includes("x"); r.dims.governance.custom.map((c) => c); } } catch { fine = false; }
  ok(fine, `repair: ${name} no longer breaks the exports or the profile`);
}

// A very thorough participant (long answers everywhere, several profile rounds) must still fit in one save.
{ const { addDraft, approve, editSection } = await import("../src/profile/versions.js");
  const big = JSON.parse(JSON.stringify(sessions.find((x) => x.route === "configure" && x.furthest === "done")));
  const long = (n) => "word ".repeat(n / 5);
  big.free.text = long(2000); big.reflection.interesting = long(2000); big.experience.steps = Array.from({ length: 30 }, (_, i) => ({ id: `p_${i}`, text: long(400) }));
  for (let i = 0; i < 6; i++) { addDraft(big); editSection(big, "learning", long(3000)); approve(big); }
  const size = JSON.stringify(big).length;
  ok(size > 120_000 && size < 1_000_000, `thorough session is ${Math.round(size / 1024)} KB: above the old 120 KB limit, inside the new 1 MB one`); }

// CSV downloads: anything a participant types that starts like a formula is neutralised, plain numbers are untouched.
const { toCsv, safeCell } = await import("../src/export/flatten.js");
ok(safeCell('=HYPERLINK("x")') === `'=HYPERLINK("x")` && safeCell("+1") === "'+1" && safeCell("@a") === "'@a" && safeCell("-2+3") === "'-2+3" && safeCell("\t=1") === "'\t=1", "csv: formula-like text is made plain");
ok(safeCell("-5") === "-5" && safeCell("0/100") === "0/100" && safeCell("2026-11-19T10:00:00.000Z") === "2026-11-19T10:00:00.000Z", "csv: numbers and dates are left alone");
ok(!/(^|,)"?[=+@]/m.test(toCsv(flatten({ ...fresh, code: "LID-ABC123", route: "free", free: { text: "=1+1" } }))), "csv: a typed formula never starts a cell");

const { responsesCsv, summaryCsv } = await import("../src/researcher/exports.js");
ok(responsesCsv(sessions).charCodeAt(0) === 0xfeff && summaryCsv(sessions).charCodeAt(0) === 0xfeff, "csv downloads start with a UTF-8 mark so Excel shows other scripts correctly");

// Dashboard maths run on samples.
const o = overview(sessions);
ok(o.started === 60 && o.completed <= 60, "overview counts");
ok(dimensions(sessions).length === 12 && educators(sessions).roles.length === 8 && allocation(sessions).categories.length === 8, "dashboard sections");
ok(tensions(sessions).total >= 0 && writing(sessions).length >= 0, "tensions and writing");

console.log(failed ? `${failed} check(s) failed` : `all checks passed (${sessions.length} sample sessions, ${rows} response rows)`);
process.exit(failed ? 1 : 0);
