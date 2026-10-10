"use client";

import { useEffect, useRef, useState } from "react";

type Props = { skin: string; model?: "default" | "slim"; className?: string; alt?: string; scale?: number };

/**
 * Flat front view of a whole Minecraft skin (both layers), drawn pixel-exact on a 16x32 canvas.
 * Cheap enough for big grids (no WebGL). Handles 64x64, legacy 64x32 and HD skins.
 */
export default function SkinBody({ skin, model = "default", className = "", alt = "", scale = 8 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
    let dead = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = ref.current;
      const ctx = c?.getContext("2d");
      if (dead || !c || !ctx) return;
      const k = img.width / 64;
      const legacy = img.height * 2 === img.width;
      const S = scale;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, c.width, c.height);
      // a slim skin saved as classic: trust the pixels (the unused slim arm columns are empty)
      let slim = model === "slim";
      if (!slim && !legacy) {
        try {
          const t = document.createElement("canvas");
          t.width = 64; t.height = 32;
          const tc = t.getContext("2d")!;
          tc.drawImage(img, 0, 0, img.width, img.height / 2, 0, 0, 64, 32);
          const a = (x: number, y: number) => tc.getImageData(x, y, 1, 1).data[3];
          slim = true;
          for (let y = 20; y < 32 && slim; y++) if (a(54, y) || a(55, y)) slim = false;
          for (let y = 16; y < 20 && slim; y++) if (a(50, y) || a(51, y)) slim = false;
        } catch {}
      }
      const arm = slim ? 3 : 4;
      const part = (sx: number, sy: number, w: number, h: number, dx: number, dy: number, mirror = false) => {
        if (mirror) {
          ctx.save();
          ctx.translate((dx + w) * S, dy * S);
          ctx.scale(-1, 1);
          ctx.drawImage(img, sx * k, sy * k, w * k, h * k, 0, 0, w * S, h * S);
          ctx.restore();
        } else ctx.drawImage(img, sx * k, sy * k, w * k, h * k, dx * S, dy * S, w * S, h * S);
      };
      // base layer
      part(8, 8, 8, 8, 4, 0); // head
      part(20, 20, 8, 12, 4, 8); // body
      part(44, 20, arm, 12, 4 - arm, 8); // right arm
      part(4, 20, 4, 12, 4, 20); // right leg
      if (legacy) {
        part(44, 20, arm, 12, 12, 8, true);
        part(4, 20, 4, 12, 8, 20, true);
      } else {
        part(36, 52, arm, 12, 12, 8); // left arm
        part(20, 52, 4, 12, 8, 20); // left leg
      }
      // overlay layer. Like the game, a legacy skin whose hat area is fully opaque has no hat (old skins filled it in).
      let hat = true;
      if (legacy) {
        try {
          const t = document.createElement("canvas");
          t.width = 32 * k; t.height = 8 * k;
          const tc = t.getContext("2d")!;
          tc.drawImage(img, 32 * k, 0, 32 * k, 8 * k, 0, 0, 32 * k, 8 * k);
          const d = tc.getImageData(0, 0, t.width, t.height).data;
          hat = false;
          for (let i = 3; i < d.length; i += 4) if (d[i] < 128) { hat = true; break; }
        } catch {}
      }
      if (hat) part(40, 8, 8, 8, 4, 0); // hat
      if (!legacy) {
        part(20, 36, 8, 12, 4, 8);
        part(44, 36, arm, 12, 4 - arm, 8);
        part(52, 52, arm, 12, 12, 8);
        part(4, 36, 4, 12, 4, 20);
        part(4, 52, 4, 12, 8, 20);
      }
    };
    img.onerror = () => !dead && setFailed(true);
    img.src = location.protocol === "https:" ? skin.replace(/^http:\/\//, "https://") : skin;
    return () => { dead = true; };
  }, [skin, model, scale]);
  if (failed) return <div className={`flex items-center justify-center text-[12px] text-dim ${className}`}>No preview</div>;
  return <canvas ref={ref} width={16 * scale} height={32 * scale} role="img" aria-label={alt} className={`[image-rendering:pixelated] ${className}`} />;
}
