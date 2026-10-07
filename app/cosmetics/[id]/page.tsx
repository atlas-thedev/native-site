import type { Metadata } from "next";
import WornShot from "@/components/cosmetics/WornShot";
import ItemCard from "@/components/store/ItemCard";
import ItemHead from "@/components/store/ItemHead";
import WishButton from "@/components/store/WishButton";
import { notFound, redirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import CosmeticDetail from "@/components/cosmetics/CosmeticDetail";
import { readSession } from "@/lib/server/session";
import { getCatalog, getLook, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { SLOT_NAMES } from "@/lib/store";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const item = (await getCatalog())?.cosmetics.find((i) => i.id === id);
  if (!item) return pageMeta({ title: "Cosmetic not found", description: "This cosmetic isn’t in the Native store.", path: `/cosmetics/${id}`, noindex: true });
  return pageMeta({
    title: `${item.name} ${item.slot ? SLOT_NAMES[item.slot].toLowerCase() : "cosmetic"}`,
    description: item.description || "Native 3D cosmetic. Preview it on your skin and wear it in the launcher and in game.",
    path: `/cosmetics/${item.id}`,
    image: `/api/og/item/${item.id}`,
  });
}

export default async function CosmeticPage({ params }: Params) {
  const { id } = await params;
  const [catalog, s] = await Promise.all([getCatalog(), readSession()]);
  const all = catalog?.cosmetics ?? [];
  const item = all.find((i) => i.id === id);
  if (!item && catalog?.items.some((c) => c.id === id)) redirect(`/cloaks/${encodeURIComponent(id)}`);
  if (!item) notFound();
  const [mine, look] = s ? await Promise.all([getMine(s.token), getLook(s.account.name, s.account.model, s.account.uuid)]) : [null, { skin: null, model: "default" as const }];
  const cape = mine?.equipped ? catalog?.items.find((i) => i.id === mine.equipped)?.stillUrl ?? null : null;
  const related = all
    .filter((i) => i.id !== item.id)
    .map((i) => ({ i, score: Number(i.slot === item.slot) * 3 + i.tags.filter((t) => item.tags.includes(t)).length * 2 }))
    .sort((a, b) => b.score - a.score || (b.i.owners ?? 0) - (a.i.owners ?? 0))
    .slice(0, 5)
    .map((x) => x.i);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <JsonLd data={breadcrumb([{ name: "Store", path: "/store" }, { name: item.name, path: `/cosmetics/${item.id}` }])} />
      <ItemHead trail={[{ label: "Store", href: "/store" }, item.slot ? { label: SLOT_NAMES[item.slot], href: `/store?c=${item.slot}` } : { label: "Cosmetics" }, { label: item.name }]} back={item.slot ? `/store?c=${item.slot}` : "/store"} title={item.name} aside={<WishButton itemId={item.id} signedIn={!!s} />} />
      <CosmeticDetail item={item} all={all} signedIn={!!s} account={s?.account.name ?? null} owned={mine?.owned ?? []} wearing={mine?.wearing ?? {}} skin={look.skin} model={look.model} cape={cape} />

      {related.length > 0 && (
        <section className="st-sep mt-14 pt-10" aria-labelledby="more">
          <h2 id="more" className="st-h2">More cosmetics</h2>
          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((it) => (
              <li key={it.id}>
                <ItemCard item={it} href={`/cosmetics/${it.id}`} art={<WornShot item={it} skin={look.skin} model={look.model} className="cutout-sm h-[150px] w-[150px] max-w-[78%] object-contain" />} left={it.isNew ? <span className="st-tag is-inv">New</span> : null} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
