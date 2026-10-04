import { REPO, ghHeaders } from "./config";
import { site } from "../site";

export type Asset = { name: string; url: string; size: number };
export type Release = {
  tag: string;
  version: string;
  name: string;
  notes: string;
  date: string;
  prerelease: boolean;
  assets: Asset[];
};

type GhRelease = {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  assets: { name: string; browser_download_url: string; size: number }[];
};

/** Published releases, newest first. Never throws. */
export async function getReleases(): Promise<Release[]> {
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, { headers: ghHeaders(), next: { revalidate: 600 } });
    if (!r.ok) return [];
    const list = (await r.json()) as GhRelease[];
    return list
      .filter((x) => !x.draft && x.published_at)
      .map((x) => ({
        tag: x.tag_name,
        version: x.tag_name.replace(/^v/i, ""),
        name: x.name || x.tag_name,
        notes: x.body || "",
        date: x.published_at as string,
        prerelease: x.prerelease,
        assets: x.assets.map((a) => ({ name: a.name, url: a.browser_download_url, size: a.size })),
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  } catch {
    return [];
  }
}

export async function getLatestRelease(): Promise<Release | null> {
  const all = await getReleases();
  return all.find((r) => !r.prerelease) ?? all[0] ?? null;
}

/** Version shown across the site: latest published release, else package.json on main. */
export async function getSiteVersion(): Promise<string> {
  const rel = await getLatestRelease();
  if (rel) return rel.version;
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${REPO}/main/package.json`, { next: { revalidate: 900 } });
    if (r.ok) {
      const v = (await r.json()).version;
      if (typeof v === "string" && v) return v;
    }
  } catch {}
  return site.fallbackVersion;
}

export type PlatformKey = "windows" | "mac" | "linux";

const rules: Record<PlatformKey, RegExp[]> = {
  windows: [/setup.*\.exe$/i, /\.exe$/i],
  mac: [/\.dmg$/i],
  linux: [/\.appimage$/i],
};

export function pickAsset(rel: Release | null, platform: PlatformKey, arch?: string): Asset | null {
  if (!rel) return null;
  const files = rel.assets.filter((a) => !/\.blockmap$|\.ya?ml$/i.test(a.name));
  if (platform === "mac") {
    const dmgs = files.filter((a) => /\.dmg$/i.test(a.name));
    const want = arch === "x64" ? /x64|intel/i : /arm64/i;
    return dmgs.find((a) => want.test(a.name)) ?? dmgs[0] ?? null;
  }
  for (const re of rules[platform]) {
    const hit = files.find((a) => re.test(a.name));
    if (hit) return hit;
  }
  return null;
}

/** Which platforms have a downloadable file in the latest published release. */
export async function getAvailability(): Promise<{ version: string; date: string | null; platforms: Record<PlatformKey, { name: string; size: number } | null> }> {
  const rel = await getLatestRelease();
  const out = {} as Record<PlatformKey, { name: string; size: number } | null>;
  (["windows", "mac", "linux"] as PlatformKey[]).forEach((p) => {
    const a = pickAsset(rel, p);
    out[p] = a ? { name: a.name, size: a.size } : null;
  });
  return { version: rel?.version ?? (await getSiteVersion()), date: rel?.date ?? null, platforms: out };
}
