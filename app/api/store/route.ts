import { NextResponse } from "next/server";
import { api, clearSession, readSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });
type Me = { ok?: boolean; error?: string; wishlist?: { id: string }[]; prefs?: { hideLocker?: boolean; hideWishlist?: boolean }; equipped?: string | null; wearing?: Record<string, string>; owned?: { id: string; acquiredAt: number }[] };
const SLOTS = ["hats", "glasses", "back", "shoes"];
const wearingOf = (d: Me) => (d.wearing && typeof d.wearing === "object" ? d.wearing : {});

/** The signed-in account's Native capes and what it wears. */
export async function GET(req: Request) {
  const s = await readSession();
  if (!s) return json({ ok: true, signedIn: false, equipped: null, wearing: {}, owned: [] });
  const { status, data } = await api("/v1/store/me", { method: "GET", headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }) });
  if (status === 401) {
    await clearSession();
    return json({ ok: true, signedIn: false, equipped: null, wearing: {}, owned: [] });
  }
  const d = (data ?? {}) as Me;
  return json({ ok: status < 400, signedIn: true, equipped: d.equipped ?? null, wearing: wearingOf(d), owned: Array.isArray(d.owned) ? d.owned : [], wishlist: Array.isArray(d.wishlist) ? d.wishlist.map((w) => w.id) : [], prefs: d.prefs ?? { hideLocker: false, hideWishlist: false } }, status < 400 ? 200 : 502);
}

const ACTIONS = { equip: "/v1/store/equip", claim: "/v1/store/claim", unclaim: "/v1/store/unclaim", wish: "/v1/store/wishlist", prefs: "/v1/store/prefs" } as const;

/**
 * { action: "claim" | "unclaim", itemId } adds a cape to / removes it from the locker.
 * { action: "equip", itemId } wears it (itemId null takes the cape off).
 * { action: "equip", slot, itemId: null } takes the cosmetic in that slot off.
 */
export async function POST(req: Request) {
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in to use Native capes." }, 401);
  let body: { itemId?: unknown; action?: unknown; slot?: unknown; on?: unknown; hideLocker?: unknown; hideWishlist?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }
  const action = (typeof body.action === "string" && body.action in ACTIONS ? body.action : "equip") as keyof typeof ACTIONS;
  const itemId = body.itemId == null || body.itemId === "" ? null : String(body.itemId).slice(0, 80);
  if (action === "prefs") {
    const r = await api(ACTIONS.prefs, { method: "POST", headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}`, "Content-Type": "application/json" }), body: JSON.stringify({ ...(body.hideLocker !== undefined ? { hideLocker: !!body.hideLocker } : {}), ...(body.hideWishlist !== undefined ? { hideWishlist: !!body.hideWishlist } : {}) }) });
    if (r.status === 401) { await clearSession(); return json({ ok: false, error: "Your session expired. Sign in again.", expired: true }, 401); }
    return json({ ok: r.ok, prefs: (r.data as Me).prefs ?? null, error: r.ok ? undefined : "Couldn’t save that." }, r.ok ? 200 : 502);
  }
  if (action !== "equip" && !itemId) return json({ ok: false, error: "Pick an item." }, 400);
  const slot = typeof body.slot === "string" && SLOTS.includes(body.slot) ? body.slot : undefined;
  const { status, data } = await api(ACTIONS[action], {
    method: "POST",
    headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}`, "Content-Type": "application/json" }),
    body: JSON.stringify(action === "wish" ? { itemId, ...(body.on !== undefined ? { on: !!body.on } : {}) } : slot && !itemId ? { itemId: null, slot } : { itemId }),
  });
  if (status === 401) {
    await clearSession();
    return json({ ok: false, error: "Your session expired. Sign in again.", expired: true }, 401);
  }
  const d = (data ?? {}) as Me;
  if (status >= 400 || d.ok === false) return json({ ok: false, error: d.error || "Couldn’t do that. Try again." }, status >= 400 ? status : 502);
  return json({ ok: true, equipped: d.equipped ?? null, wearing: wearingOf(d), owned: Array.isArray(d.owned) ? d.owned : undefined, wishlist: Array.isArray(d.wishlist) ? d.wishlist.map((w) => w.id) : undefined });
}
