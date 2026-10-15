"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

export type Shot = { src: string; w: number; h: number; t: string; d: string; group?: string };

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Full-screen gallery. Rendered into <body> (the page wrapper is transformed, which would trap a
 * fixed overlay inside it). Arrows, keyboard (← → Esc, Z to zoom), swipe, thumbnails, zoom + pan.
 */
export default function GalleryViewer({ shots, index, onIndex, onClose }: { shots: Shot[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [dir, setDir] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touch = useRef<{ x: number; y: number } | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const n = shots.length;

  useEffect(() => setMounted(true), []);
  const go = useCallback((step: number) => {
    if (index === null) return;
    setDir(step);
    setZoom(false);
    onIndex((index + step + n) % n);
  }, [index, n, onIndex]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key.toLowerCase() === "z") setZoom((z) => !z);
    };
    window.addEventListener("keydown", key);
    // keep the page still behind the viewer
    const { overflow } = document.body.style;
    const pad = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (pad > 0) document.body.style.paddingRight = `${pad}px`;
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = overflow; document.body.style.paddingRight = ""; };
  }, [open, go, onClose]);

  // keep the active thumbnail in view; warm up the neighbours
  useEffect(() => {
    if (index === null) return;
    strip.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    for (const k of [index + 1, index - 1]) { const s = shots[(k + n) % n]; if (s) { const img = new window.Image(); img.src = s.src; } }
  }, [index, shots, n]);

  if (!mounted) return null;
  const s = index === null ? null : shots[index];

  return createPortal(
    <AnimatePresence>
      {s && index !== null && (
        <motion.div
          key="gallery"
          className="fixed inset-0 z-[1000] flex flex-col bg-[rgb(6_6_8/0.97)] text-white backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          role="dialog" aria-modal="true" aria-label={`${s.t}, ${index + 1} of ${n}`}
        >
          {/* top bar */}
          <div className="flex items-center gap-3 px-4 pt-4 sm:px-6">
            <span className="font-mono text-[12px] tracking-[0.12em] text-white/55">{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
            {s.group && <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">{s.group}</span>}
            <span className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setZoom((z) => !z)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label={zoom ? "Zoom out" : "Zoom in"} title={zoom ? "Zoom out (Z)" : "Zoom in (Z)"}>
                {zoom ? <ZoomOut className="h-[18px] w-[18px]" /> : <ZoomIn className="h-[18px] w-[18px]" />}
              </button>
              <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105" aria-label="Close" title="Close (Esc)">
                <X className="h-[18px] w-[18px]" />
              </button>
            </span>
          </div>

          {/* stage */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-3 py-4 sm:px-20"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
            onTouchEnd={(e) => {
              const t0 = touch.current; touch.current = null;
              if (!t0 || zoom) return;
              const dx = e.changedTouches[0].clientX - t0.x, dy = e.changedTouches[0].clientY - t0.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
              else if (dy > 90) onClose();
            }}
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={s.src}
                custom={dir}
                variants={{ enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.98 }), center: { opacity: 1, x: 0, scale: 1 }, exit: (d: number) => ({ opacity: 0, x: d * -60, scale: 0.98 }) }}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease }}
                className="relative max-h-full w-full max-w-[1600px] overflow-hidden rounded-[14px] border border-white/10 shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)]"
                style={{ aspectRatio: `${s.w} / ${s.h}`, maxHeight: "100%", width: `min(100%, calc((100vh - 230px) * ${s.w / s.h}))` }}
                onClick={() => setZoom((z) => !z)}
                onMouseMove={(e) => {
                  if (!zoom) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
                }}
              >
                <Image
                  src={s.src} alt={s.t} fill sizes="(min-width:1600px) 1600px, 100vw" priority
                  className={`object-contain transition-transform duration-300 ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                  style={{ transform: zoom ? "scale(2.2)" : "none", transformOrigin: origin }}
                />
              </motion.div>
            </AnimatePresence>
            <button type="button" onClick={() => go(-1)} aria-label="Previous" className="absolute top-1/2 left-2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25 sm:left-5 sm:flex"><ChevronLeft className="h-6 w-6" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next" className="absolute top-1/2 right-2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25 sm:right-5 sm:flex"><ChevronRight className="h-6 w-6" /></button>
          </div>

          {/* caption + thumbnails */}
          <div className="px-4 pb-4 sm:px-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={s.src} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mx-auto max-w-[760px] text-center text-[14.5px] leading-snug text-white/70">
                <b className="text-white">{s.t}.</b> {s.d}
              </motion.p>
            </AnimatePresence>
            <div ref={strip} className="mx-auto mt-3 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:justify-center">
              {shots.map((x, i) => (
                <button
                  key={x.src} data-i={i} type="button" onClick={() => { setDir(i > index ? 1 : -1); setZoom(false); onIndex(i); }}
                  aria-label={x.t} aria-current={i === index}
                  className={`relative aspect-video w-[86px] shrink-0 overflow-hidden rounded-[7px] border-2 transition ${i === index ? "border-white" : "border-transparent opacity-45 hover:opacity-90"}`}
                >
                  <Image src={x.src} alt="" fill sizes="86px" className="object-cover object-top" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
