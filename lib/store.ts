/** Client-safe store types shared by the store page, the locker and the API proxy. */
export type CapeAnim = { url: string; frames: number; fps: number };

export type StoreItem = {
  id: string;
  section: string;
  name: string;
  description: string;
  tags: string[];
  author: string;
  featured: boolean;
  exclusive?: boolean;
  hidden?: boolean;
  isNew?: boolean;
  owners?: number;
  createdAt?: number;
  price: number;
  /** sold for money (or included with Native+) */
  paid?: boolean;
  /** price after a live offer, null when there's no offer */
  salePrice?: number | null;
  offer?: { id: string; title: string; percent: number; endsAt: number | null } | null;
  animated: boolean;
  frames: number;
  fps: number;
  width: number;
  frameHeight: number;
  /** null for static capes */
  stripUrl: string | null;
  stillUrl: string;
  /** "cosmetic" for 3D hats, glasses, back items, shoes, hand items and balloons; capes otherwise */
  kind?: "cape" | "cosmetic";
  /** cosmetic slot: hats | glasses | back | shoes | hand | balloon */
  slot?: CosmeticSlot;
  /** the cosmetic model has moving parts */
  motion?: boolean;
  /** NCM v1 model JSON (cosmetics only) */
  modelUrl?: string | null;
  /** model texture PNG (cosmetics only) */
  textureUrl?: string | null;
};

export const COSMETIC_SLOTS = ["hats", "glasses", "back", "shoes", "hand", "balloon"] as const;
export type CosmeticSlot = (typeof COSMETIC_SLOTS)[number];
export const SLOT_NAMES: Record<CosmeticSlot, string> = { hats: "Hats", glasses: "Glasses", back: "Wings & Backpacks", shoes: "Shoes", hand: "Hand Items", balloon: "Balloons" };
export const SIDED_SLOTS: readonly string[] = ["hand", "balloon"];
export type Side = "left" | "right";
export const isCosmetic = (it: Pick<StoreItem, "kind" | "slot">) => it.kind === "cosmetic" && !!it.slot && (COSMETIC_SLOTS as readonly string[]).includes(it.slot);
/** What a profile wears in each cosmetic slot. */
export type Wearing = Partial<Record<CosmeticSlot, string>>;
/** Which side a worn hand item / balloon sits on (slots left out use the item's own default). */
export type Sides = Partial<Record<CosmeticSlot, Side>>;
/** Normalises a `sides` object from the API. */
export const sidesOf = (v: unknown): Sides => {
  const out: Sides = {};
  if (v && typeof v === "object") for (const [k, s] of Object.entries(v as Record<string, unknown>)) if (SIDED_SLOTS.includes(k) && (s === "left" || s === "right")) out[k as CosmeticSlot] = s;
  return out;
};

export type Owned = { id: string; acquiredAt: number; source?: string };

/** A store bundle: several items sold together at a discount (prices in USD, worked out by the server). */
export type Bundle = {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  featured: boolean;
  isNew?: boolean;
  /** something in it costs money */
  paid: boolean;
  /** what the paid pieces cost one by one */
  fullPrice: number;
  /** the bundle price */
  price: number;
  savePercent: number;
  createdAt?: number;
};
/** The signed-in player's view of a bundle: what they already own and what's left to pay. */
export type BundleMine = { owned: number; total: number; complete: boolean; due: number; dueFull: number; toBuy: string[] };

/** `items` are the cloaks; `cosmetics` the 3D hats, glasses, back items, shoes, hand items and balloons. */
export type Catalog = { rev: number; sections: { id: string; name: string; blurb: string }[]; items: StoreItem[]; cosmetics: StoreItem[]; bundles: Bundle[] };

/** Normalises the bundles of a catalogue response. */
export const bundlesOf = (v: unknown): Bundle[] => (Array.isArray(v) ? v : [])
  .filter((b): b is Record<string, unknown> => !!b && typeof b === "object" && typeof (b as { id?: unknown }).id === "string")
  .map((b) => ({
    id: String(b.id),
    name: String(b.name ?? b.id),
    description: String(b.description ?? ""),
    itemIds: Array.isArray(b.itemIds) ? b.itemIds.map(String) : [],
    featured: !!b.featured,
    isNew: !!b.isNew,
    paid: !!b.paid,
    fullPrice: Number(b.fullPrice) || 0,
    price: Number(b.price) || 0,
    savePercent: Number(b.savePercent) || 0,
    createdAt: Number(b.createdAt) || 0,
  }));

export const toHttps = (u: unknown) => (typeof u === "string" && u ? u.replace(/^http:\/\/(?!localhost[:/]|127\.0\.0\.1[:/])/, "https://") : null);

/** Normalises `capeAnimation` from a public CSL profile. */
export function capeAnimOf(v: unknown): CapeAnim | null {
  if (!v || typeof v !== "object") return null;
  const a = v as Record<string, unknown>;
  const url = toHttps(a.url);
  const frames = Number(a.frames);
  const fps = Number(a.fps);
  if (!url || !(frames > 1) || !(fps > 0)) return null;
  return { url, frames: Math.min(frames, 256), fps: Math.min(Math.max(fps, 1), 30) };
}

export type SortKey = "featured" | "popular" | "new" | "name";
export function sortBy(items: StoreItem[], key: SortKey) {
  const list = [...items];
  if (key === "popular") return list.sort((a, b) => (b.owners ?? 0) - (a.owners ?? 0) || a.name.localeCompare(b.name));
  if (key === "new") return list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  if (key === "name") return list.sort((a, b) => a.name.localeCompare(b.name));
  return sortItems(list);
}

/** Featured first, then catalog order. */
export const sortItems = (items: StoreItem[]) => items.map((it, i) => ({ it, i })).sort((a, b) => Number(b.it.featured) - Number(a.it.featured) || a.i - b.i).map((x) => x.it);

/** "$1.49" */
export const money = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;
export const isPaid = (it: Pick<StoreItem, "exclusive" | "price">) => !it.exclusive && it.price > 0;

/** What a cape costs right now (after a live offer). */
export const priceNow = (it: Pick<StoreItem, "price" | "salePrice">) => (typeof it.salePrice === "number" ? it.salePrice : it.price);

/** A player's public store profile (GET /v1/store/users/:name). */
export type PlayerProfile = {
  name: string;
  uuid: string;
  model: "default" | "slim";
  joinedAt: number;
  badges: string[];
  admin: boolean;
  plus: boolean;
  equipped: string | null;
  wearing: Wearing;
  /** sides of the worn hand item / balloon */
  sides?: Sides;
  counts: { owned: number; wishlist: number };
  hidden: { locker: boolean; wishlist: boolean };
  owned: { id: string; acquiredAt: number }[];
  wishlist: { id: string; addedAt: number }[];
};
export type PlayerHit = { name: string; uuid: string; model: "default" | "slim"; joinedAt: number; owned: number };
