import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { newSession } from "./model.js";
import { clearSession, loadSession, saveSession } from "./storage.js";
import { syncSession } from "./sync.js";

const Ctx = createContext(null);
export const useSession = () => useContext(Ctx);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => loadSession() ?? newSession());
  const [resumable] = useState(() => {
    const s = loadSession();
    return s && s.route && !s.completedAt ? s : null;   // offered once on the entry screen
  });
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // update(draft => { draft.x = 1 }): edits a copy so React sees a new object.
  const update = useCallback((fn) => {
    setSession((prev) => {
      const next = structuredClone(prev);
      fn(next);
      next.updatedAt = new Date().toISOString();
      return next;
    });
  }, []);

  const reset = useCallback(() => { clearSession(); setSession(newSession()); }, []);

  // Keep the browser copy current.
  useEffect(() => {
    const t = setTimeout(() => saveSession(session), 250);
    return () => clearTimeout(t);
  }, [session]);

  // Send to the researchers when a new stage is reached, on completion, and when the tab is closed.
  const lastSent = useRef("");
  useEffect(() => {
    if (!session.route) return;
    const mark = `${session.furthest}|${session.completedAt ?? ""}`;
    if (mark === lastSent.current) return;
    lastSent.current = mark;
    syncSession(session);
  }, [session]);

  useEffect(() => {
    const flush = () => { if (sessionRef.current.route) syncSession(sessionRef.current, { beacon: true }); };
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  const value = useMemo(() => ({ session, update, reset, resumable }), [session, update, reset, resumable]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
