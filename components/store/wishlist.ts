"use client";

import { useEffect, useSyncExternalStore } from "react";
import { storeActionRaw } from "../capes/actions";

/**
 * One wishlist for the whole page: loaded once from /api/store, shared by every heart,
 * changed optimistically and rolled back (with the server's reason) when saving fails.
 */
let ids = new Set<string>();
type Load = "no" | "loading" | "yes";
let loaded = "no" as Load;
let lastError = "";
const subs = new Set<() => void>();
let snap: { ids: Set<string>; loaded: Load; lastError: string } = { ids, loaded, lastError };
const emit = () => { snap = { ids, loaded, lastError }; subs.forEach((f) => f()); };

async function load(force = false) {
  if (loaded === "loading" || (loaded === "yes" && !force)) return;
  loaded = "loading";
  try {
    const r = await fetch("/api/store", { cache: "no-store" });
    const d = (await r.json()) as { wishlist?: string[] };
    ids = new Set(Array.isArray(d.wishlist) ? d.wishlist : []);
    loaded = "yes";
  } catch {
    loaded = "no";
  }
  emit();
}

export async function toggleWish(itemId: string): Promise<boolean> {
  const next = !ids.has(itemId);
  ids = new Set(ids);
  if (next) ids.add(itemId); else ids.delete(itemId);
  lastError = "";
  emit();
  const res = await storeActionRaw({ action: "wish", itemId, on: next }).catch(() => ({ ok: false, error: "Couldn’t reach Native. Try again." }) as { ok: boolean; error?: string; wishlist?: string[] });
  if (!res.ok) {
    ids = new Set(ids);
    if (next) ids.delete(itemId); else ids.add(itemId);
    lastError = res.error || "Couldn’t save that to your wishlist.";
  } else if (res.wishlist) {
    ids = new Set(res.wishlist);
  }
  emit();
  return res.ok;
}

export function useWishlist(enabled: boolean) {
  useEffect(() => { if (enabled) load(); }, [enabled]);
  const s = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => snap, () => snap);
  return { has: (id: string) => s.ids.has(id), ready: s.loaded === "yes", error: s.lastError };
}
