"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent } from "react";
import { useLaunch } from "./launch/LaunchContext";

/**
 * Halloween mode (turned on from the launcher admin panel): a candle light that follows the cursor,
 * randomly placed cartoon & pixel spiders you can drop, pumpkins that burst into candy, and drifting fog.
 */


const CANDY = ["🍬", "🍭", "👻", "🦇", "🎃", "🕷️"];


function Pumpkin() {
  return (
    <svg viewBox="0 0 64 60" width="100%" height="100%">
      <ellipse cx="20" cy="37" rx="14" ry="20" fill="#d9560b" />
      <ellipse cx="44" cy="37" rx="14" ry="20" fill="#d9560b" />
      <ellipse cx="32" cy="37" rx="15" ry="22" fill="#ff7a18" />
      <ellipse className="hw-pumpkin-opening" cx="32" cy="21" rx="22" ry="6" fill="#301009" />
      <g className="hw-pumpkin-lid">
        <path d="M10 22C14 8 50 8 54 22Q32 17 10 22" fill="#ff8a2b" stroke="#d9560b" strokeWidth="1" />
        <path d="M31 12c0-5 3-9 8-9" stroke="#4d7c23" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <path className="hw-face" d="M19 31l7-7 4 8zM45 31l-7-7-4 8zM17 42c6 7 24 7 30 0l-4 3-3-3-4 4-4-4-4 4-4-4-3 3z" fill="#ffd36b" />
    </svg>
  );
}


type SpiderKind = "cute" | "pixel";
type SpiderSpec = { id: number; x: number; hang: number; drop: number; kind: SpiderKind; size: number; tint: number; sway: number; delay: number; flip: boolean };

const TINTS = [
  { body: "#7b4fd6", shade: "#3d2370", glow: "#a78bfa", eye: "#ffb347" },
  { body: "#f0701c", shade: "#8a3608", glow: "#ff9a3c", eye: "#9cff57" },
  { body: "#43b54c", shade: "#1d5e24", glow: "#9cff57", eye: "#ff3b6b" },
  { body: "#e0508f", shade: "#7a1f4a", glow: "#ff8cc0", eye: "#fff27a" },
  { body: "#33263f", shade: "#120a1a", glow: "#c4b5fd", eye: "#ff3b3b" },
];

function CuteSpider({ tint, size }: { tint: number; size: number }) {
  const c = TINTS[tint];
  return (
    <svg viewBox="0 0 64 56" width={size} height={size * 0.875} style={{ "--glow": c.glow } as CSSProperties}>
      <g className="hw-legs" stroke={c.shade} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 26Q12 14 5 18M21 31Q9 26 3 33M22 36Q11 38 7 48M25 40Q19 47 17 54" />
        <path d="M42 26Q52 14 59 18M43 31Q55 26 61 33M42 36Q53 38 57 48M39 40Q45 47 47 54" />
      </g>
      <circle cx="32" cy="32" r="15" fill={c.body} />
      <ellipse cx="26" cy="24" rx="5" ry="3" fill="#fff" opacity=".14" transform="rotate(-25 26 24)" />
      <g className="hw-eyes">
        <circle cx="26" cy="30" r="5.4" fill="#fff" />
        <circle cx="38" cy="30" r="5.4" fill="#fff" />
        <circle className="hw-pupil" cx="27" cy="31" r="2.8" fill="#12081c" />
        <circle className="hw-pupil" cx="37" cy="31" r="2.8" fill="#12081c" />
        <circle cx="28" cy="29.6" r="1" fill="#fff" />
        <circle cx="38" cy="29.6" r="1" fill="#fff" />
      </g>
      <ellipse cx="21.5" cy="37.5" rx="2.6" ry="1.5" fill="#ff7aa8" opacity=".6" />
      <ellipse cx="42.5" cy="37.5" rx="2.6" ry="1.5" fill="#ff7aa8" opacity=".6" />
      <path d="M28.5 38.5q3.5 3 7 0" stroke="#fff" strokeOpacity=".85" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M30 40.6l.8 2 .8-1.6M33.2 40.6l.8 2 .8-1.6" stroke="#fff" strokeWidth=".9" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

const PIXEL_MAP = [
  "L...........L",
  ".L..BBBBB..L.",
  "..LBBBBBBBL..",
  "LLLBEEBEEBLLL",
  "...BHBBBBBB..",
  "..LBBFBFBBL..",
  ".L.LBBBBBL.L.",
  "L..L.BBB.L..L",
  "...L.....L...",
  "..L.......L..",
];

function PixelSpider({ tint, size }: { tint: number; size: number }) {
  const c = TINTS[tint];
  const fill: Record<string, string> = { L: c.shade, B: c.body, E: c.eye, H: "#ffffff40", F: "#f4f0ff" };
  return (
    <svg viewBox="0 0 13 10" width={size} height={size * 10 / 13} shapeRendering="crispEdges" style={{ "--glow": c.glow } as CSSProperties}>
      {PIXEL_MAP.flatMap((row, y) => [...row].map((ch, x) => ch === "." ? null : (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill[ch]} className={ch === "L" ? "hw-px-leg" : undefined} />
      )))}
    </svg>
  );
}

/** Random layout, made on the client so server HTML never mismatches. */
function makeSpiders(): SpiderSpec[] {
  const narrow = window.innerWidth < 700;
  const count = narrow ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
  const gap = narrow ? 22 : 11;
  const xs: number[] = [];
  for (let tries = 0; xs.length < count && tries < 200; tries++) {
    const x = 3 + Math.random() * 92;
    if (xs.every((o) => Math.abs(o - x) > gap)) xs.push(x);
  }
  return xs.map((x, id) => {
    const kind: SpiderKind = Math.random() < 0.5 ? "cute" : "pixel";
    const hang = Math.round((narrow ? 18 : 22) + Math.random() * (narrow ? 70 : 120));
    return {
      id, x, hang, kind,
      drop: hang + Math.round(130 + Math.random() * (narrow ? 70 : 160)),
      size: Math.round((kind === "cute" ? (narrow ? 44 : 50) : (narrow ? 40 : 46)) + Math.random() * 18),
      tint: Math.floor(Math.random() * TINTS.length),
      sway: 2 + Math.random() * 2.4,
      delay: -Math.random() * 3,
      flip: Math.random() < 0.5,
    };
  });
}

/** Decorative threads never intercept links; only the spider itself is clickable. */
function HangingSpider({ spec, inactive }: { spec: SpiderSpec; inactive: boolean }) {
  const [down, setDown] = useState(false);
  const body = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!down) return;
    const timer = window.setTimeout(() => setDown(false), 1800);
    return () => window.clearTimeout(timer);
  }, [down]);
  useEffect(() => { if (inactive) setDown(false); }, [inactive]);
  const move = (event: RPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-8, Math.min(8, (event.clientX - rect.left - rect.width / 2) * 0.3));
    body.current?.style.setProperty("--peek", `${x}px`);
  };
  const style = { left: `${spec.x}%`, "--hw-hang": `${spec.hang}px`, "--hw-drop": `${spec.drop}px`, "--hw-sway": `${spec.sway}s`, "--hw-delay": `${spec.delay}s` } as CSSProperties;
  return (
    <div className={`hw-spider hw-spider-${spec.kind}${spec.flip ? " is-flip" : ""}${down ? " is-down" : ""}`} style={style} data-spider-kind={spec.kind}>
      <span className="hw-thread" aria-hidden />
      <button ref={body} type="button" className="hw-spider-body" aria-pressed={down}
        aria-label={`${down ? "Retract" : "Drop"} Halloween spider ${spec.id + 1}`}
        title={down ? "I'll climb back up in a moment" : "Click to drop me down"}
        onClick={() => setDown((value) => !value)} onPointerMove={move}
        onPointerLeave={() => body.current?.style.removeProperty("--peek")}
        onKeyDown={(event) => { if (event.key === "Escape") setDown(false); }}>
        {spec.kind === "cute" ? <CuteSpider tint={spec.tint} size={spec.size} /> : <PixelSpider tint={spec.tint} size={spec.size} />}
      </button>
    </div>
  );
}

/** Anchor decorations inside the actual navbar so sticky/hide motion stays in sync. */
export function HalloweenSpiders({ hidden, menuOpen }: { hidden: boolean; menuOpen: boolean }) {
  const { theme } = useLaunch();
  const [spiders, setSpiders] = useState<SpiderSpec[]>([]);
  const on = Boolean(theme?.halloween);
  useEffect(() => { if (on) setSpiders(makeSpiders()); }, [on]);
  if (!on) return null;
  const inactive = hidden || menuOpen;
  return (
    <div className="hw-spiders" inert={inactive} aria-hidden={inactive || undefined}>
      {spiders.map((spec) => <HangingSpider key={spec.id} spec={spec} inactive={inactive} />)}
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
        <button type="button" className="hw-pumpkin hw-pumpkin-0" onClick={pop} aria-label="Click the pumpkin">
          <Pumpkin />
        </button>
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
