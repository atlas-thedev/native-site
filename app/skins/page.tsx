import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Search, Trophy, Clock } from "lucide-react";
import StoreHero from "@/components/store/StoreHero";
import SkinCard from "@/components/skins/SkinCard";
import { getSkins } from "@/lib/server/profiles";
import type { SkinSort } from "@/lib/profiles";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMeta({
  title: "Skins",
  description: "Trending, new and most-liked Minecraft skins worn by Native players. Preview any skin in 3D and download it.",
  path: "/skins",
});

const SORTS: { id: SkinSort; label: string; Icon: typeof Flame }[] = [
  { id: "trending", label: "Trending", Icon: Flame },
  { id: "new", label: "New", Icon: Clock },
  { id: "popular", label: "Most liked", Icon: Trophy },
];

type SP = Promise<{ sort?: string; q?: string; page?: string }>;

export default async function SkinsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const sort = (SORTS.some((s) => s.id === sp.sort) ? sp.sort : "trending") as SkinSort;
  const q = (sp.q ?? "").trim().slice(0, 16);
  const page = Math.max(0, Math.min(50, Number(sp.page) || 0));
  const data = await getSkins(sort, q, page);
  const href = (o: { sort?: SkinSort; page?: number }) => {
    const p = new URLSearchParams();
    const s = o.sort ?? sort;
    if (s !== "trending") p.set("sort", s);
    if (q) p.set("q", q);
    if (o.page) p.set("page", String(o.page));
    const str = p.toString();
    return `/skins${str ? `?${str}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <StoreHero
        title="Skins"
        blurb={`Every skin seen on Native and on the Minecraft players looked up here${data.total ? ` — ${data.total.toLocaleString()} so far` : ""}. Preview in 3D, like and download.`}
        cta={{ text: "Want yours here?", label: "Get the launcher", href: "/download" }}
        aside={
          <form action="/skins" method="get" role="search" className="st-search w-full sm:w-[360px]">
            <Search aria-hidden className="h-4 w-4 shrink-0 text-dim" />
            {sort !== "trending" && <input type="hidden" name="sort" value={sort} />}
            <input name="q" defaultValue={q} placeholder="Skins worn by player…" aria-label="Search skins by player" autoComplete="off" spellCheck={false} maxLength={16} />
            <button type="submit" className="pxb is-sm"><span className="pxb-face">Search</span></button>
          </form>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="st-seg" role="tablist" aria-label="Sort skins">
          {SORTS.map(({ id, label, Icon }) => (
            <Link key={id} role="tab" aria-selected={sort === id} href={href({ sort: id })} className={`inline-flex items-center gap-2 rounded-[7px] px-3.5 py-2 text-[13px] font-bold ${sort === id ? "is-on bg-inv text-inv-fg" : "text-mute hover:text-fg"}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </div>
        {q && <p className="text-[13.5px] text-dim">Skins worn by players starting with “{q}” · <Link href={href({}).replace(/[?&]q=[^&]*/, "") || "/skins"} className="underline">clear</Link></p>}
      </div>
      {data.skins.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data.skins.map((s) => <li key={s.hash}><SkinCard skin={s} /></li>)}
        </ul>
      ) : (
        <div className="st-panel mt-6 p-12 text-center text-[15px] text-mute">{q ? `No skins found for “${q}”. Look the player up on the Players page first.` : "No skins yet."}</div>
      )}
      {(page > 0 || data.more) && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pages">
          {page > 0 && <Link href={href({ page: page - 1 })} className="pxb is-ghost"><span className="pxb-face">Previous</span></Link>}
          <span className="text-[13px] text-dim">Page {page + 1}</span>
          {data.more && <Link href={href({ page: page + 1 })} className="pxb is-ghost"><span className="pxb-face">Next</span></Link>}
        </nav>
      )}
    </div>
  );
}
