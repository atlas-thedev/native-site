"use client";

import type { CapeAnim } from "@/lib/store";

const cache = new Map<string, Promise<HTMLImageElement>>();

/** Loads a CORS-enabled image once per URL. */
export function loadStrip(url: string): Promise<HTMLImageElement> {
  let p = cache.get(url);
  if (!p) {
    p = new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => res(img);
      img.onerror = () => {
        cache.delete(url);
        rej(new Error("strip"));
      };
      img.src = url;
    });
    cache.set(url, p);
  }
  return p;
}

/** Frame geometry of a vertical strip (frames stacked top to bottom, each a 2:1 cape texture). */
export function stripFrame(img: HTMLImageElement, anim: Pick<CapeAnim, "frames">) {
  const frames = Math.max(1, Math.min(anim.frames, Math.floor(img.height / Math.max(1, img.width / 2)) || anim.frames));
  return { frames, w: img.width, h: Math.floor(img.height / frames) };
}

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
