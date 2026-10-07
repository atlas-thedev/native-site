import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ItemHead from "@/components/store/ItemHead";
import ProfileView from "@/components/players/ProfileView";
import PlayerSearch from "@/components/players/PlayerSearch";
import { readSession } from "@/lib/server/session";
import { getCatalog, getLook, getMine, getPlayer } from "@/lib/server/store";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const name = decodeURIComponent((await params).name);
  const p = await getPlayer(name);
  if (!p) return pageMeta({ title: "Player not found", description: "No Native player with that name.", path: `/u/${encodeURIComponent(name)}`, noindex: true });
  return pageMeta({
    title: `${p.name}’s locker`,
    description: `${p.name} has ${p.counts.owned} ${p.counts.owned === 1 ? "item" : "items"} in their Native locker and ${p.counts.wishlist} on their wishlist.`,
    path: `/u/${encodeURIComponent(p.name)}`,
    image: `/api/og/player/${encodeURIComponent(p.name)}`,
  });
}

export default async function PlayerPage({ params }: Params) {
  const name = decodeURIComponent((await params).name);
  const [p, catalog, s] = await Promise.all([getPlayer(name), getCatalog(), readSession()]);
  if (!p) notFound();
  const look = await getLook(p.name, p.model, p.uuid);
  const own = !!s && s.account.name.toLowerCase() === p.name.toLowerCase();
  const mine = own && s ? await getMine(s.token) : null;
  const items = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])];
  const joined = p.joinedAt ? new Date(p.joinedAt).toLocaleDateString("en", { month: "long", year: "numeric" }) : "recently";
  void mine;

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <ItemHead trail={[{ label: "Players", href: "/players" }, { label: p.name }]} back="/players" />
      <div className="mb-6"><PlayerSearch className="w-full sm:w-[360px]" /></div>
      <ProfileView
        profile={p}
        items={items}
        skin={look.skin ?? (look.model === "slim" ? "/skins/alex.png" : "/skins/steve.png")}
        model={look.model}
        own={own}
        initialPrefs={{ hideLocker: p.hidden.locker, hideWishlist: p.hidden.wishlist }}
        joined={joined}
      />
    </div>
  );
}
