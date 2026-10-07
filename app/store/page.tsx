import JsonLd from "@/components/JsonLd";
import StoreBrowser, { type Cat } from "@/components/store/StoreBrowser";
import StoreLockBanner from "@/components/launch/StoreLockBanner";
import { readSession } from "@/lib/server/session";
import { getCatalog, getLook, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { COSMETIC_SLOTS } from "@/lib/store";

const CATS: string[] = ["capes", ...COSMETIC_SLOTS, "bundles"];

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Store",
  description: "The Native store: cloaks, hats, glasses, wings, backpacks, shoes and more. Try everything on your own skin in 3D, build an outfit, then wear it in the launcher and in game.",
  path: "/store",
});

export default async function StorePage({ searchParams }: { searchParams: Promise<{ c?: string | string[] }> }) {
  const [catalog, s, sp] = await Promise.all([getCatalog(), readSession(), searchParams]);
  const [mine, look] = s ? await Promise.all([getMine(s.token), getLook(s.account.name, s.account.model, s.account.uuid)]) : [null, null];
  const c = Array.isArray(sp.c) ? sp.c[0] : sp.c;
  const initialCat = c && CATS.includes(c) ? (c as Cat) : "all";
  const items = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])];

  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-32 pt-8">
      <JsonLd data={breadcrumb([{ name: "Store", path: "/store" }])} />
      <StoreBrowser
        items={items}
        signedIn={!!s}
        owned={mine?.owned ?? []}
        equipped={mine?.equipped ?? null}
        wearing={mine?.wearing ?? {}}
        sides={mine?.sides ?? {}}
        skin={look?.skin ?? null}
        model={look?.model ?? (s?.account.model === "slim" ? "slim" : "default")}
        initialCat={initialCat}
        bundles={catalog?.bundles ?? []}
        bundleMine={mine?.bundles ?? {}}
        banner={<StoreLockBanner key="lock" signedIn={!!s} />}
      />
    </div>
  );
}
