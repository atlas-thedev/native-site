import { API_URL } from "./config";
import { dyesOf, isCosmetic, sidesOf, sortItems, toHttps, type Catalog, type Dyes, type Sides, type Owned, type PlayerHit, type PlayerProfile, type StoreItem, type Wearing } from "../store";

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
        dyeUrl: it.dyeable ? toHttps(it.dyeUrl) : null,
      }))
      .filter((it: StoreItem) => it.id && it.stillUrl && !it.hidden);
    const cosmetics = items.filter((it) => isCosmetic(it) && it.modelUrl && it.textureUrl);
    return {
      rev: d.rev ?? 0,
      sections: Array.isArray(d.sections) ? d.sections : [],
      items: sortItems(items.filter((it) => it.kind !== "cosmetic")),
      cosmetics: sortItems(cosmetics),
    };
  } catch {
    return null;
  }
}

/** The signed-in account's Native capes and cosmetics and what it wears. Never throws. */
export async function getMine(token: string): Promise<{ owned: Owned[]; equipped: string | null; wearing: Wearing; sides: Sides; wishlist: string[]; dyes: Dyes } | null> {
  try {
    const r = await fetch(`${API_URL}/v1/store/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const d = (await r.json()) as { owned?: Owned[]; equipped?: string | null; wearing?: Wearing; sides?: unknown; wishlist?: { id: string }[]; dyes?: unknown };
    return {
      owned: Array.isArray(d.owned) ? d.owned : [],
      equipped: d.equipped ?? null,
      wearing: d.wearing && typeof d.wearing === "object" ? d.wearing : {},
      sides: sidesOf(d.sides),
      wishlist: Array.isArray(d.wishlist) ? d.wishlist.map((w) => w.id) : [],
      dyes: dyesOf(d.dyes),
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
    if (real.skin) return { skin: real.skin, model: real.model };
  }
  return { skin, model };
}

type MojangLook = { skin: string | null; model: "default" | "slim"; cape: string | null };
const mojangSkins = new Map<string, MojangLook & { at: number }>();

type Textures = { SKIN?: { url?: string; metadata?: { model?: string } }; CAPE?: { url?: string } };
const lookOf = (t: Textures): MojangLook => ({ skin: toHttps(t.SKIN?.url), model: t.SKIN?.metadata?.model === "slim" ? "slim" : "default", cape: toHttps(t.CAPE?.url) });

/** Textures straight from Mojang's session server. */
async function fromMojang(id: string): Promise<MojangLook | null> {
  const r = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`, { cache: "no-store", signal: AbortSignal.timeout(3500) });
  if (r.status === 204 || r.status === 404) return { skin: null, model: "default", cape: null };
  if (!r.ok) return null;
  const p = (await r.json()) as { properties?: { name: string; value: string }[] };
  const v = (p.properties ?? []).find((x) => x.name === "textures")?.value;
  return lookOf(v ? (JSON.parse(Buffer.from(v, "base64").toString("utf8")).textures ?? {}) : {});
}

/** The same textures through a public mirror, for when the server can't reach Mojang (Mojang blocks some hosting IPs). */
async function fromMirror(id: string): Promise<MojangLook | null> {
  const r = await fetch(`https://api.minetools.eu/profile/${id}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!r.ok) return null;
  const p = (await r.json()) as { decoded?: { textures?: Textures }; status?: string };
  if (!p?.decoded) return null;
  return lookOf(p.decoded.textures ?? {});
}

/** A Minecraft account's current skin, arm model and cape from Mojang, with a mirror fallback (cached for 10 minutes). Never throws. */
export async function getMojangLook(uuid: string): Promise<MojangLook> {
  const id = uuid.replace(/-/g, "").toLowerCase();
  const hit = mojangSkins.get(id);
  if (hit && Date.now() - hit.at < 600_000) return { skin: hit.skin, model: hit.model, cape: hit.cape };
  let look: MojangLook | null = null;
  for (const source of [fromMojang, fromMirror]) {
    look = await source(id).catch(() => null);
    if (look) break;
  }
  // Last resort: a skin-by-UUID image service (serves the real skin, with CORS), arm model unknown.
  if (!look) {
    if (hit) return { skin: hit.skin, model: hit.model, cape: hit.cape };
    return { skin: /^[a-f0-9]{32}$/.test(id) ? `https://mc-heads.net/skin/${id}` : null, model: "default", cape: null };
  }
  mojangSkins.set(id, { at: Date.now(), ...look });
  if (mojangSkins.size > 500) mojangSkins.delete(mojangSkins.keys().next().value as string);
  return look;
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
