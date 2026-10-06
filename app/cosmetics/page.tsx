import JsonLd from "@/components/JsonLd";
import CosmeticGallery from "@/components/cosmetics/CosmeticGallery";
import StoreLockBanner from "@/components/launch/StoreLockBanner";
import { readSession } from "@/lib/server/session";
import { getCatalog, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Cosmetics",
  description: "Native 3D cosmetics: hats, glasses, wings, backpacks and shoes. Preview them on your own skin in 3D, then wear them in the launcher and in game.",
  path: "/cosmetics",
});

export default async function CosmeticsPage() {
  const [catalog, s] = await Promise.all([getCatalog(), readSession()]);
  const mine = s ? await getMine(s.token) : null;

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <JsonLd data={breadcrumb([{ name: "Cosmetics", path: "/cosmetics" }])} />
      <CosmeticGallery items={catalog?.cosmetics ?? []} signedIn={!!s} owned={mine?.owned ?? []} wearing={mine?.wearing ?? {}} banner={<StoreLockBanner signedIn={!!s} />} />
    </div>
  );
}
