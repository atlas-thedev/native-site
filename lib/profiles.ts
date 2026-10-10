/** Shapes of the Native API's public profile / skin library endpoints (/v1/profiles, /v1/library/skins, /v1/search). */
export type SkinEntry = { hash: string; url: string; source: "native" | "mojang"; model: "default" | "slim"; firstSeen: number; lastSeen: number; likes: number; wearers?: number };
export type NameEntry = { name: string; at: number };
export type SocialLink = { type: "youtube" | "twitch" | "tiktok" | "x" | "instagram" | "discord" | "github" | "website"; url: string };
export type PublicProfile = {
  native: boolean;
  name: string;
  uuid: string;
  premium: boolean;
  joinedAt: number;
  bio: string;
  links: SocialLink[];
  views: number;
  friends: number;
  names: NameEntry[];
  skins: SkinEntry[];
  current: { url: string; hash: string | null; model: "default" | "slim" } | null;
  mojangCape: string | null;
};
export type SkinWearer = { name: string; native: boolean; firstSeen: number; lastSeen: number };
export type SkinDetail = Omit<SkinEntry, "wearers"> & { wearers: SkinWearer[] };
export type SkinSort = "trending" | "new" | "popular";
export type SkinPage = { sort: SkinSort; total: number; more: boolean; skins: SkinEntry[] };
export type SearchHit = { players: { name: string; uuid: string; native: boolean }[]; items: { id: string; name: string; kind: "cape" | "cosmetic"; slot: string | null }[] };

export const LINK_LABEL: Record<SocialLink["type"], string> = { youtube: "YouTube", twitch: "Twitch", tiktok: "TikTok", x: "X", instagram: "Instagram", discord: "Discord", github: "GitHub", website: "Website" };
export const LINK_TYPES = Object.keys(LINK_LABEL) as SocialLink["type"][];

export const ago = (t: number) => {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000));
  const units: [number, string][] = [[31536000, "year"], [2592000, "month"], [604800, "week"], [86400, "day"], [3600, "hour"], [60, "minute"]];
  for (const [n, u] of units) if (s >= n) { const v = Math.floor(s / n); return `${v} ${u}${v === 1 ? "" : "s"} ago`; }
  return "just now";
};
export const day = (t: number) => new Date(t).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
