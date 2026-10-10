import LauncherOnly from "@/components/launcher/LauncherOnly";
import { readSession } from "@/lib/server/session";
import { getAccountLook } from "@/lib/server/store";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Store",
  description: "The Native store lives in the Native launcher: cloaks, hats, wings, shoes and dyeable cosmetics you can try on in 3D and wear in game.",
  path: "/store",
});

export default async function StorePage() {
  const s = await readSession();
  const look = s ? await getAccountLook(s.token, s.account.name, s.account.uuid, s.account.model).catch(() => null) : null;
  return <LauncherOnly from="store" skin={look?.skin ?? null} model={look?.model ?? "default"} />;
}
