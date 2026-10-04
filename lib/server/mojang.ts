export type McLatest = { release: string; releaseDate: string | null; snapshot: string; snapshotDate: string | null };

/** Newest release and snapshot from Mojang's launcher manifest. Never throws. */
export async function getLatestMinecraft(): Promise<McLatest | null> {
  try {
    const r = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest_v2.json", { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const m = (await r.json()) as { latest: { release: string; snapshot: string }; versions: { id: string; releaseTime: string }[] };
    const when = (id: string) => m.versions.find((v) => v.id === id)?.releaseTime ?? null;
    return { release: m.latest.release, releaseDate: when(m.latest.release), snapshot: m.latest.snapshot, snapshotDate: when(m.latest.snapshot) };
  } catch {
    return null;
  }
}
