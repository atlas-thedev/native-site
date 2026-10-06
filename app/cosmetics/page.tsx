import JsonLd from "@/components/JsonLd";
import CosmeticGallery from "@/components/cosmetics/CosmeticGallery";
import StoreHero from "@/components/store/StoreHero";
import StoreLockBanner from "@/components/launch/StoreLockBanner";
import { readSession } from "@/lib/server/session";
import { getCatalog, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { COSMETIC_SLOTS, isPaid, sortItems } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Cosmetics",
  description: "Native 3D cosmetics: hats, glasses, wings, backpacks and shoes. Preview them on your own skin in 3D, then wear them in the launcher and in game.",
  path: "/cosmetics",
});

export default async function CosmeticsPage() {
  const [catalog, s] = await Promise.all([getCatalog(), readSession()]);
  const mine = s ? await getMine(s.token) : null;
  const items = catalog?.cosmetics ?? [];
  const show = sortItems(items).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-10 sm:pt-14">
      <JsonLd data={breadcrumb([{ name: "Cosmetics", path: "/cosmetics" }])} />
      <StoreHero
        active="cosmetics"
        eyebrow="Native store"
        title="Cosmetics"
        blurb="Hats, glasses, wings, backpacks and shoes in real 3D. Preview any piece on your own skin, add it to your locker, then wear it in the launcher and in game."
        stats={[["Cosmetics", items.length], ["Slots", COSMETIC_SLOTS.length], ["Free", items.filter((i) => !i.exclusive && !isPaid(i)).length]]}
        previews={show.map((it, i) => (
          <img key={it.id} src={it.stillUrl} alt="" className={`cutout-sm object-contain [image-rendering:pixelated] ${i === 1 ? "h-24 w-24 -mb-3" : "h-20 w-20"}`} />
        ))}
      />
      <StoreLockBanner signedIn={!!s} />
      <CosmeticGallery items={items} signedIn={!!s} owned={mine?.owned ?? []} wearing={mine?.wearing ?? {}} />
    </div>
  );
}
