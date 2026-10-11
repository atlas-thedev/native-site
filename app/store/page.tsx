import LauncherOnly from "@/components/launcher/LauncherOnly";
import { readSession } from "@/lib/server/session";
import { getAccountLook, getCatalog, getMine } from "@/lib/server/store";
import { outfitOf } from "@/lib/outfit";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Store",
  description: "The Native store lives in the Native launcher: cloaks, hats, wings, shoes and dyeable cosmetics you can try on in 3D and wear in game.",
  path: "/store",
});

export default async function StorePage() {
  const s = await readSession();
  if (!s) return <LauncherOnly from="store" skin={null} model="default" />;
  const [look, catalog, mine] = await Promise.all([
    getAccountLook(s.token, s.account.name, s.account.uuid, s.account.model).catch(() => null),
    getCatalog(),
    getMine(s.token),
  ]);
  const items = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])];
  // Draw the visitor wearing their Native cloak and cosmetics, same as in game.
  const outfit = outfitOf(mine, items);
  return (
    <LauncherOnly
      from="store"
      name={s.account.name}
      skin={look?.skin ?? null}
      model={look?.model ?? "default"}
      cape={outfit.cape ?? look?.cape ?? null}
      capeAnim={outfit.capeAnim}
      worn={outfit.worn}
    />
  );
}
