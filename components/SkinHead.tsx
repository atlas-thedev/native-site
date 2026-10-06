"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SKIN = "/skins/steve.png";

/** A player's face (with the hat layer) drawn from their skin. Falls back to the default skin, then their initial. */
export default function SkinHead({ skin, name, size = 28, className = "" }: { skin: string | null; name: string; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk(false);
    let dead = false;
    const draw = (src: string, fallback: string | null) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = ref.current;
        const ctx = c?.getContext("2d");
        if (dead || !c || !ctx) return;
        try {
          const k = img.width / 64;
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, 8, 8);
          ctx.drawImage(img, 8 * k, 8 * k, 8 * k, 8 * k, 0, 0, 8, 8);
          ctx.drawImage(img, 40 * k, 8 * k, 8 * k, 8 * k, 0, 0, 8, 8);
          setOk(true);
        } catch {
          if (fallback) draw(fallback, null);
        }
      };
      img.onerror = () => {
        if (!dead && fallback) draw(fallback, null);
      };
      img.src = src.replace(/^http:\/\//, "https://");
    };
    draw(skin || DEFAULT_SKIN, skin ? DEFAULT_SKIN : null);
    return () => {
      dead = true;
    };
  }, [skin]);
  return (
    <span className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[9px] bg-inv text-inv-fg ${className}`} style={{ width: size, height: size }} aria-hidden>
      <span className="text-[12px] font-extrabold uppercase">{name.slice(0, 1)}</span>
      <canvas ref={ref} width={8} height={8} className={`absolute inset-0 h-full w-full transition-opacity duration-300 [image-rendering:pixelated] ${ok ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}
