// The profile is stored as distinct, linked versions: participant input is the session itself; then the organised draft,
// the participant's edits, and the approved final. Each version points at the one it came from.
import { uid } from "../state/model.js";
import { SECTIONS, ORGANISER, inputHash, organise } from "./organise.js";

const now = () => new Date().toISOString();
export const latest = (profile) => profile.versions[profile.versions.length - 1] ?? null;
export const current = (profile) => latest(profile);
export const isEdited = (version, id) => Boolean(version?.edited?.[id]);

export function addDraft(session) {
  const v = { id: uid("v"), kind: "draft", at: now(), method: ORGANISER, parentId: latest(session.profile)?.id ?? null, inputHash: inputHash(session), sections: organise(session), edited: {} };
  session.profile.versions.push(v);
  session.profile.approvedVersionId = null;
  return v;
}

// Editing a section updates the open "edited" version, or opens one from the draft.
export function editSection(session, sectionId, text) {
  const cur = latest(session.profile);
  let v = cur;
  if (cur.kind === "draft" || cur.kind === "approved") {
    v = { id: uid("v"), kind: "edited", at: now(), method: cur.method ?? ORGANISER, parentId: cur.id, inputHash: cur.inputHash, sections: { ...cur.sections }, edited: { ...cur.edited } };
    session.profile.versions.push(v);
    session.profile.approvedVersionId = null;
  }
  v.sections[sectionId] = text;
  v.edited[sectionId] = true;
  v.at = now();
}

export function approve(session) {
  const cur = latest(session.profile);
  const v = { id: uid("v"), kind: "approved", at: now(), method: cur.method ?? ORGANISER, parentId: cur.id, inputHash: cur.inputHash, sections: { ...cur.sections }, edited: { ...cur.edited } };
  session.profile.versions.push(v);
  session.profile.approvedVersionId = v.id;
}

export const anyEdited = (v) => SECTIONS.some((s) => v?.edited?.[s.id]);
