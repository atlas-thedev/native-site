"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, LayoutGrid, Maximize, Minimize, Pause, Play, X, ZoomIn } from "lucide-react";

export type Shot = { src: string; w: number; h: number; t: string; d: string; group?: string };

const ease = [0.16, 1, 0.3, 1] as const;
const SLIDE_MS = 4500;
const MAX_ZOOM = 4;

/** How big the picture is drawn on screen (used for the grow-from-the-card animation too). */
function fitSize(s: Shot) {
  if (typeof window === "undefined") return { w: 1200, h: 675 };
  const maxW = Math.min(window.innerWidth * (window.innerWidth < 640 ? 0.94 : 0.84), 1680);
  const maxH = window.innerHeight - (window.innerWidth < 640 ? 230 : 250);
  const w = Math.min(maxW, maxH * (s.w / s.h));
  return { w, h: w / (s.w / s.h) };
}

/**
 * Lightroom: the full-screen screenshot viewer.
 * Grows out of the picture you clicked, glows with the picture's own colours, and has a slideshow,
 * a grid of every shot, wheel / pinch-free zoom with drag-to-pan, real full screen and shortcuts:
 * ← → move · Space slideshow · G grid · Z or double-click zoom · F full screen · Esc close.
 * Rendered into <body> so no transformed page wrapper can trap it.
 */
export default function Lightroom({ shots, index, from, onIndex, onClose }: { shots: Shot[]; index: number | null; from?: DOMRect | null; onIndex: (i: number) => void; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [dir, setDir] = useState(0);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [playing, setPlaying] = useState(false);
  const [grid, setGrid] = useState(false);
  const [full, setFull] = useState(false);
  const [chrome, setChrome] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opened = useRef(false);
  const open = index !== null;
  const n = shots.length;
  const s = index === null ? null : shots[index];

  useEffect(() => setMounted(true), []);
  const resetZoom = () => { setScale(1); setPan({ x: 0, y: 0 }); };
  const go = useCallback((step: number) => {
    if (index === null) return;
    setDir(step);
    resetZoom();
    onIndex((index + step + n) % n);
  }, [index, n, onIndex]);
  const jump = (i: number) => { if (index === null || i === index) return; setDir(i > index ? 1 : -1); resetZoom(); onIndex(i); };
  const close = useCallback(() => {
    setPlaying(false); setGrid(false); resetZoom();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onClose();
  }, [onClose]);
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else root.current?.requestFullscreen?.().catch(() => {});
  };

  // shortcuts, scroll lock, full-screen state
  useEffect(() => {
    if (!open) { opened.current = false; return; }
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (grid) setGrid(false); else close(); }
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key.toLowerCase() === "g") setGrid((g) => !g);
      else if (e.key.toLowerCase() === "f") toggleFull();
      else if (e.key.toLowerCase() === "z") setScale((z) => { setPan({ x: 0, y: 0 }); return z > 1 ? 1 : 2.5; });
    };
    const fs = () => setFull(Boolean(document.fullscreenElement));
    window.addEventListener("keydown", key);
    document.addEventListener("fullscreenchange", fs);
    const pad = window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (pad > 0) document.body.style.paddingRight = `${pad}px`;
    return () => {
      window.removeEventListener("keydown", key);
      document.removeEventListener("fullscreenchange", fs);
      document.body.style.overflow = prev;
      document.body.style.paddingRight = "";
    };
  }, [open, go, close, grid]);

  // slideshow
  useEffect(() => {
    if (!open || !playing || grid || scale > 1) return;
    const t = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [open, playing, grid, scale, index, go]);

  // active thumbnail stays in view; neighbours are fetched early
  useEffect(() => {
    if (index === null) return;
    strip.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    for (const k of [index + 1, index - 1]) { const x = shots[(k + n) % n]; if (x) { const img = new window.Image(); img.src = x.src; } }
  }, [index, shots, n]);

  // the controls fade away while you just look (and come back on any movement)
  const wake = () => {
    setChrome(true);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setChrome(false), 2800);
  };
  useEffect(() => { if (open) wake(); return () => { if (idle.current) clearTimeout(idle.current); }; }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  // first frame grows out of the card that was clicked
  const size = s ? fitSize(s) : { w: 0, h: 0 };
  const first = !opened.current;
  if (s) opened.current = true;
  const grow = first && from && s && typeof window !== "undefined"
    ? { x: from.left + from.width / 2 - window.innerWidth / 2, y: from.top + from.height / 2 - window.innerHeight / 2 + 10, scale: from.width / size.w, opacity: 0.6 }
    : null;

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const next = Math.min(MAX_ZOOM, Math.max(1, scale * Math.exp(-e.deltaY * 0.0016)));
    if (next === scale) return;
    // zoom toward the cursor
    const cx = e.clientX - (r.left + r.width / 2), cy = e.clientY - (r.top + r.height / 2);
    const k = next / scale;
    const nx = next === 1 ? 0 : cx - (cx - pan.x) * k;
    const ny = next === 1 ? 0 : cy - (cy - pan.y) * k;
    const lim = (v: number, side: number) => Math.max(-side * (next - 1) / 2, Math.min(side * (next - 1) / 2, v));
    setScale(next);
    setPan({ x: lim(nx, size.w), y: lim(ny, size.h) });
  };

  return createPortal(
    <AnimatePresence>
      {s && index !== null && (
        <motion.div
          ref={root}
          key="lightroom"
          className={`fixed inset-0 z-[1000] overflow-hidden bg-[#050507] text-white ${chrome ? "" : "cursor-none"}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          onMouseMove={wake}
          role="dialog" aria-modal="true" aria-label={`${s.t}, ${index + 1} of ${n}`}
        >
          {/* ambient glow: the picture itself, blurred huge behind everything */}
          <AnimatePresence initial={false}>
            <motion.div key={`amb-${s.src}`} className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
              <Image src={s.src} alt="" fill sizes="40vw" className="scale-125 object-cover opacity-45 blur-[70px] saturate-150" />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(5_5_7/0.55)_55%,rgb(5_5_7/0.92)_100%)]" />

          {/* top bar */}
          <motion.div animate={{ opacity: chrome || grid ? 1 : 0, y: chrome || grid ? 0 : -8 }} transition={{ duration: 0.25 }} className="absolute inset-x-0 top-0 z-50 flex items-center gap-3 px-4 py-4 sm:px-6">
            <span className="font-mono text-[12px] tracking-[0.14em] text-white/60">{String(index + 1).padStart(2, "0")} <span className="text-white/30">/ {String(n).padStart(2, "0")}</span></span>
            {s.group && <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/75 backdrop-blur">{s.group}</span>}
            <span className="ml-auto flex items-center gap-1.5">
              {[
                { on: playing, icon: playing ? <Pause /> : <Play />, label: playing ? "Pause slideshow (Space)" : "Play slideshow (Space)", act: () => setPlaying((p) => !p) },
                { on: grid, icon: <LayoutGrid />, label: "All screenshots (G)", act: () => setGrid((g) => !g) },
                { on: full, icon: full ? <Minimize /> : <Maximize />, label: full ? "Exit full screen (F)" : "Full screen (F)", act: toggleFull },
              ].map((b) => (
                <button key={b.label} type="button" onClick={b.act} title={b.label} aria-label={b.label} aria-pressed={b.on}
                  className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition [&>svg]:h-[17px] [&>svg]:w-[17px] ${b.on ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`}>{b.icon}</button>
              ))}
              <button type="button" onClick={close} title="Close (Esc)" aria-label="Close" className="ml-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:rotate-90"><X className="h-[18px] w-[18px]" /></button>
            </span>
          </motion.div>
          {/* slideshow progress */}
          {playing && !grid && (
            <motion.div key={`bar-${index}`} className="absolute top-0 left-0 z-30 h-[3px] bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }} />
          )}

          {/* stage */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pb-[150px] pt-[64px] sm:pb-[170px]"
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
            onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
            onTouchEnd={(e) => {
              const t0 = touch.current; touch.current = null;
              if (!t0 || scale > 1) return;
              const dx = e.changedTouches[0].clientX - t0.x, dy = e.changedTouches[0].clientY - t0.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
              else if (dy > 100) close();
            }}
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={s.src}
                custom={dir}
                variants={{
                  enter: (d: number) => (grow ?? { opacity: 0, x: d * 90, scale: 0.94, rotateY: d * -8 }),
                  center: { opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -90, scale: 0.94, rotateY: d * 8 }),
                }}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: grow ? 0.6 : 0.55, ease }}
                style={{ width: size.w, height: size.h, perspective: 1200 }}
                className="relative overflow-hidden rounded-[16px] shadow-[0_50px_140px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/10"
                onWheel={onWheel}
                onDoubleClick={() => { setPan({ x: 0, y: 0 }); setScale((z) => (z > 1 ? 1 : 2.5)); }}
                onPointerDown={(e) => { if (scale > 1) { drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); } }}
                onPointerMove={(e) => {
                  const d = drag.current; if (!d) return;
                  const nx = d.px + e.clientX - d.x, ny = d.py + e.clientY - d.y;
                  d.moved = true;
                  const lx = (size.w * (scale - 1)) / 2, ly = (size.h * (scale - 1)) / 2;
                  setPan({ x: Math.max(-lx, Math.min(lx, nx)), y: Math.max(-ly, Math.min(ly, ny)) });
                }}
                onPointerUp={() => { drag.current = null; }}
              >
                <div
                  className={`absolute inset-0 ${scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
                  style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transition: drag.current ? "none" : "transform 0.25s cubic-bezier(0.16,1,0.3,1)" }}
                >
                  <Image src={s.src} alt={s.t} fill sizes="(min-width:1700px) 1680px, 94vw" priority draggable={false} className="select-none object-cover" />
                </div>
                {scale > 1 && <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] backdrop-blur">{Math.round(scale * 100)}%</span>}
              </motion.div>
            </AnimatePresence>
            <motion.button animate={{ opacity: chrome ? 1 : 0 }} type="button" onClick={() => go(-1)} aria-label="Previous (←)" className="absolute top-[calc(50%-40px)] left-3 hidden h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:scale-105 hover:bg-white/20 sm:left-6 sm:flex"><ChevronLeft className="h-6 w-6" /></motion.button>
            <motion.button animate={{ opacity: chrome ? 1 : 0 }} type="button" onClick={() => go(1)} aria-label="Next (→)" className="absolute top-[calc(50%-40px)] right-3 hidden h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:scale-105 hover:bg-white/20 sm:right-6 sm:flex"><ChevronRight className="h-6 w-6" /></motion.button>
          </div>

          {/* caption + filmstrip */}
          <motion.div animate={{ opacity: chrome ? 1 : 0.0, y: chrome ? 0 : 10 }} transition={{ duration: 0.25 }} className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-10 pb-4 sm:px-6">
            <div className="mx-auto flex max-w-[1680px] flex-wrap items-end justify-between gap-x-8 gap-y-2">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={s.src} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease }} className="min-w-0 max-w-[720px]">
                  <h3 className="text-[clamp(1.2rem,2vw,1.6rem)] font-bold leading-tight tracking-tight">{s.t}</h3>
                  <p className="mt-1 text-[14px] leading-snug text-white/65">{s.d}</p>
                </motion.div>
              </AnimatePresence>
              <p className="hidden items-center gap-3 font-mono text-[10.5px] tracking-[0.08em] text-white/40 lg:flex">
                <span><Kbd>←</Kbd><Kbd>→</Kbd> move</span><span><Kbd>Space</Kbd> play</span><span><Kbd>G</Kbd> grid</span><span><ZoomIn className="inline h-3 w-3" /> wheel / <Kbd>Z</Kbd></span><span><Kbd>F</Kbd> full</span>
              </p>
            </div>
            <div ref={strip} className="mx-auto mt-3 flex max-w-[1680px] gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {shots.map((x, i) => (
                <button key={x.src} data-i={i} type="button" onClick={() => jump(i)} aria-label={x.t} aria-current={i === index}
                  className={`relative aspect-video w-[92px] shrink-0 overflow-hidden rounded-[8px] transition duration-300 ${i === index ? "w-[128px] ring-2 ring-white" : "opacity-40 grayscale-[40%] hover:opacity-90 hover:grayscale-0"}`}>
                  <Image src={x.src} alt="" fill sizes="128px" className="object-cover object-top" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* grid of every shot */}
          <AnimatePresence>
            {grid && (
              <motion.div className="absolute inset-0 z-40 overflow-y-auto bg-[#050507]/92 px-4 pt-20 pb-10 backdrop-blur-xl sm:px-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="mx-auto grid max-w-[1500px] gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {shots.map((x, i) => (
                    <motion.button key={x.src} type="button" onClick={() => { jump(i); setGrid(false); }}
                      initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, delay: i * 0.025, ease }}
                      className={`group overflow-hidden rounded-[14px] bg-white/5 text-left ring-1 transition hover:-translate-y-1 hover:bg-white/10 ${i === index ? "ring-2 ring-white" : "ring-white/10"}`}>
                      <span className="relative block aspect-video overflow-hidden">
                        <Image src={x.src} alt={x.t} fill sizes="(min-width:1280px) 360px, (min-width:640px) 45vw, 92vw" className="object-cover object-top transition duration-500 group-hover:scale-105" />
                      </span>
                      <span className="flex items-center gap-2 px-3.5 py-3">
                        <span className="font-mono text-[11px] text-white/40">{String(i + 1).padStart(2, "0")}</span>
                        <span className="truncate text-[14px] font-semibold">{x.t}</span>
                        {x.group && <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">{x.group}</span>}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="mx-0.5 inline-flex min-w-[20px] items-center justify-center rounded-[5px] border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/70">{children}</kbd>;
}
