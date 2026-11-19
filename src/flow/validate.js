// What counts as answered or complete. Pure functions of the session, shared by screens, the flow guard and the checks.
import { DIMENSIONS, DIMENSION, NO_SINGLE_GROUP } from "../config/dimensions.js";
import { ALLOCATION_CATEGORIES, ALLOCATION_TOTAL } from "../config/activities.js";
import { dimOf, hasText } from "../state/model.js";

export const sum = (values) => Object.values(values ?? {}).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);

export const allocationTotal = (a) => sum(a.values);
export const allocationReady = (a) => allocationTotal(a) === ALLOCATION_TOTAL;

export function experienceHasContent(e) {
  return e.ideas.some((i) => hasText(i.text)) || hasText(e.does) || hasText(e.outcomes)
    || e.takesPart.picks.length + e.takesPart.custom.length > 0 || e.where.picks.length + e.where.custom.length > 0
    || e.steps.some((s) => hasText(s.text));
}

// The status of the "build one learning experience" answer. On Route A it is set when the participant moves on;
// on Route B it belongs to dimension 11. Anything actually written counts as answered, so the two routes read the same.
export function experienceStatus(session) {
  if (experienceHasContent(session.experience)) return "answered";
  const own = session.route === "configure" ? session.dims?.pedagogy?.status : session.experience?.status;
  return own ?? "unanswered";
}

// Has the participant put anything into this dimension?
export function dimHasContent(session, dim) {
  const d = dimOf(session, dim.id);
  switch (dim.kind) {
    case "locations": return d.primary != null;
    case "educators": return d.contributors.picks.length + d.contributors.custom.length > 0 || d.regular != null || sum(d.roles.values) > 0;
    case "experience": return experienceHasContent(session.experience);
    case "pathway": return d.picks.length + d.custom.length > 0 || d.stages.some((s) => hasText(s.text));
    default: return d.picks.length + d.custom.length > 0;
  }
}

// Required dimensions have rules that must be met. Optional ones are done once answered, skipped or marked not applicable.
export function dimValid(session, dim) {
  const d = dimOf(session, dim.id);
  switch (dim.kind) {
    case "educators": {
      const hasGroups = d.contributors.picks.length + d.contributors.custom.length > 0;
      return hasGroups && d.regular != null && sum(d.roles.values) === ALLOCATION_TOTAL;
    }
    case "locations": return d.primary != null;
    default: return dimHasContent(session, dim);
  }
}

export function dimState(session, dim) {
  const st = dimOf(session, dim.id).status;
  if (dim.required) return dimValid(session, dim) && st === "answered" ? "done" : dimHasContent(session, dim) ? "started" : "todo";
  if (st === "skipped") return "skipped";
  if (st === "na") return "na";
  return st === "answered" && dimHasContent(session, dim) ? "done" : dimHasContent(session, dim) ? "started" : "todo";
}

export const requiredDimensionsDone = (session) => DIMENSIONS.filter((d) => d.required).every((d) => dimState(session, d) === "done");

export function activityState(session, id) {
  const a = session.activities[id];
  if (id === "allocation") return allocationReady(a) && a.status === "answered" ? "done" : allocationTotal(a) > 0 ? "started" : "todo";
  if (a.status === "skipped") return "skipped";
  return a.status === "answered" ? "done" : "todo";
}

export const allocationDone = (session) => activityState(session, "allocation") === "done";
export const profileApproved = (session) => Boolean(session.profile.approvedVersionId);

export const regularLabelId = (id) => (id === NO_SINGLE_GROUP ? NO_SINGLE_GROUP : id);
export const categoriesFor = (a) => [...ALLOCATION_CATEGORIES.map((c) => ({ id: c.id, label: c.label })), ...a.custom.map((c) => ({ id: c.id, label: c.text }))];
export const dimensionById = (id) => DIMENSION[id];
