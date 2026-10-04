"use client";

import type { Owned } from "@/lib/store";

export type StoreAction = "claim" | "unclaim" | "equip";
export type ActionResult = { equipped: string | null; owned?: Owned[] };

/** Calls the site's store proxy. Sends the user to /login if the session expired. */
export async function storeAction(action: StoreAction, itemId: string | null): Promise<ActionResult> {
  const r = await fetch("/api/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, itemId }) });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; expired?: boolean; equipped?: string | null; owned?: Owned[] };
  if (d.expired) {
    window.location.href = "/login";
    throw new Error("Your session expired.");
  }
  if (!d.ok) throw new Error(d.error || "Something went wrong. Try again.");
  return { equipped: d.equipped ?? null, owned: d.owned };
}

export const ownerLabel = (n = 0) => `${n.toLocaleString()} ${n === 1 ? "player" : "players"}`;
