"use client";

import type { CosmeticSlot, Owned, Wearing } from "@/lib/store";

export type StoreAction = "claim" | "unclaim" | "equip";

/** Lower-level call for wishlist / privacy actions. */
export async function storeActionRaw(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string; wishlist?: string[] }> {
  const r = await fetch("/api/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; expired?: boolean; wishlist?: string[] };
  if (d.expired) { window.location.href = "/login"; return { ok: false, error: "Your session expired." }; }
  return { ok: !!d.ok, error: d.error, wishlist: d.wishlist };
}
export type ActionResult = { equipped: string | null; wearing: Wearing; owned?: Owned[]; sides?: Record<string, string> };

/** Calls the site's store proxy. Sends the user to /login if the session expired. */
export async function storeAction(action: StoreAction, itemId: string | null, slot?: CosmeticSlot, side?: "left" | "right"): Promise<ActionResult> {
  const r = await fetch("/api/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, itemId, ...(slot ? { slot } : {}), ...(side ? { side } : {}) }) });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; expired?: boolean; equipped?: string | null; wearing?: Wearing; owned?: Owned[]; sides?: Record<string, string> };
  if (d.expired) {
    window.location.href = "/login";
    throw new Error("Your session expired.");
  }
  if (!d.ok) throw new Error(d.error || "Something went wrong. Try again.");
  return { equipped: d.equipped ?? null, wearing: d.wearing ?? {}, owned: d.owned, sides: d.sides };
}

export const ownerLabel = (n = 0) => `${n.toLocaleString()} ${n === 1 ? "player" : "players"}`;

/** Adds every piece of a free bundle (or, with Native+, any bundle) to the locker. */
export async function claimBundle(bundleId: string): Promise<{ owned: Owned[]; bundles: Record<string, unknown> }> {
  const r = await fetch("/api/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "claimBundle", bundleId }) });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; expired?: boolean; owned?: Owned[]; bundles?: Record<string, unknown> };
  if (d.expired) {
    window.location.href = "/login";
    throw new Error("Your session expired.");
  }
  if (!d.ok) throw new Error(d.error || "Couldn’t add that bundle.");
  return { owned: d.owned ?? [], bundles: d.bundles ?? {} };
}
