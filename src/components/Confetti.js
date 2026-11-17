// A burst of little four-point stars in the palette colours. Pure DOM + Web Animations, removed when finished.
import { reducedMotion } from "../hooks/motion.js";

const COLORS = ["#ffabc8", "#fc4109", "#e7bfff", "#5d9dc5", "#e3b866", "#f4efe8"];
const STAR = "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)";

export function burst(origin, { count = 26, spread = 1 } = {}) {
  if (reducedMotion()) return;
  const r = origin instanceof Element ? origin.getBoundingClientRect() : null;
  const x = r ? r.left + r.width / 2 : origin?.x ?? innerWidth / 2;
  const y = r ? r.top + r.height / 2 : origin?.y ?? innerHeight / 3;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    const size = 8 + Math.random() * 14;
    Object.assign(s.style, { position: "fixed", left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px`, background: COLORS[i % COLORS.length], clipPath: STAR, pointerEvents: "none", zIndex: 200, willChange: "transform, opacity" });
    s.setAttribute("aria-hidden", "true");
    document.body.append(s);
    const ang = Math.random() * Math.PI * 2; const dist = (80 + Math.random() * 180) * spread;
    const dx = Math.cos(ang) * dist; const dy = Math.sin(ang) * dist - 40; const rot = (Math.random() - 0.5) * 720;
    s.animate([
      { transform: "translate(-50%, -50%) scale(0) rotate(0)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx * 0.7}px), calc(-50% + ${dy * 0.7}px)) scale(1) rotate(${rot * 0.6}deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 120}px)) scale(0.4) rotate(${rot}deg)`, opacity: 0 },
    ], { duration: 900 + Math.random() * 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }).finished.then(() => s.remove()).catch(() => s.remove());
  }
}
