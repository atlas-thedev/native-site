"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as RMouseEvent } from "react";
import { useLaunch } from "./launch/LaunchContext";

/**
 * Halloween mode (turned on from the launcher admin panel): a candle light that follows the cursor,
 * cartoon & pixel spiders on living silk (they swing, watch the cursor and wander) that you can drop, pumpkins that burst into candy, and drifting fog.
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
      <line x1="32" y1="0" x2="32" y2="18" stroke="rgba(240, 235, 255, 0.9)" strokeWidth="1.6" strokeLinecap="round" />
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
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill[ch]} className={ch === "L" ? "hw-px-leg" : ch === "E" ? "hw-px-eye" : undefined} />
      )))}
    </svg>
  );
}

/** Random looks, made on the client so server HTML never mismatches. Few spiders, parked at the ends of the
 * navbar on short threads so they never hang over what people are reading. */
function makeSpiders(): SpiderSpec[] {
  const narrow = window.innerWidth < 700;
  const xs = narrow ? [94 - Math.random() * 3] : [3 + Math.random() * 4, 93 + Math.random() * 4];
  return xs.map((x, id) => {
    const kind: SpiderKind = Math.random() < 0.5 ? "cute" : "pixel";
    const hang = Math.round(14 + Math.random() * 22);
    return {
      id, x, hang, kind,
      drop: hang + Math.round(110 + Math.random() * 90),
      size: Math.round((kind === "cute" ? 38 : 34) + Math.random() * 8),
      tint: Math.floor(Math.random() * TINTS.length),
      sway: 2 + Math.random() * 2.4,
      delay: -Math.random() * 3,
      flip: id === 1,
    };
  });
}

/* ── Living silk ──────────────────────────────────────────────────────
 * Every thread is a little rope (verlet points) hanging from the bottom of the navbar with the spider as its
 * heavy end. The spiders stay put and just sway a little and watch the cursor; a click drops one on a bungee
 * bounce and it climbs back up a moment later.
 */
const SEG = 12;
const GRAVITY = 1500; // px/s²
const STEP = 1 / 60;
const CLIMB = 85; // px/s when climbing back up

type Strand = {
  ax: number; // anchor x (px in the host)
  x: Float32Array; y: Float32Array; px: Float32Array; py: Float32Array;
  len: number; lenV: number; target: number;
  down: boolean; upAt: number; bobUntil: number;
  hover: boolean; moving: boolean; flip: boolean;
};

function makeStrand(ax: number, len: number, flip: boolean): Strand {
  const n = SEG + 1;
  const s: Strand = {
    ax, x: new Float32Array(n), y: new Float32Array(n), px: new Float32Array(n), py: new Float32Array(n),
    len, lenV: 0, target: len, down: false, upAt: 0, bobUntil: 0,
    hover: false, moving: false, flip,
  };
  for (let i = 0; i < n; i++) {
    s.x[i] = s.px[i] = ax;
    s.y[i] = s.py[i] = (len * i) / SEG;
  }
  // start with a little swing so nothing looks frozen on load
  const kick = (Math.random() - 0.5) * 3;
  for (let i = 1; i < n; i++) s.px[i] = ax - kick * (i / SEG);
  return s;
}

/** Smooth path through the rope points (midpoint quadratic curves). */
function silkPath(s: Strand) {
  let d = `M${s.x[0].toFixed(1)} ${s.y[0].toFixed(1)}`;
  for (let i = 1; i < SEG; i++) {
    const mx = (s.x[i] + s.x[i + 1]) / 2, my = (s.y[i] + s.y[i + 1]) / 2;
    d += `Q${s.x[i].toFixed(1)} ${s.y[i].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + `L${s.x[SEG].toFixed(1)} ${s.y[SEG].toFixed(1)}`;
}

function SpiderWeb({ spiders, inactive }: { spiders: SpiderSpec[]; inactive: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const silk = useRef<(SVGPathElement | null)[]>([]);
  const bodies = useRef<(HTMLDivElement | null)[]>([]);
  const strands = useRef<Strand[]>([]);
  const [down, setDown] = useState<boolean[]>([]);
  const inactiveRef = useRef(inactive);
  inactiveRef.current = inactive;

  const maxDrop = (spec: SpiderSpec) => Math.min(spec.drop, window.innerHeight * (window.innerWidth < 700 ? 0.35 : 0.48));

  const toggle = (i: number, force?: boolean) => {
    const s = strands.current[i], spec = spiders[i];
    if (!s || !spec) return;
    const next = force ?? !s.down;
    s.down = next;
    s.target = next ? maxDrop(spec) : spec.hang;
    s.upAt = next ? performance.now() + 1800 : 0;
    if (next) s.lenV = 260; // let go of the line
    setDown((list) => { const copy = list.slice(); copy[i] = next; return copy; });
  };

  useEffect(() => { if (inactive) strands.current.forEach((s, i) => s.down && toggle(i, false)); });

  useEffect(() => {
    const el = host.current;
    if (!el || !spiders.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = el.clientWidth;
    strands.current = spiders.map((spec) => makeStrand((spec.x / 100) * width, spec.hang, spec.flip));
    setDown(spiders.map(() => false));

    // only the eyes follow the cursor
    const pointer = { x: -1e4, y: -1e4, t: 0 };
    let rect = el.getBoundingClientRect();
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top; pointer.t = performance.now();
    };
    const onResize = () => {
      const w = el.clientWidth;
      if (!w) return;
      strands.current.forEach((s, i) => {
        const nx = (spiders[i].x / 100) * w, dx = nx - s.ax;
        s.ax = nx;
        for (let k = 0; k <= SEG; k++) { s.x[k] += dx; s.px[k] += dx; }
      });
      width = w;
    };

    const look = (i: number, s: Strand) => {
      const b = bodies.current[i];
      if (!b) return;
      const ex = s.x[SEG], ey = s.y[SEG] + 22;
      let lx = pointer.x - ex, ly = pointer.y - ey;
      const d = Math.hypot(lx, ly);
      if (pointer.t === 0 || d > 520) { lx = 0; ly = 0; } else { lx = (lx / Math.max(d, 1)) * 1.7; ly = (ly / Math.max(d, 1)) * 1.4; }
      b.style.setProperty("--lx", `${(s.flip ? -lx : lx).toFixed(2)}px`);
      b.style.setProperty("--ly", `${ly.toFixed(2)}px`);
    };

    const draw = () => {
      strands.current.forEach((s, i) => {
        silk.current[i]?.setAttribute("d", silkPath(s));
        const b = bodies.current[i];
        if (b) {
          const dx = s.x[SEG] - s.x[SEG - 2], dy = s.y[SEG] - s.y[SEG - 2];
          const rot = (-Math.atan2(dx, dy) * 180) / Math.PI;
          b.style.transform = `translate3d(${s.x[SEG].toFixed(1)}px, ${(s.y[SEG] - 2).toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
          if (b.classList.contains("is-moving") !== s.moving) b.classList.toggle("is-moving", s.moving);
          if (b.classList.contains("is-flip") !== s.flip) b.classList.toggle("is-flip", s.flip);
        }
        look(i, s);
      });
    };

    const step = (now: number) => {
      strands.current.forEach((s, idx) => {
        const spec = spiders[idx];
        // ── length: bungee when dropped, then a steady climb back
        if (s.down && now >= s.upAt && !s.hover) { s.down = false; s.target = spec.hang; setDown((l) => { const c = l.slice(); c[idx] = false; return c; }); }
        if (!s.down && s.bobUntil && now >= s.bobUntil) { s.bobUntil = 0; s.target = spec.hang; }
        let climbing = false;
        if (!s.down && s.len > s.target + 1.5) {
          s.len = Math.max(s.target, s.len - CLIMB * STEP * (s.len - s.target > 40 ? 1 : 0.6));
          s.lenV = 0;
          climbing = true;
        } else {
          const k = s.down ? 46 : 22, damp = s.down ? 4.2 : 6;
          s.lenV += ((s.target - s.len) * k - s.lenV * damp) * STEP;
          s.len += s.lenV * STEP;
        }
        s.moving = climbing || Math.abs(s.lenV) > 18;
        // ── verlet
        const rest = Math.max(4, s.len) / SEG;
        for (let i = 1; i <= SEG; i++) {
          const vx = (s.x[i] - s.px[i]) * 0.986, vy = (s.y[i] - s.py[i]) * 0.986;
          s.px[i] = s.x[i]; s.py[i] = s.y[i];
          s.x[i] += vx;
          s.y[i] += vy + GRAVITY * STEP * STEP * (i === SEG ? 1 : 0.6);
        }
        // a breath of air so a still thread is never perfectly still
        s.x[SEG] += Math.sin(now / 900 + idx * 1.7) * 0.012;
        // Silk is paid out, never slack: the spider sits exactly `len` from the anchor (a pendulum whose length
        // is the bungee spring above), and the silk between is a rope a touch longer than that, so it can bend
        // when brushed but never bunches up.
        const ax = s.ax, rope = (Math.max(4, s.len) * 1.025) / SEG;
        for (let it = 0; it < 8; it++) {
          s.x[0] = ax; s.y[0] = 0;
          for (let i = 0; i < SEG; i++) {
            const dx = s.x[i + 1] - s.x[i], dy = s.y[i + 1] - s.y[i];
            const d = Math.hypot(dx, dy) || 0.001;
            if (d <= rope) continue; // a rope only pulls
            const diff = (d - rope) / d;
            const wa = i === 0 ? 0 : 0.5, wb = i === 0 ? 1 : 0.5;
            s.x[i] += dx * diff * wa; s.y[i] += dy * diff * wa;
            s.x[i + 1] -= dx * diff * wb; s.y[i + 1] -= dy * diff * wb;
          }
          const ex = s.x[SEG] - ax, ey = s.y[SEG], d = Math.hypot(ex, ey) || 0.001, want = Math.max(4, s.len);
          s.x[SEG] = ax + (ex / d) * want; s.y[SEG] = (ey / d) * want;
        }
        // keep swings sane (a hard flick can't throw a spider over the navbar)
        const ang = Math.atan2(s.x[SEG] - ax, s.y[SEG]);
        if (Math.abs(ang) > 1.1) { const a = Math.sign(ang) * 1.1, L = Math.max(4, s.len); s.x[SEG] = ax + Math.sin(a) * L; s.y[SEG] = Math.cos(a) * L; s.px[SEG] = s.x[SEG]; s.py[SEG] = s.y[SEG]; }
      });
    };

    let raf = 0, last = performance.now(), acc = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || inactiveRef.current) { last = now; return; }
      rect = el.getBoundingClientRect();
      acc = Math.min(acc + (now - last) / 1000, 0.1);
      last = now;
      while (acc >= STEP) { step(now); acc -= STEP; }
      draw();
    };
    if (reduce) {
      draw();
    } else {
      raf = requestAnimationFrame(frame);
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    window.addEventListener("resize", onResize);
    if (reduce) {
      // no physics: still answer clicks by setting the length straight away
      const id = window.setInterval(() => {
        strands.current.forEach((s, i) => {
          if (s.down && performance.now() >= s.upAt) toggle(i, false);
          const len = s.target;
          for (let k = 0; k <= SEG; k++) { s.x[k] = s.ax; s.y[k] = (len * k) / SEG; }
        });
        draw();
      }, 120);
      return () => { window.clearInterval(id); window.removeEventListener("resize", onResize); };
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spiders]);

  const hover = (i: number, on: boolean) => {
    const s = strands.current[i];
    if (!s) return;
    s.hover = on;
  };

  return (
    <div ref={host} className="hw-spiders" inert={inactive} aria-hidden={inactive || undefined}>
      <svg className="hw-silk" aria-hidden>
        <defs>
          <linearGradient id="hw-silk-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#e9e2ff" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {spiders.map((spec, i) => (
          <g key={spec.id} className={`hw-strand hw-strand-${spec.kind}`}>
            <path ref={(n) => { silk.current[i] = n; }} className="hw-line" />
          </g>
        ))}
      </svg>
      {spiders.map((spec, i) => (
        <div key={spec.id} ref={(n) => { bodies.current[i] = n; }}
          className={`hw-spider hw-spider-${spec.kind}${down[i] ? " is-down" : ""}`} data-spider-kind={spec.kind}
          style={{ "--hw-delay": `${spec.delay}s` } as CSSProperties}>
          <button type="button" className="hw-spider-body" aria-pressed={!!down[i]}
            aria-label={`${down[i] ? "Retract" : "Drop"} Halloween spider ${spec.id + 1}`}
            title={down[i] ? "I'll climb back up in a moment" : "Click to drop me down"}
            onClick={() => toggle(i)}
            onPointerEnter={() => hover(i, true)} onPointerLeave={() => hover(i, false)}
            onKeyDown={(event) => { if (event.key === "Escape") toggle(i, false); }}>
            {spec.kind === "cute" ? <CuteSpider tint={spec.tint} size={spec.size} /> : <PixelSpider tint={spec.tint} size={spec.size} />}
          </button>
        </div>
      ))}
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
  return <SpiderWeb spiders={spiders} inactive={hidden || menuOpen} />;
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
        <button type="button" className="hw-pumpkin hw-pumpkin-1" onClick={pop} aria-label="Click the small pumpkin">
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
