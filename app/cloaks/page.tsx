import JsonLd from "@/components/JsonLd";
import CapeGallery from "@/components/capes/CapeGallery";
import CapeStrip from "@/components/CapeStrip";
import StoreHero from "@/components/store/StoreHero";
import { readSession } from "@/lib/server/session";
import { getCatalog, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";
import StoreLockBanner from "@/components/launch/StoreLockBanner";
import { isPaid, sortItems } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Cloaks",
  description: "Browse every Native cloak, animated and classic. Preview them in 3D, add them to your locker and wear them in the launcher and in game.",
  path: "/cloaks",
});

export default async function CloaksPage() {
  const [catalog, s] = await Promise.all([getCatalog(), readSession()]);
  const mine = s ? await getMine(s.token) : null;
  const items = catalog?.items ?? [];
  const show = sortItems(items.filter((i) => i.animated)).concat(sortItems(items.filter((i) => !i.animated))).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-10 sm:pt-14">
      <JsonLd data={breadcrumb([{ name: "Cloaks", path: "/cloaks" }])} />
      <StoreHero
        active="cloaks"
        eyebrow="Native store"
        title="Cloaks"
        blurb="Animated and classic cloaks you can only get from Native. Preview any of them in 3D, add it to your locker, then wear it in the launcher and in game."
        stats={[["Cloaks", items.length], ["Animated", items.filter((i) => i.animated).length], ["Free", items.filter((i) => !i.exclusive && !isPaid(i)).length]]}
        previews={show.map((it, i) => (
          <div key={it.id} className={i === 1 ? "-mb-3" : ""}>
            <CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={i === 1 ? 96 : 80} label={`${it.name} cloak`} className="cutout-sm" />
          </div>
        ))}
      />
      <StoreLockBanner signedIn={!!s} />
      <CapeGallery items={items} signedIn={!!s} owned={mine?.owned ?? []} equipped={mine?.equipped ?? null} />
    </div>
  );
}
