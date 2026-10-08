"use client";

import CapeStrip from "../CapeStrip";
import WornShot from "../cosmetics/WornShot";
import { isCosmetic, type StoreItem } from "@/lib/store";

type Props = { item: StoreItem; width: number; skin?: string | null; model?: "default" | "slim"; className?: string };

/** A Store item's art: cloaks as their (animated) strip, cosmetics worn on a player. */
export default function ItemArt({ item, width, skin = null, model = "default", className = "" }: Props) {
  if (isCosmetic(item) && item.modelUrl && item.textureUrl) {
    return (
      <span className="inline-block" style={{ width: Math.round(width * 1.6) }}>
        <WornShot item={item} skin={skin} model={model} alt={item.name} className={`block h-auto w-full ${className}`} />
      </span>
    );
  }
  return <CapeStrip strip={item.animated ? item.stripUrl : null} still={item.stillUrl} frames={item.frames} fps={item.fps} width={width} label={`${item.name} cape`} className={className} />;
}
