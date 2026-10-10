import BetaProgram from "@/components/beta/BetaProgram";
import { API_URL } from "@/lib/server/config";
import { readSession } from "@/lib/server/session";
import { getCatalog, getAccountLook } from "@/lib/server/store";
import { getSiteConfig } from "@/lib/server/siteConfig";
import { pageMeta } from "@/lib/seo";
import type { BetaApplication } from "@/lib/launch";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Super Beta Tester program",
  description: "Apply to test Native before everyone else. Accepted testers get the Super Beta Tester cape, badge and Native+ forever.",
  path: "/beta",
});

export default async function BetaPage() {
  const s = await readSession();
  const [cfg, catalog] = await Promise.all([getSiteConfig(), getCatalog()]);
  let application: BetaApplication | null = null;
  let open = cfg.beta.open;
  if (s) {
    try {
      const r = await fetch(`${API_URL}/v1/beta/me`, { headers: { Authorization: `Bearer ${s.token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (r.ok) {
        const d = (await r.json()) as { open?: boolean; application?: BetaApplication | null };
        application = d.application ?? null;
        if (typeof d.open === "boolean") open = d.open;
      }
    } catch {}
  }
  const look = s ? await getAccountLook(s.token, s.account.name, s.account.uuid, s.account.model) : { skin: null, model: "default" as const };
  const cape = catalog?.items.find((i) => i.id === "super-beta-tester") ?? null;
  return <BetaProgram signedIn={!!s} name={s?.account.name ?? null} open={open} initial={application} cape={cape} skin={look.skin} model={look.model} />;
}
