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
  /** "cosmetic" for 3D hats, glasses, back items, shoes, and hand items; capes otherwise */
  kind?: "cape" | "cosmetic";
  /** cosmetic slot: hats | glasses | back | shoes | hand */
  slot?: CosmeticSlot;
  /** the cosmetic model has moving parts */
  motion?: boolean;
  /** NCM v1 model JSON (cosmetics only) */
  modelUrl?: string | null;
  /** model texture PNG (cosmetics only) */
  textureUrl?: string | null;
  /** players can pick its colour */
  dyeable?: boolean;
  /** the colour it comes in ('#rrggbb') */
  dyeDefault?: string | null;
  /** append 'rrggbb' for the texture in that colour */
  dyeUrl?: string | null;
};

export const COSMETIC_SLOTS = ["hats", "glasses", "back", "shoes", "hand"] as const;
export type CosmeticSlot = (typeof COSMETIC_SLOTS)[number];
export const SLOT_NAMES: Record<CosmeticSlot, string> = { hats: "Hats", glasses: "Glasses", back: "Wings & Backpacks", shoes: "Shoes", hand: "Hand Items" };
export const SIDED_SLOTS: readonly string[] = ["hand"];
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

/** Colours players picked for dyeable items: { itemId: '#rrggbb' }. */
export type Dyes = Record<string, string>;
export const dyesOf = (v: unknown): Dyes => {
  const out: Dyes = {};
  if (v && typeof v === "object") for (const [k, c] of Object.entries(v as Record<string, unknown>)) if (typeof c === "string" && /^#[0-9a-f]{6}$/.test(c)) out[k] = c;
  return out;
};
/** Quick picks for dyeable cosmetics (same list as the server and the launcher). */
export const DYE_SWATCHES = ["#f2f2f2", "#9a9aa2", "#2b2b30", "#e5484d", "#ff8a3d", "#ffd23f", "#7ed957", "#2fbf71", "#3ec7e0", "#3d7bff", "#8a5cff", "#ff6fb5", "#8b5a2b", "#d4af37"];
/** The texture of a dyeable item in `color` (its own texture for its own colour). */
export const dyedTextureUrl = (it: Pick<StoreItem, "dyeable" | "dyeDefault" | "dyeUrl" | "textureUrl">, color: string | null | undefined) =>
  it.dyeable && it.dyeUrl && color && /^#[0-9a-f]{6}$/.test(color) && color !== it.dyeDefault ? `${it.dyeUrl}${color.slice(1)}` : it.textureUrl ?? null;

/** `items` are the cloaks; `cosmetics` the 3D hats, glasses, back items, shoes, hand items and balloons. */
export type Catalog = { rev: number; sections: { id: string; name: string; blurb: string }[]; items: StoreItem[]; cosmetics: StoreItem[] };

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
