import type { Metadata } from "next";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
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
  });
}

export default async function CosmeticPage({ params }: Params) {
  const { id } = await params;
  const [catalog, s] = await Promise.all([getCatalog(), readSession()]);
  const all = catalog?.cosmetics ?? [];
  const item = all.find((i) => i.id === id);
  if (!item && catalog?.items.some((c) => c.id === id)) redirect(`/cloaks/${encodeURIComponent(id)}`);
  if (!item) notFound();
  const [mine, look] = s ? await Promise.all([getMine(s.token), getLook(s.account.name, s.account.model)]) : [null, { skin: null, model: "default" as const }];
  const cape = mine?.equipped ? catalog?.items.find((i) => i.id === mine.equipped)?.stillUrl ?? null : null;
  const related = all
    .filter((i) => i.id !== item.id)
    .map((i) => ({ i, score: Number(i.slot === item.slot) * 3 + i.tags.filter((t) => item.tags.includes(t)).length * 2 }))
    .sort((a, b) => b.score - a.score || (b.i.owners ?? 0) - (a.i.owners ?? 0))
    .slice(0, 5)
    .map((x) => x.i);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-10 sm:pt-14">
      <JsonLd data={breadcrumb([{ name: "Cosmetics", path: "/cosmetics" }, { name: item.name, path: `/cosmetics/${item.id}` }])} />
      <Link href="/cosmetics" className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-mute transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> All cosmetics
      </Link>
      <CosmeticDetail item={item} all={all} signedIn={!!s} owned={mine?.owned ?? []} wearing={mine?.wearing ?? {}} skin={look.skin} model={look.model} cape={cape} />

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="more">
          <h2 id="more" className="text-[24px] font-extrabold tracking-tight">More cosmetics</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((it) => (
              <li key={it.id}>
                <Link href={`/cosmetics/${it.id}`} className="group flex flex-col rounded-[22px] border border-line bg-surface p-3 transition hover:-translate-y-0.5 hover:bg-surface-2">
                  <div className="dots flex aspect-[4/5] items-center justify-center rounded-2xl">
                    <img src={it.stillUrl} alt="" loading="lazy" className="cutout-sm h-[62%] w-[62%] object-contain transition duration-500 [image-rendering:pixelated] group-hover:scale-[1.08]" />
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
