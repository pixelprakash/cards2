// Plain-language names for the long response format, shared by the reports and the participant sheet.
import { DIMENSION } from "../config/dimensions.js";
import { ACTIVITY } from "../config/activities.js";

const SECTION_LABEL = { entry: "Route", free: "Imagine Freely description", experience: "Learning experience", formation: "How it begins and changes", reflection: "Reflection", custom_dimension: "Dimension added by participant", profile: "Profile" };
export function sectionLabel(section) {
  if (section.startsWith("dimension:")) return DIMENSION[section.slice(10)]?.title ?? section;
  if (section.startsWith("activity:")) return ACTIVITY[section.slice(9)]?.title ?? section;
  return SECTION_LABEL[section] ?? section;
}
const ITEM_LABEL = { status: "Status", choice: "Chosen", primary: "Main setting", secondary: "Other setting", most_important: "Matters most", most_regular: "Most regular group", contributor: "Contributor", role_points: "Role points", points: "Points", note: "Note", practice: "Practice", tension: "Tension", tension_note: "About the tension", purpose: "Purpose" };
export const itemLabel = (i) => ITEM_LABEL[i] ?? String(i).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
export const answer = (r) => (r.option_label ? (r.value !== "" && r.item !== "status" ? `${r.option_label}: ${r.value}` : r.option_label) : r.value);

