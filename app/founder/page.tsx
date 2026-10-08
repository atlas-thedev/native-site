import { redirect } from "next/navigation";
import FounderPicker from "@/components/launch/FounderPicker";
import { API_URL } from "@/lib/server/config";
import { readSession } from "@/lib/server/session";
import { getCatalog, getLook } from "@/lib/server/store";
import { getSiteConfig } from "@/lib/server/siteConfig";
import { pageMeta } from "@/lib/seo";
import type { StoreItem } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({ title: "Your free founder gift", description: "Join Native before launch and pick one cloak or cosmetic for free.", path: "/founder", noindex: true });

type Founder = { eligible?: boolean; picked?: string | null; capes?: string[] };

export default async function FounderPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const s = await readSession();
  if (!s) redirect("/register?next=/founder");
  const { welcome } = await searchParams;

  let f: Founder | null = null;
  try {
    const r = await fetch(`${API_URL}/v1/site/founder`, { headers: { Authorization: `Bearer ${s.token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (r.status === 401) redirect("/api/auth/expired");
    if (r.ok) f = (await r.json()) as Founder;
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
  }
  const [catalog, look, cfg] = await Promise.all([getCatalog(), getLook(s.account.name, s.account.model, s.account.uuid), getSiteConfig()]);
  const byId = new Map([...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])].map((i) => [i.id, i]));
  const capes = (f?.capes ?? cfg.launch.founderCapes).map((id) => byId.get(id)).filter((i): i is StoreItem => !!i);
  if (!f?.eligible && !f?.picked) redirect("/account");

  return (
    <FounderPicker
      name={s.account.name}
      capes={capes}
      picked={f?.picked ?? null}
      welcome={welcome === "1"}
      skin={look.skin}
      model={look.model}
    />
  );
}
