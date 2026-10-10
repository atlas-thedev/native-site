import { redirect } from "next/navigation";
import BillingPanel from "@/components/BillingPanel";
import AccountCard from "@/components/AccountCard";
import AboutEditor from "@/components/players/AboutEditor";
import LauncherOnly from "@/components/launcher/LauncherOnly";
import { API_URL } from "@/lib/server/config";
import { readSession } from "@/lib/server/session";
import { pageMeta } from "@/lib/seo";
import { getCatalog, getMojangLook } from "@/lib/server/store";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({ title: "Your account", description: "Your Native account. Skins, cloaks and cosmetics are managed in the Native launcher.", path: "/account", noindex: true });

const https = (u: unknown) => (typeof u === "string" && u ? (/^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(u) ? u : u.replace(/^http:\/\//, "https://")) : null);

export default async function AccountPage() {
  const s = await readSession();
  if (!s) redirect("/login");

  // Validate the session; a 401 means it expired or was revoked.
  let authType = "native", mcUuid: string | null = s.account.uuid ?? null;
  try {
    const r = await fetch(`${API_URL}/v1/account/minecraft`, { headers: { Authorization: `Bearer ${s.token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (r.status === 401) redirect("/api/auth/expired");
    if (r.ok) {
      const j = await r.json();
      if (typeof j?.account?.type === "string") authType = j.account.type;
      if (typeof j?.profile?.uuid === "string") mcUuid = j.profile.uuid;
    }
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // Next redirect
  }

  let skin: string | null = null, cape: string | null = null, model: "default" | "slim" = "default";
  try {
    const r = await fetch(`${API_URL}/csl/${encodeURIComponent(s.account.name)}.json`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const p = await r.json();
      skin = https(p.skin);
      cape = https(p.cape);
      model = p.model === "slim" ? "slim" : "default";
    }
  } catch {}

  // Premium (Microsoft) accounts wear their real Minecraft skin.
  const premium = authType === "premium" || authType === "merged";
  if (premium && mcUuid) {
    const real = await getMojangLook(mcUuid);
    if (real.skin) {
      skin = real.skin;
      model = real.model;
    }
    if (!cape && real.cape) cape = real.cape;
  }

  const [catalog, founder] = await Promise.all([
    getCatalog(),
    fetch(`${API_URL}/v1/site/founder`, { headers: { Authorization: `Bearer ${s.token}` }, cache: "no-store", signal: AbortSignal.timeout(6000) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null) as Promise<{ eligible?: boolean; picked?: string | null } | null>,
  ]);
  const names = Object.fromEntries([...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])].map((i) => [i.id, i.name]));
  return (
    <>
      <AccountCard name={s.account.name} email={s.account.email} premium={premium} skin={skin} />
      <AboutEditor name={s.account.name} />
      {founder?.eligible && !founder.picked && (
        <div className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-8">
          <Link href="/founder" className="dots flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line p-5 transition hover:border-fg/40 sm:p-6">
            <span>
              <span className="block text-[20px] font-extrabold tracking-tight">You have a free founder cloak waiting</span>
              <span className="mt-1 block text-mute">You joined before launch, so one founder cloak is on us. Pick yours.</span>
            </span>
            <span className="inline-flex h-11 items-center rounded-full bg-inv px-5 text-[14.5px] font-semibold text-inv-fg">Pick it now</span>
          </Link>
        </div>
      )}
      <LauncherOnly from="locker" skin={skin} model={model} cape={cape} />
      <BillingPanel names={names} />
    </>
  );
}
