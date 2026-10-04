import { API_URL } from "./config";
import { sortItems, toHttps, type Catalog, type Owned, type StoreItem } from "../store";

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
      }))
      .filter((it: StoreItem) => it.id && it.stillUrl && !it.hidden);
    return { rev: d.rev ?? 0, sections: Array.isArray(d.sections) ? d.sections : [], items: sortItems(items) };
  } catch {
    return null;
  }
}

/** The signed-in account's Native capes and what it wears. Never throws. */
export async function getMine(token: string): Promise<{ owned: Owned[]; equipped: string | null } | null> {
  try {
    const r = await fetch(`${API_URL}/v1/store/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const d = (await r.json()) as { owned?: Owned[]; equipped?: string | null };
    return { owned: Array.isArray(d.owned) ? d.owned : [], equipped: d.equipped ?? null };
  } catch {
    return null;
  }
}

/** The account's current skin + model from its public CSL profile. */
export async function getLook(name: string, fallback: string | undefined): Promise<{ skin: string | null; model: "default" | "slim" }> {
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
  return { skin, model };
}
