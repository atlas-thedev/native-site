import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import StoreHero from "@/components/store/StoreHero";
import PlayerCard from "@/components/players/PlayerCard";
import PlayerSearch from "@/components/players/PlayerSearch";
import { findPlayers, getLook } from "@/lib/server/store";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Players",
  description: "Look up any Native player by name and see their cloaks, cosmetics and wishlist.",
  path: "/players",
});

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 32);
  const players = await findPlayers(q);
  const exact = q && players.find((p) => p.name.toLowerCase() === q.toLowerCase());
  if (exact) redirect(`/u/${encodeURIComponent(exact.name)}`);
  const looks = await Promise.all(players.map((p) => getLook(p.name, p.model)));

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <StoreHero
        title="Players"
        blurb="Look up any Native player by name. See what they wear, what they own and what they want next."
        cta={{ text: "Looking for something to wear?", label: "Browse cloaks", href: "/cloaks" }}
        aside={<PlayerSearch q={q} className="w-full sm:w-[360px]" />}
      />
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
