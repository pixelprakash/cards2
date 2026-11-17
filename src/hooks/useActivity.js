import { useCallback } from "react";
import { useSession } from "../state/SessionContext.jsx";

export function useActivity(id) {
  const { session, update } = useSession();
  const edit = useCallback((fn) => update((s) => { fn(s.activities[id]); }), [update, id]);
  return [session.activities[id], edit];
}
