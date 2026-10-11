import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PlayerSearch from "@/components/players/PlayerSearch";
import Podium from "@/components/players/Podium";
import SkinHead from "@/components/SkinHead";
import Marquee from "@/components/v2/Marquee";
import SplitText from "@/components/SplitText";
import { findPlayers, getCatalog, getLook, getPlayer } from "@/lib/server/store";
import { outfitOf } from "@/lib/outfit";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Players",
  description: "Look up any Native or Minecraft Java player by name: skin and name history, UUID, cape, cloaks, cosmetics and wishlist.",
  path: "/players",
});

const joined = (t: number) => (t ? new Date(t).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—");

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 32);
  const players = await findPlayers(q);
  const exact = q && players.find((p) => p.name.toLowerCase() === q.toLowerCase());
  if (exact) redirect(`/u/${encodeURIComponent(exact.name)}`);
  const top = !q ? players.slice(0, 3) : [];
  const [looks, catalog, profiles] = await Promise.all([
    Promise.all(players.map((p) => getLook(p.name, p.model, p.uuid))),
    top.length ? getCatalog() : Promise.resolve(null),
    Promise.all(top.map((p) => getPlayer(p.name))),
  ]);
  const items = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])];
  const rows = players.map((p, i) => ({ player: p, skin: looks[i].skin, model: looks[i].model }));
  // Podium players wear what they wear in game: cloak + cosmetics.
  const podium = top.map((_, i) => {
    const pr = profiles[i];
    return { ...rows[i], outfit: outfitOf(pr && !pr.hidden.locker ? pr : pr ? { equipped: pr.equipped, wearing: pr.wearing, sides: pr.sides } : null, items) };
  });
  const list = !q ? rows.slice(3) : rows;
  const owned = players.reduce((n, p) => n + p.owned, 0);
  const javaName = q && /^[A-Za-z0-9_]{3,16}$/.test(q);

  return (
    <div className="pb-[clamp(80px,10vw,150px)]">
      <section className="v-wrap v-page-hero">
        <div className="v-head-rule">
          <span>(Directory)</span>
          <span>{q ? `${players.length} match${players.length === 1 ? "" : "es"}` : "Native + Minecraft Java"}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <SplitText as="h1" text={q ? `“${q}”` : "Players"} className="v-page-title" stagger={0.06} />
          <p className="v-page-sub !mt-0 max-w-[420px] pb-3">
            Look up anyone on Native or Minecraft Java. Skin and name history, UUID, cape, what they wear, what they own and what they want next.
          </p>
        </div>
        <PlayerSearch q={q} big className="mt-[clamp(26px,4vw,56px)]" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="v-label mr-2">Try</span>
          {(players.slice(0, 4).map((p) => p.name).concat(["Notch", "jeb_"])).slice(0, 6).map((n) => (
            <Link key={n} href={`/u/${encodeURIComponent(n)}`} className="v-chip">{n}</Link>
          ))}
          {q && <Link href="/players" className="v-chip">Clear search ✕</Link>}
        </div>
      </section>

      {javaName && (
        <section className="v-wrap mt-6">
          <Link href={`/u/${encodeURIComponent(q)}`} data-cursor="Look up" className="group flex items-center justify-between gap-6 rounded-[16px] bg-fg px-6 py-6 text-bg sm:px-9">
            <span>
              <span className="block font-[family-name:var(--font-display)] text-[clamp(1.6rem,2.8vw,2.4rem)] font-semibold leading-none tracking-[-0.04em]">Look up “{q}” on Minecraft</span>
              <span className="mt-2 block text-[14px] opacity-65">Real skin, cape, UUID and skin history of any Java player, even if they aren’t on Native.</span>
            </span>
            <ArrowUpRight className="h-7 w-7 shrink-0 transition group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </section>
      )}

      {podium.length > 0 && (
        <section className="mt-[clamp(50px,7vw,100px)]">
          <div className="v-wrap">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="v-display v-h3">Top collectors</h2>
              <p className="v-label">{owned.toLocaleString()} items owned by the top {players.length}</p>
            </div>
          </div>
          <div className="v-wrap">
            <Podium top={podium} />
          </div>
        </section>
      )}

      {list.length > 0 && (
        <section className="v-wrap mt-[clamp(50px,7vw,100px)]">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="v-display v-h3">{q ? "Players" : "Leaderboard"}</h2>
            <span className="v-label hidden sm:block">Items · Joined</span>
          </div>
          <ol className="v-board">
            {list.map(({ player: p, skin }, i) => (
              <li key={p.name}>
                <Link href={`/u/${encodeURIComponent(p.name)}`} className="v-board-row">
                  <span className="v-board-n">{String(i + 1 + podium.length).padStart(2, "0")}</span>
                  <SkinHead skin={skin} name={p.name} size={44} className="!rounded-[8px]" />
                  <span className="v-board-name">{p.name}</span>
                  <span className="v-board-meta">
                    <span className="font-mono text-fg">{p.owned.toLocaleString()}</span>
                    <span className="hidden w-[120px] text-right sm:inline">{joined(p.joinedAt)}</span>
                    <ArrowUpRight />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!players.length && (
        <section className="v-wrap mt-12">
          <div className="border-y border-line py-16 text-center">
            <p className="v-display v-h3">{q ? "No one here yet" : "No collectors yet"}</p>
            <p className="mt-4 text-[15px] text-mute">{q ? `No Native player starts with “${q}”.` : "Be the first to collect something."}</p>
          </div>
        </section>
      )}

      {!q && players.length > 0 && (
        <div className="mt-[clamp(60px,8vw,120px)]">
          <Marquee className="is-outline" speed={50} items={players.map((p) => p.name)} />
        </div>
      )}
    </div>
  );
}
