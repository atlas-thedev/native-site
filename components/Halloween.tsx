"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent } from "react";
import { useLaunch } from "./launch/LaunchContext";

/**
 * Halloween mode (turned on from the launcher admin panel): a candle light that follows the cursor,
 * interactive spiders you can drop and retract, pumpkins that burst into candy, and drifting fog.
 */


const CANDY = ["🍬", "🍭", "👻", "🦇", "🎃", "🕷️"];


function Pumpkin() {
  return (
    <svg viewBox="0 0 64 60" width="100%" height="100%">
      <path d="M31 12c0-5 3-9 8-9" stroke="#4d7c23" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="37" rx="14" ry="20" fill="#d9560b" />
      <ellipse cx="44" cy="37" rx="14" ry="20" fill="#d9560b" />
      <ellipse cx="32" cy="37" rx="15" ry="22" fill="#ff7a18" />
      <path className="hw-face" d="M19 31l7-7 4 8zM45 31l-7-7-4 8zM17 42c6 7 24 7 30 0l-4 3-3-3-4 4-4-4-4 4-4-4-3 3z" fill="#ffd36b" />
    </svg>
  );
}


function Spider() {
  return (
    <svg viewBox="0 0 40 36" width="34" height="30">
      <g stroke="#1b0f26" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M14 16L4 8M14 19L2 18M14 22L4 30M15 24L9 34M26 16l10-8M26 19l12-1M26 22l10 8M25 24l6 10" />
      </g>
      <ellipse cx="20" cy="21" rx="8" ry="9" fill="#1b0f26" stroke="#8b5cf6" strokeOpacity=".6" />
      <circle cx="20" cy="11" r="5" fill="#1b0f26" />
      <circle cx="18" cy="10" r="1.3" fill="#ff3b3b" />
      <circle cx="22" cy="10" r="1.3" fill="#ff3b3b" />
    </svg>
  );
}

/** Decorative threads never intercept links; only the spider itself is clickable. */
function HangingSpider({ side }: { side: "left" | "right" }) {
  const [down, setDown] = useState(false);
  const body = useRef<HTMLButtonElement>(null);
  const move = (event: RPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-8, Math.min(8, (event.clientX - rect.left - rect.width / 2) * 0.3));
    body.current?.style.setProperty("--peek", `${x}px`);
  };
  return (
    <div className={`hw-spider hw-spider-${side}${down ? " is-down" : ""}`}>
      <span className="hw-thread" aria-hidden />
      <button ref={body} type="button" className="hw-spider-body" aria-pressed={down}
        aria-label={`${down ? "Retract" : "Drop"} the ${side} Halloween spider`}
        title={down ? "Click to pull me up" : "Click to drop me down"}
        onClick={() => setDown((value) => !value)} onPointerMove={move}
        onPointerLeave={() => body.current?.style.removeProperty("--peek")}
        onKeyDown={(event) => { if (event.key === "Escape") setDown(false); }}>
        <Spider />
      </button>
    </div>
  );
}

/** Anchor decorations inside the actual navbar so sticky/hide motion stays in sync. */
export function HalloweenSpiders({ hidden, menuOpen }: { hidden: boolean; menuOpen: boolean }) {
  const { theme } = useLaunch();
  if (!theme?.halloween) return null;
  const inactive = hidden || menuOpen;
  return (
    <div className="hw-spiders" inert={inactive} aria-hidden={inactive || undefined}>
      <HangingSpider side="left" />
      <HangingSpider side="right" />
    </div>
  );
}

type Burst = { id: number; x: number; y: number; particles: { angle: number; distance: number }[] };

/** Follow the live admin setting rather than a stale server-rendered mount decision. */
export default function Halloween() {
  const { theme } = useLaunch();
  const enabled = Boolean(theme?.halloween);
  useEffect(() => {
    if (enabled) document.body.setAttribute("data-halloween", "on");
    else document.body.removeAttribute("data-halloween");
    return () => document.body.removeAttribute("data-halloween");
  }, [enabled]);
  return enabled ? <HalloweenEffects /> : null;
}

function HalloweenEffects() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const lightRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Set<number>>(new Set());

  // Keep Halloween dark, then restore the visitor's theme when admin disables it.
  useEffect(() => {
    const root = document.documentElement;
    let previous = root.getAttribute("data-theme");
    try { previous = localStorage.getItem("theme") || previous; } catch { /* private mode */ }
    const force = () => { if (root.getAttribute("data-theme") === "light") root.removeAttribute("data-theme"); };
    force();
    const watch = new MutationObserver(force);
    watch.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    root.setAttribute("data-halloween-fx", "");
    return () => {
      watch.disconnect();
      root.removeAttribute("data-halloween-fx");
      if (previous === "light") root.setAttribute("data-theme", "light");
    };
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      lightRef.current?.style.setProperty("--mx", `${event.clientX}px`);
      lightRef.current?.style.setProperty("--my", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => { pending.forEach((id) => window.clearTimeout(id)); pending.clear(); };
  }, []);

  const pop = (event: RMouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
    const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;
    const particles = Array.from({ length: 16 }, (_, i) => ({ angle: i * 360 / 16 + Math.random() * 12, distance: 70 + Math.random() * 80 }));
    setBursts((list) => [...list.slice(-7), { id, x, y, particles }]);
    const timer = window.setTimeout(() => {
      setBursts((list) => list.filter((burst) => burst.id !== id));
      timers.current.delete(timer);
    }, 1300);
    timers.current.add(timer);
  };

  return (
    <>
      <div className="hw-layer" aria-hidden>
        <div ref={lightRef} className="hw-light" />
        <div className="hw-fog"><i /><i /></div>
      </div>
      <div className="hw-pumpkins">
        {[0, 1].map((i) => (
          <button key={i} type="button" className={`hw-pumpkin hw-pumpkin-${i}`} onClick={pop} aria-label="Click the pumpkin">
            <Pumpkin />
          </button>
        ))}
      </div>
      {bursts.map((burst) => (
        <div key={burst.id} className="hw-burst" style={{ left: burst.x, top: burst.y }} aria-hidden>
          {burst.particles.map((particle, i) => (
            <i key={i} style={{ "--a": `${particle.angle}deg`, "--d": `${particle.distance}px` } as CSSProperties}>{CANDY[i % CANDY.length]}</i>
          ))}
        </div>
      ))}
    </>
  );
}
