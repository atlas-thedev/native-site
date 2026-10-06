import { getCatalog, getPlayer } from "@/lib/server/store";
import { notFoundCard, playerCard } from "@/lib/server/og";

export const dynamic = "force-dynamic";

/** Share image for a player profile. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const [p, catalog] = await Promise.all([getPlayer(decodeURIComponent(name)), getCatalog()]);
  if (!p) return notFoundCard("Native Store");
  const all = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])];
  const wornIds = new Set([p.equipped, ...Object.values(p.wearing)].filter(Boolean));
  const mine = p.owned.map((o) => all.find((i) => i.id === o.id)).filter((i): i is NonNullable<typeof i> => !!i);
  const worn = mine.filter((i) => wornIds.has(i.id));
  const rest = mine.filter((i) => !wornIds.has(i.id));
  const res = await playerCard(p.name, p.counts.owned, p.counts.wishlist, [...worn, ...rest], p.plus);
  res.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return res;
}
