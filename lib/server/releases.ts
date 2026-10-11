import { REPO, ghHeaders } from "./config";
import { site } from "../site";
import { rebrand } from "./brand";

export type Asset = { name: string; url: string; size: number; sha256?: string | null };
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
  assets: { name: string; browser_download_url: string; size: number; digest?: string | null }[];
};

/** Last list GitHub gave us, so a rate limit or outage never makes the site fall back to an old version. */
let lastGood: Release[] = [];

/** Published releases, newest first. Never throws. */
export async function getReleases(): Promise<Release[]> {
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, { headers: ghHeaders(), next: { revalidate: 300 } });
    if (!r.ok) return lastGood;
    const list = (await r.json()) as GhRelease[];
    const out = list
      .filter((x) => !x.draft && x.published_at)
      .map((x) => ({
        tag: x.tag_name,
        version: x.tag_name.replace(/^v/i, ""),
        name: rebrand(x.name || x.tag_name),
        notes: rebrand(x.body || ""),
        date: x.published_at as string,
        prerelease: x.prerelease,
        assets: x.assets.map((a) => ({ name: a.name, url: a.browser_download_url, size: a.size, sha256: typeof a.digest === "string" && a.digest.startsWith("sha256:") ? a.digest.slice(7) : null })),
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (out.length) lastGood = out;
    return out.length ? out : lastGood;
  } catch {
    return lastGood;
  }
}

/**
 * Version of the latest published release, read from the updater manifest that ships with every
 * release (github.com download, not the rate-limited REST API).
 */
async function getUpdaterVersion(): Promise<string | null> {
  try {
    const r = await fetch(`https://github.com/${REPO}/releases/latest/download/latest.yml`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const m = (await r.text()).match(/^version:\s*["\x27]?v?([0-9][0-9A-Za-z.+-]*)/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export async function getLatestRelease(): Promise<Release | null> {
  const all = await getReleases();
  return all.find((r) => !r.prerelease) ?? all[0] ?? null;
}

/**
 * Version shown across the site: the latest published release (REST API), else the release's
 * updater manifest. package.json on main is NOT used: it is bumped before a release is published.
 */
export async function getSiteVersion(): Promise<string> {
  const rel = await getLatestRelease();
  if (rel) return rel.version;
  return (await getUpdaterVersion()) ?? site.fallbackVersion;
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

/** Every installable file of the latest release with its SHA-256 (GitHub computes these on upload). */
export async function getChecksums(): Promise<{ version: string; files: { name: string; size: number; sha256: string }[] }> {
  const rel = await getLatestRelease();
  const files = (rel?.assets ?? [])
    .filter((a) => !/\.blockmap$|\.ya?ml$/i.test(a.name) && a.sha256)
    .map((a) => ({ name: a.name, size: a.size, sha256: a.sha256 as string }));
  return { version: rel?.version ?? "", files };
}
