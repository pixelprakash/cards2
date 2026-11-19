// The participant's session: one plain object, saved as sent. Nothing here is a score.
// Statuses are kept distinct: "unanswered" (nothing yet), "answered", "skipped" (chose to skip),
// "na" (not applicable to my institution). A points value of 0 is a real answer and differs from a missing one.

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const rand = (n) => {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
};

export const uid = (prefix = "x") => `${prefix}_${rand(10)}`;
export const makeCode = () => `LID-${rand(6).toUpperCase()}`;

export const deviceClass = () => {
  const w = window.innerWidth;
  return w < 640 ? "phone" : w < 1024 ? "tablet" : "desktop";
};

const picks = () => ({ picks: [], custom: [] });

export function newSession() {
  const now = new Date().toISOString();
  return {
    v: 1,
    id: uid("s"),
    code: makeCode(),
    route: null,                 // "free" (Imagine Freely) or "configure" (Configure Your Institution)
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    furthest: "entry",           // the furthest stage reached: entry | dimensions | activities | institution | reflection | done
    device: deviceClass(),
    free: { text: "" },
    dims: {},                    // by dimension id, created when a dimension is opened
    customDims: [],              // [{ id, title, text }]
    experience: { ideas: [], does: "", takesPart: picks(), where: picks(), steps: [], outcomes: "", status: "unanswered" },
    activities: {
      allocation: { values: {}, custom: [], status: "unanswered" },
      rethink: { items: {}, custom: [], status: "unanswered" },
      signature: { practice: "", effect: "", difficulty: "", status: "unanswered" },
      tensions: { selected: [], status: "unanswered" },
      purpose: { text: "", status: "unanswered" },
    },
    formation: { begins: "", beginsUnsure: false, episodes: [], tried: "", triedUnsure: false },
    profile: { versions: [], approvedVersionId: null },
    reflection: { interesting: "", difficult: "", change: "" },
  };
}

export const newDimension = () => ({
  status: "unanswered", ...picks(), primary: null, secondary: [], most: null, note: "",
  contributors: picks(), regular: null, roles: { values: {}, custom: [] }, stages: [],
});

export const dimOf = (session, id) => session.dims[id] ?? newDimension();

export const hasText = (v) => typeof v === "string" && v.trim().length > 0;
export const customLabel = (list, id) => list.find((x) => x.id === id)?.text ?? "";

// Brings a saved session back to the shape the screens expect. Anything missing or of the wrong kind (an older build, a
// half-written save, a hand-edited value) is replaced by the empty default for that spot; everything valid is kept.
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
function conform(value, template) {
  if (Array.isArray(template)) return Array.isArray(value) ? value : template;
  if (isObj(template)) {
    const src = isObj(value) ? value : {};
    const out = { ...src };
    for (const k of Object.keys(template)) out[k] = conform(src[k], template[k]);
    return out;
  }
  if (typeof template === "string") return typeof value === "string" ? value : template;
  if (typeof template === "boolean") return typeof value === "boolean" ? value : template;
  return value === undefined ? template : value;   // null and numbers: keep what is there
}
export function repairSession(saved) {
  const base = newSession();
  const s = conform(saved, base);
  const dims = {};
  if (isObj(saved.dims)) for (const [k, d] of Object.entries(saved.dims)) dims[k] = conform(d, newDimension());
  s.dims = dims;
  s.customDims = Array.isArray(saved.customDims) ? saved.customDims.filter((c) => isObj(c) && typeof c.title === "string") : [];
  s.profile.versions = Array.isArray(saved.profile?.versions) ? saved.profile.versions.filter((v) => isObj(v) && isObj(v.sections)) : [];
  s.activities.allocation.values = isObj(saved.activities?.allocation?.values) ? saved.activities.allocation.values : {};
  s.activities.rethink.items = isObj(saved.activities?.rethink?.items) ? saved.activities.rethink.items : {};
  if (s.route !== "free" && s.route !== "configure") s.route = null;
  return s;
}
