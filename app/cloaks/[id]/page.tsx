import type { Metadata } from "next";
import ItemCard from "@/components/store/ItemCard";
import ItemHead from "@/components/store/ItemHead";
import WishButton from "@/components/store/WishButton";
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
    image: `/api/og/item/${item.id}`,
  });
}

export default async function CapePage({ params }: Params) {
  const { id } = await params;
  const [catalog, s] = await Promise.all([getCatalog(), readSession()]);
  const items = catalog?.items ?? [];
  const item = items.find((i) => i.id === id);
  if (!item && catalog?.cosmetics.some((c) => c.id === id)) redirect(`/cosmetics/${encodeURIComponent(id)}`);
  if (!item) notFound();
  const [mine, look] = s ? await Promise.all([getMine(s.token), getLook(s.account.name, s.account.model)]) : [null, { skin: null, model: "default" as const }];
  const related = items
    .filter((i) => i.id !== item.id)
    .map((i) => ({ i, score: i.tags.filter((t) => item.tags.includes(t)).length * 2 + Number(i.animated === item.animated) }))
    .sort((a, b) => b.score - a.score || (b.i.owners ?? 0) - (a.i.owners ?? 0))
    .slice(0, 5)
    .map((x) => x.i);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <JsonLd data={breadcrumb([{ name: "Cloaks", path: "/cloaks" }, { name: item.name, path: `/cloaks/${item.id}` }])} />
      <ItemHead trail={[{ label: "Store", href: "/cloaks" }, { label: "Cloaks", href: "/cloaks" }, { label: item.name }]} back="/cloaks" title={item.name} aside={<WishButton itemId={item.id} signedIn={!!s} />} />
      <CapeDetail item={item} signedIn={!!s} owned={mine?.owned ?? []} equipped={mine?.equipped ?? null} skin={look.skin} model={look.model} account={s?.account.name ?? null} />

      {related.length > 0 && (
        <section className="st-sep mt-14 pt-10" aria-labelledby="more">
          <h2 id="more" className="st-h2">More cloaks</h2>
          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((it) => (
              <li key={it.id}>
                <ItemCard item={it} href={`/cloaks/${it.id}`} aspect="aspect-[4/5]" players art={<CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={72} label={`${it.name} cloak`} className="cutout-sm" />} left={it.animated ? <span className="st-tag is-inv">Animated</span> : null} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
