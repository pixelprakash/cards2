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
