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
};

export type Owned = { id: string; acquiredAt: number; source?: string };

export type Catalog = { rev: number; sections: { id: string; name: string; blurb: string }[]; items: StoreItem[] };

export const toHttps = (u: unknown) => (typeof u === "string" && u ? u.replace(/^http:\/\//, "https://") : null);

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
