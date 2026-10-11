"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as RMouseEvent } from "react";

/**
 * Halloween mode (turned on from the launcher admin panel): a candle light that follows the cursor,
 * a spider you can drop, pumpkins that burst into candy, and drifting fog.
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

type Burst = { id: number; x: number; y: number };

export default function Halloween() {
  const [off, setOff] = useState(false);
  const [drop, setDrop] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setOff(localStorage.getItem("native.halloween.off") === "1"); } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-halloween-fx", !off);
    return () => document.documentElement.removeAttribute("data-halloween-fx");
  }, [off]);

  useEffect(() => {
    if (off) return;
    const onMove = (e: PointerEvent) => {
      lightRef.current?.style.setProperty("--mx", `${e.clientX}px`);
      lightRef.current?.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
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
