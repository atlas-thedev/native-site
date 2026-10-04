"use client";

import CapeStrip from "@/components/CapeStrip";
import type { StoreItem } from "@/lib/store";

/** A slow marquee of capes; pauses on hover. */
export default function PlusCapes({ items }: { items: StoreItem[] }) {
  if (!items.length) return null;
  const loop = items.length < 6 ? [...items, ...items, ...items] : items;
  return (
    <div className="marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="marquee-track flex gap-5 py-2">
        {[...loop, ...loop].map((it, i) => (
          <figure key={`${it.id}-${i}`} className="card flex w-[168px] shrink-0 flex-col items-center px-4 pb-4 pt-6" aria-hidden={i >= loop.length || undefined}>
            <CapeStrip strip={it.stripUrl} still={it.stillUrl} frames={it.frames} fps={it.fps} width={88} label={`${it.name} cape`} className="cutout-sm" />
            <figcaption className="mt-4 w-full text-center">
              <p className="truncate text-[14.5px] font-bold tracking-tight">{it.name}</p>
              <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-wider text-dim">{it.animated ? "Animated" : "Classic"}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
