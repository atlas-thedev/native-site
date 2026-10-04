"use client";

import { useEffect, useRef } from "react";
import { loadStrip, reducedMotion, stripFrame } from "./capeAnim";

type Props = { strip: string | null; still: string; frames: number; fps: number; width?: number; className?: string; label?: string };

/** The front panel of a cape, animated frame by frame. Pauses off-screen and for reduced motion. */
export default function CapeStrip({ strip, still, frames, fps, width = 120, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const height = Math.round(width * 1.6);

  useEffect(() => {
    let dead = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = true;
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const draw = (img: HTMLImageElement, sy: number, fw: number) => {
      const fh = animate ? img.height / Math.max(1, frames) : img.height;
      const k = fw * 17 === fh * 22 ? fw / 22 : fw * 22 === fh * 46 ? fw / 46 : fw / 64;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 1 * k, sy + 1 * k, 10 * k, 16 * k, 0, 0, c.width, c.height);
    };
    const animate = !!strip && frames > 1;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);
    loadStrip(animate ? strip : still)
      .then((img) => {
        if (dead) return;
        if (!animate) return draw(img, 0, img.width);
        const g = stripFrame(img, { frames });
        let i = 0;
        draw(img, 0, g.w);
        if (reducedMotion()) return;
        timer = setInterval(() => {
          if (!visible || document.hidden) return;
          i = (i + 1) % g.frames;
          draw(img, i * g.h, g.w);
        }, 1000 / Math.max(1, fps));
      })
      .catch(() => {
        if (animate && !dead) loadStrip(still).then((img) => !dead && draw(img, 0, img.width)).catch(() => {});
      });
    return () => {
      dead = true;
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [strip, still, frames, fps]);

  return <canvas ref={ref} width={80} height={128} style={{ width, height, imageRendering: "pixelated" }} className={className} role="img" aria-label={label ?? "Cape preview"} />;
}
