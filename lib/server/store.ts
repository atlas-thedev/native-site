import { API_URL } from "./config";
import { bundlesOf, isCosmetic, sidesOf, sortItems, toHttps, type BundleMine, type Catalog, type Sides, type Owned, type PlayerHit, type PlayerProfile, type StoreItem, type Wearing } from "../store";

/** Public store catalog from the Native API. Never throws. */
export async function getCatalog(): Promise<Catalog | null> {
  try {
    const r = await fetch(`${API_URL}/v1/store/catalog`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const d = (await r.json()) as Catalog;
    const items = (Array.isArray(d.items) ? d.items : [])
      .map((it) => ({
        ...it,
        stripUrl: it.animated ? toHttps(it.stripUrl) : null,
        stillUrl: toHttps(it.stillUrl) ?? "",
        tags: Array.isArray(it.tags) ? it.tags : [],
        owners: Number(it.owners) || 0,
        createdAt: Number(it.createdAt) || 0,
        modelUrl: toHttps(it.modelUrl),
        textureUrl: toHttps(it.textureUrl),
      }))
      .filter((it: StoreItem) => it.id && it.stillUrl && !it.hidden);
    const cosmetics = items.filter((it) => isCosmetic(it) && it.modelUrl && it.textureUrl);
    return {
      rev: d.rev ?? 0,
      sections: Array.isArray(d.sections) ? d.sections : [],
      items: sortItems(items.filter((it) => it.kind !== "cosmetic")),
      cosmetics: sortItems(cosmetics),
      bundles: bundlesOf((d as { bundles?: unknown }).bundles),
    };
  } catch {
    return null;
  }
}

/** The signed-in account's Native capes and cosmetics and what it wears. Never throws. */
export async function getMine(token: string): Promise<{ owned: Owned[]; equipped: string | null; wearing: Wearing; sides: Sides; wishlist: string[]; bundles: Record<string, BundleMine> } | null> {
  try {
    const r = await fetch(`${API_URL}/v1/store/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const d = (await r.json()) as { owned?: Owned[]; equipped?: string | null; wearing?: Wearing; sides?: unknown; wishlist?: { id: string }[]; bundles?: Record<string, BundleMine> };
    return {
      owned: Array.isArray(d.owned) ? d.owned : [],
      equipped: d.equipped ?? null,
      wearing: d.wearing && typeof d.wearing === "object" ? d.wearing : {},
      sides: sidesOf(d.sides),
      wishlist: Array.isArray(d.wishlist) ? d.wishlist.map((w) => w.id) : [],
      bundles: d.bundles && typeof d.bundles === "object" ? d.bundles : {},
    };
  } catch {
    return null;
  }
}

/** The account's current skin + model from its public CSL profile. */
export async function getLook(name: string, fallback: string | undefined, uuid?: string | null): Promise<{ skin: string | null; model: "default" | "slim" }> {
  let skin: string | null = null;
  let model: "default" | "slim" = fallback === "slim" ? "slim" : "default";
  try {
    const r = await fetch(`${API_URL}/csl/${encodeURIComponent(name)}.json`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    const p = r.ok ? await r.json() : null;
    if (p) {
      skin = toHttps(p.skin);
      model = p.model === "slim" ? "slim" : "default";
    }
  } catch {}
  // Microsoft accounts have no Native skin: their look is the real Minecraft skin (by UUID, never by name)
  if (!skin && uuid) {
    const real = await getMojangLook(uuid);
    if (real.skin) return real as { skin: string; model: "default" | "slim" };
  }
  return { skin, model };
}

const mojangSkins = new Map<string, { at: number; skin: string | null; model: "default" | "slim" }>();

/** A Minecraft account's current skin and arm model from Mojang (cached for 10 minutes). Never throws. */
export async function getMojangLook(uuid: string): Promise<{ skin: string | null; model: "default" | "slim" }> {
  const id = uuid.replace(/-/g, "").toLowerCase();
  const hit = mojangSkins.get(id);
  if (hit && Date.now() - hit.at < 600_000) return { skin: hit.skin, model: hit.model };
  let skin: string | null = null;
  let model: "default" | "slim" = "default";
  try {
    const r = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      const p = (await r.json()) as { properties?: { name: string; value: string }[] };
      const v = (p.properties ?? []).find((x) => x.name === "textures")?.value;
      const t = v ? (JSON.parse(Buffer.from(v, "base64").toString("utf8")).textures ?? {}) : {};
      skin = toHttps(t.SKIN?.url);
      model = t.SKIN?.metadata?.model === "slim" ? "slim" : "default";
    }
  } catch {
    return hit ? { skin: hit.skin, model: hit.model } : { skin: null, model };
  }
  mojangSkins.set(id, { at: Date.now(), skin, model });
  if (mojangSkins.size > 500) mojangSkins.delete(mojangSkins.keys().next().value as string);
  return { skin, model };
}
export const getMojangSkin = async (uuid: string): Promise<string | null> => (await getMojangLook(uuid)).skin;

/** The skin for the navbar head: the real Minecraft skin for Microsoft accounts, else the Native skin. Never throws. */
export async function getAccountSkin(token: string, name: string, uuid?: string): Promise<string | null> {
  const native = getLook(name, undefined).then((l) => l.skin).catch(() => null);
  let premium = false;
  let mcUuid = uuid ?? null;
  try {
    const r = await fetch(`${API_URL}/v1/account/minecraft`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      const j = (await r.json()) as { account?: { type?: string }; profile?: { uuid?: string } };
      premium = j?.account?.type === "premium" || j?.account?.type === "merged";
      if (typeof j?.profile?.uuid === "string") mcUuid = j.profile.uuid;
    }
  } catch {}
  if (premium && mcUuid) {
    const skin = await getMojangSkin(mcUuid);
    if (skin) return skin;
  }
  return native;
}

/** A player's public profile by name, or null when there is none. */
export async function getPlayer(name: string): Promise<PlayerProfile | null> {
  try {
    const r = await fetch(`${API_URL}/v1/store/users/${encodeURIComponent(name)}`, { next: { revalidate: 15 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const d = (await r.json()) as { profile?: PlayerProfile };
    return d.profile ? { ...d.profile, sides: sidesOf(d.profile.sides) } : null;
  } catch {
    return null;
  }
}

/** Players whose name starts with `q`; without `q` the biggest collectors. */
export async function findPlayers(q: string): Promise<PlayerHit[]> {
  try {
    const r = await fetch(`${API_URL}/v1/store/users?q=${encodeURIComponent(q)}`, { next: { revalidate: 20 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return [];
    const d = (await r.json()) as { users?: PlayerHit[] };
    return Array.isArray(d.users) ? d.users : [];
  } catch {
    return [];
  }
}
