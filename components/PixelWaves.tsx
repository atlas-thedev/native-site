"use client";

import { useEffect, useRef } from "react";

const PX = 5;
const LAYERS = [
  { base: 0.3, amp: 3.2, k: 0.07, k2: 0.19, s: 0.9, fill: 0.035, crest: 0.28 },
  { base: 0.52, amp: 2.6, k: 0.095, k2: 0.23, s: -1.3, fill: 0.05, crest: 0.45 },
  { base: 0.74, amp: 2.2, k: 0.12, k2: 0.31, s: 1.8, fill: 0.07, crest: 0.75 },
];

/** Retro pixel-art sea rolling along the bottom of the page background. */
export default function PixelWaves() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, last = 0;
    const size = () => {
      w = Math.ceil(canvas.clientWidth / PX);
      h = Math.ceil(canvas.clientHeight / PX);
      canvas.width = w;
      canvas.height = h;
    };
    const draw = (t: number) => {
      const ink = document.documentElement.getAttribute("data-theme") === "light" ? "15,23,42" : "255,255,255";
      ctx.clearRect(0, 0, w, h);
      LAYERS.forEach((l, i) => {
        for (let x = 0; x < w; x++) {
          const y = Math.round(h * l.base + l.amp * Math.sin(x * l.k + t * l.s) + l.amp * 0.6 * Math.sin(x * l.k2 - t * l.s * 1.4 + i));
          ctx.fillStyle = `rgba(${ink},${l.fill})`;
          ctx.fillRect(x, y + 1, 1, h - y);
          ctx.fillStyle = `rgba(${ink},${l.crest})`;
          ctx.fillRect(x, y, 1, 1);
          const foam = Math.sin(x * 0.53 + t * 2.1 + i * 2) + Math.sin(x * 0.17 - t * 0.7);
          if (foam > 1.45) ctx.fillRect(x, y - 1, 1, 1);
          if (foam > 1.75) { ctx.fillStyle = `rgba(${ink},${l.crest * 0.6})`; ctx.fillRect(x + 1, y - 2, 1, 1); }
        }
      });
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 100) return;
      last = now;
      draw(now / 1000);
    };
    size();
    const onResize = () => { size(); if (reduced) draw(0); };
    window.addEventListener("resize", onResize);
    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} className="px-waves" aria-hidden data-testid="pixel-waves" />;
}
