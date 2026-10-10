import { headers } from "next/headers";
import { API_URL, SITE_KEY } from "./config";
import type { PublicProfile, SearchHit, SkinDetail, SkinPage, SkinSort } from "../profiles";

/** Forward the real visitor IP (with the site key) so the API rate-limits visitors, not this server. */
async function visitor(): Promise<Record<string, string>> {
  const h: Record<string, string> = { "User-Agent": "native-site" };
  if (!SITE_KEY) return h;
  try {
    const hd = await headers();
    const ip = hd.get("x-forwarded-for")?.split(",")[0]?.trim() || hd.get("x-real-ip") || "";
    if (ip) { h["X-Native-Site-Key"] = SITE_KEY; h["X-Native-Client-IP"] = ip; }
  } catch {}
  return h;
}

async function get<T>(path: string, revalidate = 0): Promise<T | null> {
  try {
    const r = await fetch(`${API_URL}${path}`, { headers: await visitor(), ...(revalidate ? { next: { revalidate } } : { cache: "no-store" as const }), signal: AbortSignal.timeout(9000) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

/** A Native player, or any Minecraft Java player, with name and skin history. Never throws. */
export async function getPublicProfile(name: string): Promise<PublicProfile | null> {
  const d = await get<{ profile?: PublicProfile }>(`/v1/profiles/${encodeURIComponent(name)}`);
  return d?.profile ?? null;
}

export async function getSkins(sort: SkinSort, q = "", page = 0): Promise<SkinPage> {
  const d = await get<SkinPage>(`/v1/library/skins?sort=${sort}&q=${encodeURIComponent(q)}&page=${page}`, 30);
  return d ?? { sort, total: 0, more: false, skins: [] };
}

export async function getSkin(hash: string): Promise<SkinDetail | null> {
  if (!/^[a-f0-9]{32,64}$/.test(hash)) return null;
  const d = await get<{ skin?: SkinDetail }>(`/v1/library/skins/${hash}`, 30);
  return d?.skin ?? null;
}

export async function searchAll(q: string): Promise<SearchHit> {
  const d = await get<SearchHit>(`/v1/search?q=${encodeURIComponent(q)}`, 15);
  return { players: d?.players ?? [], items: d?.items ?? [] };
}
