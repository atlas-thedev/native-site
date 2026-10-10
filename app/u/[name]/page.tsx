import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ItemHead from "@/components/store/ItemHead";
import ProfileView from "@/components/players/ProfileView";
import ProfileMeta from "@/components/players/ProfileMeta";
import ProfileHistory from "@/components/players/ProfileHistory";
import McProfileView from "@/components/players/McProfileView";
import { readSession } from "@/lib/server/session";
import { getBundles, getCatalog, getLook, getPlayer } from "@/lib/server/store";
import { getPublicProfile } from "@/lib/server/profiles";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const name = decodeURIComponent((await params).name);
  const path = `/u/${encodeURIComponent(name)}`;
  const p = await getPlayer(name);
  if (p) {
    return pageMeta({
      title: `${p.name}’s profile`,
      description: `${p.name} on Native: skin and name history, ${p.counts.owned} ${p.counts.owned === 1 ? "item" : "items"} in their locker and ${p.counts.wishlist} on their wishlist.`,
      path: `/u/${encodeURIComponent(p.name)}`,
      image: `/api/og/player/${encodeURIComponent(p.name)}`,
    });
  }
  const mc = await getPublicProfile(name);
  if (!mc) return pageMeta({ title: "Player not found", description: "No Native or Minecraft player with that name.", path, noindex: true });
  return pageMeta({ title: `${mc.name} · Minecraft profile`, description: `${mc.name}'s Minecraft skin, cape, UUID and skin history.`, path: `/u/${encodeURIComponent(mc.name)}` });
}

export default async function PlayerPage({ params }: Params) {
  const name = decodeURIComponent((await params).name);
  const [p, pub, catalog, s, allBundles] = await Promise.all([getPlayer(name), getPublicProfile(name), getCatalog(), readSession(), getBundles()]);
  if (!p && !pub) notFound();

  if (!p && pub) {
    return (
      <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
        <ItemHead trail={[{ label: "Players", href: "/players" }, { label: pub.name }]} back="/players" />
        <McProfileView profile={pub} />
        <ProfileHistory profile={pub} />
      </div>
    );
  }

  const player = p!;
  const look = await getLook(player.name, player.model, player.uuid);
  const own = !!s && s.account.name.toLowerCase() === player.name.toLowerCase();
  const items = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])];
  const ownedIds = new Set(player.owned.map((o) => o.id));
  const bundles = player.bundles
    ? player.bundles.map((b) => ({ id: b.id, name: b.name, tagline: b.tagline, rarity: b.rarity, inStore: b.inStore, artUrl: b.artPath ? `https://api.playnative.fun${b.artPath}` : null, accent: b.accent, count: b.itemIds.length, itemIds: b.itemIds }))
    : allBundles.filter((b) => b.itemIds.every((id) => ownedIds.has(id))).map((b) => ({ id: b.id, name: b.name, artUrl: b.artUrl, accent: b.accent, count: b.itemIds.length, itemIds: b.itemIds }));
  const joined = player.joinedAt ? new Date(player.joinedAt).toLocaleDateString("en", { month: "long", year: "numeric" }) : "recently";

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <ItemHead trail={[{ label: "Players", href: "/players" }, { label: player.name }]} back="/players" />
      <ProfileView
        profile={player}
        items={items}
        skin={look.skin ?? pub?.current?.url ?? (look.model === "slim" ? "/skins/alex.png" : "/skins/steve.png")}
        model={look.model}
        own={own}
        initialPrefs={{ hideLocker: player.hidden.locker, hideWishlist: player.hidden.wishlist }}
        joined={joined}
        meta={pub ? <ProfileMeta profile={pub} /> : null}
        premium={!!pub?.premium}
        bundles={bundles}
      />
      {pub && <ProfileHistory profile={pub} />}
    </div>
  );
}
