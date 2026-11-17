// The route map. Paths, the order of screens on each route, and which screens may be opened yet.
import { allocationDone, profileApproved, requiredDimensionsDone } from "./validate.js";
import { hasText } from "../state/model.js";

export const PATH = {
  entry: "/",
  imagine: "/imagine",
  experience: "/experience",
  dimensions: "/dimensions",
  dimension: (id) => `/dimension/${id}`,
  activities: "/activities",
  activity: (id) => `/activity/${id}`,
  institution: "/institution",
  profile: "/profile",
  reflection: "/reflection",
  done: "/done",
};

// Stage ranks, used to remember the furthest stage reached.
export const STAGE_RANK = { entry: 0, dimensions: 1, activities: 2, institution: 3, reflection: 4, done: 5 };

export function stageOfPath(pathname) {
  if (pathname === "/") return "entry";
  if (pathname === "/imagine" || pathname === "/experience" || pathname.startsWith("/dimension")) return "dimensions";
  if (pathname.startsWith("/activit")) return "activities";
  if (pathname === "/institution" || pathname === "/profile") return "institution";
  if (pathname === "/reflection") return "reflection";
  if (pathname === "/done") return "done";
  return "entry";
}

// Where each "Continue" and "Back" goes.
export function nextPath(session, pathname) {
  switch (pathname) {
    case "/": return session.route === "free" ? PATH.imagine : PATH.dimensions;
    case "/imagine": return PATH.experience;
    case "/experience": return session.route === "free" ? PATH.activities : PATH.dimensions;
    case "/dimensions": return PATH.activities;
    case "/activities": return PATH.institution;
    case "/institution": return PATH.profile;
    case "/profile": return PATH.reflection;
    case "/reflection": return PATH.done;
    default: return PATH.entry;
  }
}

export function backPath(session, pathname) {
  if (pathname.startsWith("/dimension/")) return PATH.dimensions;
  if (pathname.startsWith("/activity/")) return PATH.activities;
  switch (pathname) {
    case "/imagine": return PATH.entry;
    case "/experience": return session.route === "free" ? PATH.imagine : PATH.dimensions;
    case "/dimensions": return PATH.entry;
    case "/activities": return session.route === "free" ? PATH.experience : PATH.dimensions;
    case "/institution": return PATH.activities;
    case "/profile": return PATH.institution;
    case "/reflection": return PATH.profile;
    default: return PATH.entry;
  }
}

// Returns a path to send the participant to instead, or null when the screen may be opened.
export function guard(session, pathname) {
  if (pathname === "/") return null;
  if (!session.route) return PATH.entry;
  const free = session.route === "free";
  if (free && (pathname === "/dimensions" || pathname.startsWith("/dimension/"))) return PATH.imagine;
  if (!free && (pathname === "/imagine" || pathname === "/experience")) return PATH.dimensions;
  if (free && pathname !== "/imagine" && !hasText(session.free.text)) return PATH.imagine;
  if (pathname === "/activities" || pathname.startsWith("/activity/")) {
    if (!free && !requiredDimensionsDone(session)) return PATH.dimensions;
  }
  if (pathname === "/institution" || pathname === "/profile" || pathname === "/reflection" || pathname === "/done") {
    if (!allocationDone(session)) return PATH.activities;
  }
  if ((pathname === "/reflection" || pathname === "/done") && !profileApproved(session)) return PATH.profile;
  if (pathname === "/done" && !session.completedAt) return PATH.reflection;
  return null;
}
