import JsonLd from "@/components/JsonLd";
import CosmeticsStudio from "@/components/cosmetics/CosmeticsStudio";
import StoreLockBanner from "@/components/launch/StoreLockBanner";
import { readSession } from "@/lib/server/session";
import { getCatalog, getLook, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Cosmetics",
  description: "Native 3D cosmetics: hats, glasses, wings, backpacks and shoes. Try any mix on your own skin in 3D, then wear it in the launcher and in game.",
  path: "/cosmetics",
});

type Search = { searchParams: Promise<{ item?: string | string[] }> };

export default async function CosmeticsPage({ searchParams }: Search) {
  const [{ item }, catalog, s] = await Promise.all([searchParams, getCatalog(), readSession()]);
  const [mine, look] = s ? await Promise.all([getMine(s.token), getLook(s.account.name, s.account.model)]) : [null, { skin: null, model: "default" as const }];
  const cosmetics = catalog?.cosmetics ?? [];
  const cape = mine?.equipped ? catalog?.items.find((i) => i.id === mine.equipped)?.stillUrl ?? null : null;

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-10 sm:pt-14">
      <JsonLd data={breadcrumb([{ name: "Cosmetics", path: "/cosmetics" }])} />
      <StoreLockBanner signedIn={!!s} />
      <CosmeticsStudio
        items={cosmetics}
        signedIn={!!s}
        owned={mine?.owned ?? []}
        wearing={mine?.wearing ?? {}}
        skin={look.skin}
        model={look.model}
        cape={cape}
        initialId={typeof item === "string" ? item : null}
      />
    </div>
  );
}
