import { useCallback } from "react";
import { useSession } from "../state/SessionContext.jsx";
import { dimOf, newDimension } from "../state/model.js";

// Read and edit one dimension's answers: const [d, edit] = useDim("governance"); edit(x => { x.picks.push(...) })
export function useDim(id) {
  const { session, update } = useSession();
  const d = dimOf(session, id);
  const edit = useCallback((fn) => update((s) => { s.dims[id] ??= newDimension(); fn(s.dims[id]); }), [update, id]);
  return [d, edit];
}
