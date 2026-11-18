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
let listed = await db.listSessions();
ok(listed.length === 1 && listed[0].furthest === "done", "save is an upsert and list returns the session");
await db.saveSession({ ...a1, code: "LID-ZZZZZZ", furthest: "entry" });
listed = await db.listSessions();
ok(listed[0].furthest === "done", "a different code cannot overwrite an existing session id");
ok((await db.deleteSession({ id: a1.id, code: "LID-ZZZZZZ" })) === 0, "withdraw needs the right code");
ok((await db.deleteSession({ id: a1.id, code: a1.code })) === 1, "withdraw with id and code deletes it");
await db.saveSession(a1);
ok((await db.listSessions()).length === 0, "a late save cannot bring a withdrawn session back");
const a2 = make(2);
await db.saveSession(a2);
ok((await db.deleteSession({ code: a2.code })) === 1, "researcher delete by code");
await db.saveSession(a2);
ok((await db.listSessions()).length === 0, "and it stays deleted");
const hits = []; for (let i = 0; i < 3; i++) hits.push(await db.hit("test-ip", 600));
ok(hits.join() === "1,2,3", "rate counter counts up");
globalThis.window = browserWindow;

// Dashboard maths run on samples.
const o = overview(sessions);
ok(o.started === 60 && o.completed <= 60, "overview counts");
ok(dimensions(sessions).length === 12 && educators(sessions).roles.length === 8 && allocation(sessions).categories.length === 8, "dashboard sections");
ok(tensions(sessions).total >= 0 && writing(sessions).length >= 0, "tensions and writing");

console.log(failed ? `${failed} check(s) failed` : `all checks passed (${sessions.length} sample sessions, ${rows} response rows)`);
process.exit(failed ? 1 : 0);
