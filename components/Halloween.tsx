"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as RMouseEvent } from "react";

/**
 * Halloween mode (turned on from the launcher admin panel): bats that dodge the cursor, a candle light that
 * follows it, a lazy ghost, a spider you can drop, pumpkins that burst into candy, and drifting fog.
 * Visitors can switch the effects off with the pill in the corner.
 */

const BAT = `<svg viewBox="0 0 100 46" width="48" height="22"><path fill="#0b0512" d="M50 13C48 8 45 5 45 5l1 7C39 7 27 5 13 9c6 3 9 8 8 14-6-4-14-4-21-1 10 3 16 9 18 17 4-6 12-8 18-4 2-6 8-9 14-8 6-1 12 2 14 8 6-4 14-2 18 4 2-8 8-14 18-17-7-3-15-3-21 1-1-6 2-11 8-14-14-4-26-2-33 3l1-7s-3 3-5 8z"/><circle cx="47" cy="16" r="1.3" fill="#ffb347"/><circle cx="53" cy="16" r="1.3" fill="#ffb347"/></svg>`;

const CANDY = ["🍬", "🍭", "👻", "🦇", "🎃", "🕷️"];

function webPath() {
  const angles = [0, 16, 34, 52, 70, 90].map((a) => (a * Math.PI) / 180);
  const rays = angles.map((a) => `M0 0L${(Math.cos(a) * 260).toFixed(1)} ${(Math.sin(a) * 260).toFixed(1)}`).join("");
  const rings = [46, 92, 140, 190].map((r) => {
    const pts = angles.map((a) => [Math.cos(a) * r, Math.sin(a) * r]);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const mid = (angles[i] + angles[i - 1]) / 2;
      const sag = r * 0.82;
      d += `Q${(Math.cos(mid) * sag).toFixed(1)} ${(Math.sin(mid) * sag).toFixed(1)} ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
    }
    return d;
  }).join("");
  return rays + rings;
}
const WEB = webPath();

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

function Ghost() {
  return (
    <svg viewBox="0 0 40 48" width="54" height="64">
      <path d="M20 2C10 2 4 10 4 20v24l6-5 5 5 5-5 5 5 5-5 6 5V20C36 10 30 2 20 2z" fill="#f4f1ff" fillOpacity=".92" />
      <circle cx="14" cy="19" r="3" fill="#1a1024" />
      <circle cx="26" cy="19" r="3" fill="#1a1024" />
      <ellipse cx="20" cy="28" rx="3" ry="4" fill="#1a1024" />
      <circle cx="10" cy="25" r="2.4" fill="#ff8fb1" fillOpacity=".6" />
      <circle cx="30" cy="25" r="2.4" fill="#ff8fb1" fillOpacity=".6" />
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

type Bat = { x: number; y: number; vx: number; vy: number; s: number; phase: number; el: HTMLDivElement | null };
type Burst = { id: number; x: number; y: number };

export default function Halloween() {
  const [off, setOff] = useState(false);
  const [drop, setDrop] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const batsRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setOff(localStorage.getItem("native.halloween.off") === "1"); } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-halloween-fx", !off);
    return () => document.documentElement.removeAttribute("data-halloween-fx");
  }, [off]);

  useEffect(() => {
    if (off) return;
    const host = batsRef.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const count = reduce ? 0 : W() < 700 ? 4 : 7;
    const bats: Bat[] = Array.from({ length: count }, () => ({
      x: Math.random() * W(),
      y: 90 + Math.random() * H() * 0.55,
      vx: (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 1.3),
      vy: (Math.random() - 0.5) * 0.6,
      s: 0.5 + Math.random() * 0.45,
      phase: Math.random() * 100,
      el: null,
    }));
    for (const b of bats) {
      const d = document.createElement("div");
      d.className = "hw-bat";
      d.style.setProperty("--flap", `${0.26 + Math.random() * 0.14}s`);
      d.innerHTML = BAT;
      host.appendChild(d);
      b.el = d;
    }
    let mx = -9999, my = -9999;
    let gx = W() * 0.82, gy = H() * 0.7;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      lightRef.current?.style.setProperty("--mx", `${mx}px`);
      lightRef.current?.style.setProperty("--my", `${my}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let raf = 0, t = 0;
    const step = () => {
      t += 1;
      for (const b of bats) {
        const dx = b.x - mx, dy = b.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 170 * 170) { const d = Math.sqrt(d2) || 1; b.vx += (dx / d) * 1.1; b.vy += (dy / d) * 1.1; }
        b.vy += Math.sin((t + b.phase * 7) / 38) * 0.035;
        b.vx *= 0.986; b.vy *= 0.955;
        const sp = Math.hypot(b.vx, b.vy);
        if (sp < 0.9) b.vx += (b.vx >= 0 ? 1 : -1) * 0.06;
        if (sp > 8) { b.vx *= 8 / sp; b.vy *= 8 / sp; }
        b.x += b.vx; b.y += b.vy;
        if (b.x < -70) b.x = W() + 60;
        if (b.x > W() + 70) b.x = -60;
        if (b.y < 80) b.vy += 0.35;
        if (b.y > H() * 0.85) b.vy -= 0.35;
        if (b.el) b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) scale(${b.vx < 0 ? -b.s : b.s}, ${b.s})`;
      }
      if (ghostRef.current) {
        const tx = mx < -1000 ? W() * 0.82 : mx + 46;
        const ty = my < -1000 ? H() * 0.7 : my + 34;
        gx += (tx - gx) * 0.035; gy += (ty - gy) * 0.035;
        ghostRef.current.style.transform = `translate3d(${gx}px, ${gy + Math.sin(t / 24) * 9}px, 0) rotate(${Math.max(-18, Math.min(18, (tx - gx) * 0.04))}deg)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); host.innerHTML = ""; };
  }, [off]);

  const pop = (e: RMouseEvent) => {
    const id = Date.now() + Math.random();
    setBursts((list) => [...list, { id, x: e.clientX, y: e.clientY }]);
    window.setTimeout(() => setBursts((list) => list.filter((b) => b.id !== id)), 1300);
  };

  return (
    <>
      {!off && (
        <div className="hw-layer" aria-hidden>
          <div ref={lightRef} className="hw-light" />
          <div className="hw-fog"><i /><i /></div>
          <svg className="hw-web hw-web-l" viewBox="0 0 260 260"><path d={WEB} /></svg>
          <svg className="hw-web hw-web-r" viewBox="0 0 260 260"><path d={WEB} /></svg>
          <div ref={batsRef} className="hw-bats" />
          <div ref={ghostRef} className="hw-ghost"><Ghost /></div>
        </div>
      )}
      {!off && (
        <button type="button" className={`hw-spider${drop ? " is-down" : ""}`} onClick={() => setDrop((d) => !d)} aria-label="Spider">
          <span className="hw-thread" />
          <span className="hw-spider-body"><Spider /></span>
        </button>
      )}
      {!off && (
        <div className="hw-pumpkins">
          {[0, 1].map((i) => (
            <button key={i} type="button" className={`hw-pumpkin hw-pumpkin-${i}`} onClick={pop} aria-label="Click the pumpkin">
              <Pumpkin />
            </button>
          ))}
        </div>
      )}
      {bursts.map((b) => (
        <div key={b.id} className="hw-burst" style={{ left: b.x, top: b.y }} aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} style={{ "--a": `${(i * 360) / 16 + Math.random() * 12}deg`, "--d": `${70 + Math.random() * 80}px` } as CSSProperties}>{CANDY[i % CANDY.length]}</i>
          ))}
        </div>
      ))}
    </>
  );
}
