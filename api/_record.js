// Cleans a session sent by a browser before it is stored: only known fields, capped sizes, only known values.
// The researcher view and exports trust this shape.
import { DIMENSIONS } from "../src/config/dimensions.js";

const ID = /^[a-z0-9_-]{1,40}$/;
const DEVICES = new Set(["phone", "tablet", "desktop"]);
const STATUS = new Set(["unanswered", "answered", "skipped", "na"]);
const STAGES = new Set(["entry", "dimensions", "activities", "institution", "reflection", "done"]);
const KINDS = new Set(["draft", "edited", "approved"]);
const ACTIONS = new Set(["keep", "change", "leave", "combine", "add"]);
const DIM_IDS = new Set(DIMENSIONS.map((d) => d.id));

const str = (v, max) => (typeof v === "string" ? [...v].filter((ch) => ch >= " " || ch === "\n").join("").slice(0, max) : "");
const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
const id = (v) => (typeof v === "string" && ID.test(v) ? v : null);
const ids = (v, max = 40) => arr(v, max).map(id).filter(Boolean);
const iso = (v) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);
const status = (v) => (STATUS.has(v) ? v : "unanswered");
const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null);
const bool = (v) => v === true;
const texts = (v, n, len) => arr(v, n).map((x) => ({ id: id(x?.id) ?? "x_0", text: str(x?.text, len) })).filter((x) => x.text.trim());
const picks = (v) => ({ picks: ids(v?.picks), custom: texts(v?.custom, 20, 120) });
const steps = (v, n = 30) => arr(v, n).map((x) => ({ id: id(x?.id) ?? "x_0", text: str(x?.text, 400) })).filter((x) => x.text.trim());
const values = (v) => { const out = {}; for (const [k, n] of Object.entries(v && typeof v === "object" ? v : {}).slice(0, 40)) { const key = id(k); const val = int(n, 0, 100); if (key && val !== null) out[key] = val; } return out; };

function dimension(d) {
  return {
    status: status(d?.status), ...picks(d), primary: id(d?.primary), secondary: ids(d?.secondary, 2), most: id(d?.most), note: str(d?.note, 1200),
    contributors: picks(d?.contributors), regular: id(d?.regular),
    roles: { values: values(d?.roles?.values), custom: texts(d?.roles?.custom, 20, 120) },
    stages: steps(d?.stages),
  };
}

function tension(t) {
  return { id: id(t?.id) ?? "x_0", a: str(t?.a, 60), b: str(t?.b, 60), own: bool(t?.own), useSlider: bool(t?.useSlider), value: int(t?.value, 0, 100), note: str(t?.note, 1200) };
}

function version(v) {
  const sections = {}; const edited = {};
  for (const k of ["purpose", "learning", "people", "place", "change"]) { sections[k] = str(v?.sections?.[k], 4000); if (v?.edited?.[k] === true) edited[k] = true; }
  return { id: id(v?.id) ?? "v_0", kind: KINDS.has(v?.kind) ? v.kind : "draft", at: iso(v?.at), method: str(v?.method, 40), parentId: id(v?.parentId), inputHash: str(v?.inputHash, 16), sections, edited };
}

export function sanitise(r) {
  if (!r || typeof r !== "object" || r.v !== 1 || !id(r.id) || typeof r.code !== "string" || !/^LID-[A-Z0-9]{6}$/.test(r.code)) return null;
  const createdAt = iso(r.createdAt);
  if (!createdAt || !(r.route === "free" || r.route === "configure")) return null;
  const e = r.experience ?? {};
  const a = r.activities ?? {};
  const dims = {};
  for (const [k, d] of Object.entries(r.dims && typeof r.dims === "object" ? r.dims : {})) if (DIM_IDS.has(k)) dims[k] = dimension(d);
  return {
    v: 1, id: r.id, code: r.code, route: r.route, createdAt, updatedAt: iso(r.updatedAt) ?? createdAt, completedAt: iso(r.completedAt),
    furthest: STAGES.has(r.furthest) ? r.furthest : "entry", device: DEVICES.has(r.device) ? r.device : "desktop",
    free: { text: str(r.free?.text, 2000) },
    dims,
    customDims: arr(r.customDims, 10).map((c) => ({ id: id(c?.id) ?? "x_0", title: str(c?.title, 80), text: str(c?.text, 600) })).filter((c) => c.title.trim()),
    experience: { ideas: steps(e.ideas, 20), does: str(e.does, 1200), takesPart: picks(e.takesPart), where: picks(e.where), steps: steps(e.steps), outcomes: str(e.outcomes, 1200), status: status(e.status) },
    activities: {
      allocation: { values: values(a.allocation?.values), custom: texts(a.allocation?.custom, 20, 120), status: status(a.allocation?.status) },
      rethink: { items: Object.fromEntries(Object.entries(a.rethink?.items ?? {}).slice(0, 30).filter(([k, v]) => id(k) && ACTIONS.has(v?.action)).map(([k, v]) => [k, { action: v.action }])), custom: arr(a.rethink?.custom, 20).map((c) => ({ id: id(c?.id) ?? "x_0", text: str(c?.text, 120), action: ACTIONS.has(c?.action) ? c.action : null })).filter((c) => c.text.trim()), status: status(a.rethink?.status) },
      signature: { practice: str(a.signature?.practice, 1500), effect: str(a.signature?.effect, 1500), difficulty: str(a.signature?.difficulty, 1500), status: status(a.signature?.status) },
      tensions: { selected: arr(a.tensions?.selected, 3).map(tension), status: status(a.tensions?.status) },
      purpose: { text: str(a.purpose?.text, 1500), status: status(a.purpose?.status) },
    },
    formation: { begins: str(r.formation?.begins, 1500), beginsUnsure: bool(r.formation?.beginsUnsure), episodes: steps(r.formation?.episodes, 20), tried: str(r.formation?.tried, 1500), triedUnsure: bool(r.formation?.triedUnsure) },
    profile: { versions: arr(r.profile?.versions, 40).map(version), approvedVersionId: id(r.profile?.approvedVersionId) },
    reflection: { interesting: str(r.reflection?.interesting, 2000), difficult: str(r.reflection?.difficult, 2000), change: str(r.reflection?.change, 2000) },
  };
}
