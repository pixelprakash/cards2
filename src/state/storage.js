// Save and resume lives in this browser only (localStorage). Failures are ignored: the experience works without it.
import { newSession } from "./model.js";

const KEY = "lid.session.v1";

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.v === 1 && typeof s.id === "string" ? { ...newSession(), ...s } : null;
  } catch { return null; }
}

export function saveSession(session) {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* private mode or full: ignore */ }
}

export function clearSession() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
