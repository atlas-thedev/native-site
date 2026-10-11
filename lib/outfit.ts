import type { Worn } from "@/components/cosmetics/CosmeticViewer";
import { COSMETIC_SLOTS, type Sides, type StoreItem, type Wearing } from "./store";

export type Outfit = {
  worn: Worn[];
  cape: string | null;
  capeAnim: { url: string; frames: number; fps: number } | null;
};

/** What a player wears (cloak + one cosmetic per slot), resolved against the catalog for the 3D viewer. */
export function outfitOf(o: { equipped?: string | null; wearing?: Wearing; sides?: Sides } | null | undefined, items: StoreItem[]): Outfit {
  if (!o) return { worn: [], cape: null, capeAnim: null };
  const byId = new Map(items.map((i) => [i.id, i]));
  const wearing = (o.wearing ?? {}) as Wearing;
  const worn: Worn[] = COSMETIC_SLOTS.map((s) => wearing[s])
    .map((id) => (id ? byId.get(id) : undefined))
    .filter((it): it is StoreItem => !!it && !!it.modelUrl && !!it.textureUrl)
    .map((it) => ({ id: it.id, modelUrl: it.modelUrl!, textureUrl: it.textureUrl!, side: (it.slot && o.sides?.[it.slot]) || null, slot: it.slot }));
  const c = o.equipped ? byId.get(o.equipped) : undefined;
  return {
    worn,
    cape: c?.stillUrl ?? null,
    capeAnim: c?.animated && c.stripUrl ? { url: c.stripUrl, frames: c.frames, fps: c.fps } : null,
  };
}
