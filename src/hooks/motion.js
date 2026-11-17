// Small helpers for motion. Everything animated in JS checks reducedMotion() first, so people who ask their device
// for less motion get none of it (CSS animations are switched off in base.css the same way).
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => typeof matchMedia === "function" && matchMedia("(hover: hover) and (pointer: fine)").matches;

// A short buzz on touch devices for the moments that deserve it. Does nothing where unsupported.
export const haptic = (ms = 8) => { if (!reducedMotion() && navigator.vibrate) { try { navigator.vibrate(ms); } catch { /* ignore */ } } };

// Textareas grow with what is typed.
export function useAutoGrow(ref, value) {
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [ref, value]);
}

// Count up to a number (dashboard figures). Returns the number to show right now.
export function useCountUp(target, ms = 900) {
  const [v, setV] = useState(reducedMotion() ? target : 0);
  const from = useRef(0);
  useEffect(() => {
    if (reducedMotion()) { setV(target); return undefined; }
    const start = performance.now(); const a = from.current; let raf;
    const tick = (t) => { const k = Math.min(1, (t - start) / ms); const e = 1 - (1 - k) ** 3; setV(a + (target - a) * e); if (k < 1) raf = requestAnimationFrame(tick); else from.current = target; };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

// FLIP: when the order of children changes, slide each one from where it was to where it is now.
export function useFlip(containerRef, orderKey) {
  const rects = useRef(new Map());
  useLayoutEffect(() => {
    const root = containerRef.current; if (!root) return;
    const kids = [...root.querySelectorAll("[data-flip]")];
    const next = new Map(kids.map((k) => [k.dataset.flip, k.getBoundingClientRect()]));
    if (!reducedMotion()) {
      kids.forEach((k) => {
        const was = rects.current.get(k.dataset.flip); const now = next.get(k.dataset.flip);
        if (was && Math.abs(was.top - now.top) > 1) k.animate([{ transform: `translateY(${was.top - now.top}px)` }, { transform: "none" }], { duration: 320, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      });
    }
    rects.current = next;
  }, [containerRef, orderKey]);
}

// Cards that lean toward the pointer, with a soft light that follows it. Fine pointers only.
export function useTilt(ref, { max = 7 } = {}) {
  useEffect(() => {
    const el = ref.current; if (!el || reducedMotion() || !finePointer()) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(x - 0.5) * 2 * max}deg`); el.style.setProperty("--rx", `${(0.5 - y) * 2 * max}deg`);
      el.style.setProperty("--gx", `${x * 100}%`); el.style.setProperty("--gy", `${y * 100}%`);
    };
    const leave = () => { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [ref, max]);
}

// A faint pink glow that trails the pointer across the page. Fine pointers only.
export function usePointerGlow() {
  useEffect(() => {
    if (reducedMotion() || !finePointer()) return undefined;
    let raf = 0; let x = 50; let y = 20;
    const move = (e) => { x = (e.clientX / innerWidth) * 100; y = (e.clientY / innerHeight) * 100; if (!raf) raf = requestAnimationFrame(() => { raf = 0; document.documentElement.style.setProperty("--gx", `${x}%`); document.documentElement.style.setProperty("--gy", `${y}%`); document.documentElement.style.setProperty("--mx", String((x / 100 - 0.5) * 2)); document.documentElement.style.setProperty("--my", String((y / 100 - 0.5) * 2)); }); };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);
}
