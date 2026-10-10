import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import StoreHero from "@/components/store/StoreHero";
import PlayerCard from "@/components/players/PlayerCard";
import PlayerSearch from "@/components/players/PlayerSearch";
import { findPlayers, getLook } from "@/lib/server/store";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Players",
  description: "Look up any Native or Minecraft Java player by name: skin and name history, UUID, cape, cloaks, cosmetics and wishlist.",
  path: "/players",
});

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 32);
  const players = await findPlayers(q);
  const exact = q && players.find((p) => p.name.toLowerCase() === q.toLowerCase());
  if (exact) redirect(`/u/${encodeURIComponent(exact.name)}`);
  const looks = await Promise.all(players.map((p) => getLook(p.name, p.model, p.uuid)));

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <StoreHero
        title="Players"
        blurb="Look up any Native or Minecraft Java player. See their skin and name history, what they wear, what they own and what they want next."
        cta={{ text: "Looking for something to wear?", label: "Get the launcher", href: "/download" }}
        aside={<PlayerSearch q={q} className="w-full sm:w-[360px]" />}
      />
      {q && /^[A-Za-z0-9_]{3,16}$/.test(q) && (
        <Link href={`/u/${encodeURIComponent(q)}`} className="st-panel mb-8 flex items-center justify-between gap-4 p-5 transition hover:border-fg/40">
          <span>
            <span className="block text-[16px] font-extrabold">Look up “{q}” on Minecraft</span>
            <span className="block text-[13.5px] text-dim">Real skin, cape, UUID and skin history of any Java player, even if they aren’t on Native.</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Link>
      )}
      <h2 className="st-h2 flex items-center gap-3"><Users className="h-5 w-5" />{q ? `Players matching “${q}”` : "Top collectors"}</h2>
      {players.length ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p, i) => (
            <li key={p.name}><PlayerCard player={p} skin={looks[i].skin} /></li>
          ))}
        </ul>
      ) : (
        <div className="st-panel mt-5 p-12 text-center text-[15px] text-mute">{q ? `No Native player starts with “${q}”.` : "No collectors yet."}</div>
      )}
    </div>
  );
}
