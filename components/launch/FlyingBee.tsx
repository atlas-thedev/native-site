"use client";

import { useEffect, useId, useRef } from "react";

/**
 * A cartoon bee that actually flies: wanders on a smooth organic path, always faces where it's going,
 * banks into turns, bobs, does the odd loop-de-loop, dodges the cursor and leaves a dotted buzz trail.
 * Everything is driven by one rAF loop that writes transforms straight to the DOM (no React re-renders).
 */

const TRAIL = 22;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function BeeArt({ className = "" }: { className?: string }) {
  const clip = `bee-clip-${useId().replace(/:/g, "")}`;
  const ink = { stroke: "var(--fg)", strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 96 80" className={className} aria-hidden overflow="visible">
      {/* back wing */}
      <g className="bee-wing bee-wing-back">
        <path d="M44 34 C30 10 44 2 52 12 C58 20 54 30 48 35 Z" fill="color-mix(in srgb, var(--bg) 70%, transparent)" {...ink} />
      </g>
      {/* dangling legs */}
      <g className="bee-legs">
        <path d="M38 58 l-3 8 M48 60 l-2 8 M58 58 l0 8" fill="none" {...ink} />
      </g>
      {/* stinger */}
      <path d="M17 44 L6 46 L17 50 Z" fill="var(--fg)" {...ink} strokeWidth={2} />
      {/* body */}
      <ellipse cx="44" cy="46" rx="28" ry="17" fill="var(--bg)" {...ink} />
      <clipPath id={clip}><ellipse cx="44" cy="46" rx="26.5" ry="15.5" /></clipPath>
      <g clipPath={`url(#${clip})`} fill="var(--fg)">
        <rect x="26" y="26" width="7" height="40" />
        <rect x="40" y="26" width="7" height="40" />
        <rect x="54" y="26" width="5" height="40" />
      </g>
      {/* head */}
      <circle cx="72" cy="40" r="14" fill="var(--bg)" {...ink} />
      {/* antennae */}
      <g className="bee-antenna">
        <path d="M70 27 C68 18 62 15 58 15" fill="none" {...ink} />
        <circle cx="57" cy="15" r="3" fill="var(--fg)" />
        <path d="M76 27 C78 17 84 14 88 15" fill="none" {...ink} />
        <circle cx="89" cy="15" r="3" fill="var(--fg)" />
      </g>
      {/* face */}
      <g className="bee-eye">
        <ellipse cx="77" cy="38" rx="3.4" ry="4.4" fill="var(--fg)" />
        <circle cx="78.2" cy="36.4" r="1.2" fill="var(--bg)" />
      </g>
      <ellipse cx="80" cy="45.5" rx="3" ry="1.8" fill="var(--fg)" opacity=".18" />
      <path d="M71 46 C73 49.5 77 49.5 79 47" fill="none" {...ink} strokeWidth={2.4} />
      {/* front wing */}
      <g className="bee-wing bee-wing-front">
        <path d="M50 33 C44 6 62 0 66 12 C69 21 62 30 54 34 Z" fill="color-mix(in srgb, var(--bg) 82%, transparent)" {...ink} />
        <path d="M55 16 C57 13 60 13 61 15" fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" opacity=".5" />
      </g>
    </svg>
  );
}

type Props = {
  /** Size of the bee in px. */
  size?: number;
  /** Flight box inside the parent, as fractions [x0, y0, x1, y1]. */
  area?: [number, number, number, number];
  /** Phase offset so two bees don't fly in sync. */
  seed?: number;
  className?: string;
};

export default function FlyingBee({ size = 60, area = [0.06, 0.08, 0.94, 0.55], seed = 0, className = "" }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const bee = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);

  const areaKey = area.join(",");
  useEffect(() => {
    const el0 = box.current, b0 = bee.current, inner0 = body.current;
    if (!el0 || !b0 || !inner0) return;
    const el: HTMLDivElement = el0, b: HTMLDivElement = b0, inner: HTMLDivElement = inner0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = el.clientWidth;
    let h = el.clientHeight;
    const ro = new ResizeObserver(() => { w = el.clientWidth; h = el.clientHeight; });
    ro.observe(el);

    const [x0, y0, x1, y1] = areaKey.split(",").map(Number);
    const place = (t: number) => {
      // Layered sines = a lazy, never-repeating wander.
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
      const fx = 0.72 * Math.sin(t * 0.19 + seed) + 0.28 * Math.sin(t * 0.47 + seed * 2.1);
      const fy = 0.6 * Math.sin(t * 0.31 + seed * 1.3) + 0.3 * Math.sin(t * 0.83 + seed) + 0.1 * Math.sin(t * 2.3);
      return { x: (cx + rx * fx) * w, y: (cy + ry * fy) * h };
    };

    if (reduce) {
      const p = place(1);
      b.style.transform = `translate3d(${p.x - size / 2}px, ${p.y - size / 2}px, 0)`;
      b.style.opacity = "1";
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let t = seed * 7;
    let px = 0, py = 0, first = true;
    let face = 1, faceShown = 1;
    let tilt = 0;
    let dodgeX = 0, dodgeY = 0, dodgeVX = 0, dodgeVY = 0;
    let loopAt = 6 + (seed % 3) * 2, loopT = -1;
    const mouse = { x: -9999, y: -9999 };
    const trail: { x: number; y: number }[] = [];
    let trailTick = 0;
    let visible = true;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { last = performance.now(); raf = requestAnimationFrame(frame); } });
    io.observe(el);

    function frame(now: number) {
      if (!visible || document.hidden) { raf = 0; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      let { x, y } = place(t);

      // Loop-de-loop every so often.
      if (loopT < 0 && t > loopAt) loopT = 0;
      if (loopT >= 0) {
        loopT += dt / 1.3;
        const a = loopT * Math.PI * 2;
        const r = size * 0.7 * Math.sin(Math.min(1, loopT) * Math.PI);
        x += Math.sin(a) * r * face;
        y += -(1 - Math.cos(a)) * r * 0.8;
        if (loopT >= 1) { loopT = -1; loopAt = t + 9 + Math.random() * 8; }
      }

      // Dodge the cursor with a springy push.
      const dx = x + dodgeX - mouse.x, dy = y + dodgeY - mouse.y;
      const dist = Math.hypot(dx, dy);
      const reach = size * 2.4;
      if (dist < reach && dist > 0.01) {
        const push = (1 - dist / reach) * 2600;
        dodgeVX += (dx / dist) * push * dt;
        dodgeVY += (dy / dist) * push * dt;
      }
      dodgeVX += -dodgeX * 9 * dt; dodgeVY += -dodgeY * 9 * dt;
      dodgeVX *= Math.pow(0.04, dt); dodgeVY *= Math.pow(0.04, dt);
      dodgeX += dodgeVX * dt; dodgeY += dodgeVY * dt;
      x = clamp(x + dodgeX, size * 0.5, w - size * 0.5);
      y = clamp(y + dodgeY, size * 0.5, h - size * 0.5);

      // Hover jitter: tiny fast bob like a real bee.
      const bob = Math.sin(t * 15) * 1.6 + Math.sin(t * 23) * 0.8;

      if (first) { px = x; py = y; first = false; }
      const vx = (x - px) / Math.max(dt, 1e-3);
      const vy = (y - py) / Math.max(dt, 1e-3);
      px = x; py = y;

      // Face the direction of travel (with hysteresis), turn smoothly through 0 like a real turnaround.
      if (vx > 18) face = 1; else if (vx < -18) face = -1;
      faceShown += (face - faceShown) * Math.min(1, dt * 9);
      // Bank: nose dips when diving, lifts when climbing.
      const targetTilt = clamp(vy * 0.06, -22, 22) * Math.sign(faceShown || 1);
      tilt += (targetTilt - tilt) * Math.min(1, dt * 6);

      b.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2 + bob}px, 0)`;
      inner.style.transform = `scaleX(${faceShown.toFixed(3)}) rotate(${tilt.toFixed(2)}deg)`;
      const speed = Math.hypot(vx, vy);
      inner.style.setProperty("--flap", `${clamp(90 - speed * 0.12, 45, 90)}ms`);

      // Dotted trail from the stinger.
      trailTick += dt;
      if (trailTick > 0.045) {
        trailTick = 0;
        trail.unshift({ x: x - face * size * 0.42, y: y + size * 0.08 + bob });
        if (trail.length > TRAIL) trail.pop();
      }
      for (let i = 0; i < TRAIL; i++) {
        const d = dots.current[i];
        const p = trail[i];
        if (!d) continue;
        if (!p || i % 2) { d.style.opacity = "0"; continue; }
        d.style.transform = `translate3d(${p.x - 2}px, ${p.y - 2}px, 0)`;
        d.style.opacity = String((1 - i / TRAIL) * 0.45);
      }
      raf = requestAnimationFrame(frame);
    }
    b.style.opacity = "1";
    raf = requestAnimationFrame(frame);
    const onVis = () => { if (!document.hidden && !raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [size, seed, areaKey]);

  return (
    <div ref={box} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {Array.from({ length: TRAIL }, (_, i) => (
        <span key={i} ref={(n) => { dots.current[i] = n; }} className="absolute left-0 top-0 h-1 w-1 rounded-full bg-fg opacity-0" />
      ))}
      <div ref={bee} className="absolute left-0 top-0 opacity-0 transition-opacity duration-700" style={{ width: size, height: size }}>
        <div ref={body} className="h-full w-full will-change-transform">
          <BeeArt className="bee h-full w-full" />
        </div>
      </div>
    </div>
  );
}
