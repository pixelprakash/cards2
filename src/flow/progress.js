// How far through the whole journey someone is, from 0 to 1, for the thin bar at the top. It is a feeling of progress, not a score.
import { DIMENSIONS } from "../config/dimensions.js";
import { allocationDone, allocationTotal, dimState, profileApproved } from "./validate.js";
import { STAGE_RANK, stageOfPath } from "./flow.js";
import { hasText } from "../state/model.js";

export function progress(session, pathname) {
  if (!session.route) return 0.02;
  const stage = stageOfPath(pathname);
  if (stage === "done") return 1;
  let inner = 0;
  if (stage === "dimensions") {
    if (session.route === "free") inner = hasText(session.free.text) ? (pathname === "/experience" ? 0.7 : 0.4) : 0.1;
    else { const req = DIMENSIONS.filter((d) => d.required); inner = req.filter((d) => dimState(session, d) === "done").length / req.length; }
  } else if (stage === "activities") inner = allocationDone(session) ? 0.9 : allocationTotal(session.activities.allocation) > 0 ? 0.5 : 0.1;
  else if (stage === "institution") inner = profileApproved(session) ? 1 : pathname === "/profile" ? 0.6 : 0.2;
  else if (stage === "reflection") inner = 0.5;
  return Math.min(1, (STAGE_RANK[stage] + inner) / 5);
}
