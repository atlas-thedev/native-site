"use client";

import { useEffect, useRef, useState } from "react";
import { fetchModel } from "./CosmeticViewer";
import { peekWornShot, shotKey, wornShot } from "@/lib/wornShot";
import type { StoreItem } from "@/lib/store";

type Props = { item: StoreItem; skin: string | null; model: "default" | "slim"; className?: string; alt?: string };

/** The cosmetic worn on your skin (drawn once, then cached); the flat thumbnail shows until it is ready. */
export default function WornShot({ item, skin, model, className = "", alt = "" }: Props) {
  const skinUrl = skin ?? (model === "slim" ? "/skins/alex.png" : "/skins/steve.png");
  const ref = useRef<HTMLImageElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);

  // only draw what is (nearly) on screen
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setSeen(true); io.disconnect(); } }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  useEffect(() => {
    if (!seen || !item.modelUrl || !item.textureUrl) return;
    let live = true;
    (async () => {
      const json = await fetchModel(item.modelUrl!);
      const asset = { model: json, texture: item.textureUrl! };
      const hit = peekWornShot(shotKey(item, asset, skinUrl, model));
      const value = hit ?? (await wornShot({ item, asset, skinUrl, model }));
      if (live && value) setUrl(value);
    })().catch(() => {});
    return () => { live = false; };
  }, [seen, item.id, item.modelUrl, item.textureUrl, skinUrl, model]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={url ?? item.stillUrl} alt={alt} loading="lazy" draggable={false} className={`${className} ${url ? "[image-rendering:auto]" : ""}`} />;
}
