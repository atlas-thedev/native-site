import type { Metadata } from "next";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CapeStrip from "@/components/CapeStrip";
import JsonLd from "@/components/JsonLd";
import CapeDetail from "@/components/capes/CapeDetail";
import { readSession } from "@/lib/server/session";
import { getCatalog, getLook, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const item = (await getCatalog())?.items.find((i) => i.id === id);
  if (!item) return pageMeta({ title: "Cloak not found", description: "This cloak isn’t in the Native store.", path: `/cloaks/${id}`, noindex: true });
  return pageMeta({
    title: `${item.name} cloak`,
    description: item.description || `${item.animated ? "Animated" : "Classic"} Native cloak. Preview it in 3D and wear it in the launcher and in game.`,
    path: `/cloaks/${item.id}`,
  });
}

export default async function CapePage({ params }: Params) {
  const { id } = await params;
  const [catalog, s] = await Promise.all([getCatalog(), readSession()]);
  const items = catalog?.items ?? [];
  const item = items.find((i) => i.id === id);
  if (!item && catalog?.cosmetics.some((c) => c.id === id)) redirect(`/cosmetics?item=${encodeURIComponent(id)}`);
  if (!item) notFound();
  const [mine, look] = s ? await Promise.all([getMine(s.token), getLook(s.account.name, s.account.model)]) : [null, { skin: null, model: "default" as const }];
  const related = items
    .filter((i) => i.id !== item.id)
    .map((i) => ({ i, score: i.tags.filter((t) => item.tags.includes(t)).length * 2 + Number(i.animated === item.animated) }))
    .sort((a, b) => b.score - a.score || (b.i.owners ?? 0) - (a.i.owners ?? 0))
    .slice(0, 5)
    .map((x) => x.i);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-10 sm:pt-14">
      <JsonLd data={breadcrumb([{ name: "Cloaks", path: "/cloaks" }, { name: item.name, path: `/cloaks/${item.id}` }])} />
      <Link href="/cloaks" className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-mute transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> All cloaks
      </Link>
      <CapeDetail item={item} signedIn={!!s} owned={mine?.owned ?? []} equipped={mine?.equipped ?? null} skin={look.skin} model={look.model} />

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="more">
          <h2 id="more" className="text-[24px] font-extrabold tracking-tight">More cloaks</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((it) => (
              <li key={it.id}>
                <Link href={`/cloaks/${it.id}`} className="group flex flex-col rounded-[22px] border border-line bg-surface p-3 transition hover:-translate-y-0.5 hover:bg-surface-2">
                  <div className="dots flex aspect-[4/5] items-center justify-center rounded-2xl">
                    <CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={72} label={`${it.name} cloak`} className="cutout-sm transition duration-500 group-hover:scale-[1.06]" />
                  </div>
                  <p className="truncate px-1.5 pt-3 text-[15px] font-bold tracking-tight">{it.name}</p>
                  <p className="flex items-center gap-1 px-1.5 pb-1 text-[12.5px] text-dim"><Users className="h-3.5 w-3.5" />{(it.owners ?? 0).toLocaleString()}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
