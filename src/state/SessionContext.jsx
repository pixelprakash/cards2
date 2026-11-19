import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { newSession } from "./model.js";
import { clearSession, loadSession, saveSession } from "./storage.js";
import { needsSync, syncSession } from "./sync.js";
import { flushWithdrawals } from "./withdraw.js";

const Ctx = createContext(null);
export const useSession = () => useContext(Ctx);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => loadSession() ?? newSession());
  const [resumable] = useState(() => {
    const s = loadSession();
    return s && s.route && !s.completedAt ? s : null;   // offered once on the entry screen
  });
  useEffect(() => { flushWithdrawals(); }, []);   // finish any earlier withdrawal that did not reach the server
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

  // Send to the researchers when a new stage is reached and on completion. If that fails (offline, busy server) it is
  // retried with growing pauses, when the connection returns, when the tab is shown again and on the next visit.
  // `pending` is true while the last send failed, so the screens can say so instead of pretending all is well.
  const [pending, setPending] = useState(false);
  const tries = useRef(0);
  const timer = useRef(null);
  const push = useCallback(async () => {
    clearTimeout(timer.current);
    const s = sessionRef.current;
    if (!needsSync(s)) { setPending(false); return; }
    const result = await syncSession(s);
    if (result === "retry") {
      setPending(true);
      const pause = [4, 12, 30, 60, 120, 300][tries.current++];
      if (pause) timer.current = setTimeout(push, pause * 1000);
    } else { tries.current = 0; setPending(false); }
  }, []);

  const lastSent = useRef("");
  useEffect(() => {
    if (!session.route) return;
    const mark = `${session.furthest}|${session.completedAt ?? ""}`;
    if (mark === lastSent.current) return;
    lastSent.current = mark;
    tries.current = 0;
    push();
  }, [session, push]);

  useEffect(() => { push(); return () => clearTimeout(timer.current); }, [push]);   // anything left unsent from an earlier visit

  useEffect(() => {
    // Leaving the tab sends one last copy, but only if something changed since the last copy sent: phones switch apps
    // constantly, and a whole class often shares one network address, so repeats would only add load.
    const lastBeacon = { at: "" };
    const flush = () => {
      const s = sessionRef.current;
      if (!s.route || !needsSync(s) || lastBeacon.at === s.updatedAt) return;
      lastBeacon.at = s.updatedAt;
      syncSession(s, { beacon: true });
    };
    const onVis = () => { if (document.visibilityState === "hidden") flush(); else if (needsSync(sessionRef.current)) { tries.current = 0; push(); } };
    const onOnline = () => { tries.current = 0; push(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", onOnline);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("online", onOnline); };
  }, [push]);

  const value = useMemo(() => ({ session, update, reset, resumable, pending }), [session, update, reset, resumable, pending]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
