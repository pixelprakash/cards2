import { DIMENSIONS, EDUCATOR_ROLES } from "../config/dimensions.js";
import { ALLOCATION_CATEGORIES } from "../config/activities.js";
import { flatten, toCsv } from "../export/flatten.js";
import { minutes } from "./metrics.js";

const quote = (v) => { const t = String(v ?? "").replace(/\r?\n/g, " "); return /[",]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };

// One row per participant: the numbers a researcher usually wants side by side. First row is the header.
export function summaryRows(sessions) {
  const cols = ["participant", "route", "device", "started", "completed", "minutes", "furthest", "profile_versions", "profile_approved", "profile_sections_edited",
    ...DIMENSIONS.map((d) => `dim_${d.id}_status`), ...ALLOCATION_CATEGORIES.map((c) => `alloc_${c.id}`), ...EDUCATOR_ROLES.map((r) => `role_${r.id}`), "tensions"];
  const lines = [cols];
  sessions.forEach((s) => {
    const v = s.profile?.versions ?? [];
    const edited = new Set(v.flatMap((x) => Object.keys(x.edited ?? {})));
    const row = [s.code, s.route, s.device, s.createdAt, s.completedAt ?? "", s.completedAt ? Math.round(minutes(s) * 10) / 10 : "", s.furthest, v.length, s.profile?.approvedVersionId ? "yes" : "no", edited.size,
      ...DIMENSIONS.map((d) => s.dims?.[d.id]?.status ?? (s.route === "configure" ? "unanswered" : "")),
      ...ALLOCATION_CATEGORIES.map((c) => s.activities?.allocation?.values?.[c.id] ?? ""),
      ...EDUCATOR_ROLES.map((r) => s.dims?.educators?.roles?.values?.[r.id] ?? ""),
      (s.activities?.tensions?.selected ?? []).map((t) => `${t.a}/${t.b}${t.useSlider && t.value != null ? `=${t.value}` : ""}`).join(" | ")];
    lines.push(row);
  });
  return lines;
}

export const summaryCsv = (sessions) => summaryRows(sessions).map((r) => r.map(quote).join(",")).join("\n");

export const responsesCsv = (sessions) => toCsv(sessions.flatMap(flatten));

export function download(name, type, data) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
