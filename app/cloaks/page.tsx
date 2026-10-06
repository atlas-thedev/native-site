import JsonLd from "@/components/JsonLd";
import CapeGallery from "@/components/capes/CapeGallery";
import { readSession } from "@/lib/server/session";
import { getCatalog, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";
import StoreLockBanner from "@/components/launch/StoreLockBanner";

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

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-10 sm:pt-14">
      <JsonLd data={breadcrumb([{ name: "Cloaks", path: "/cloaks" }])} />
      <h1 className="sr-only">Native cloaks</h1>
      <StoreLockBanner signedIn={!!s} />
      <CapeGallery items={items} signedIn={!!s} owned={mine?.owned ?? []} equipped={mine?.equipped ?? null} />
    </div>
  );
}
