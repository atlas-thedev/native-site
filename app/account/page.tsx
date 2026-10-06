import { redirect } from "next/navigation";
import BillingPanel from "@/components/BillingPanel";
import Locker from "@/components/Locker";
import { API_URL } from "@/lib/server/config";
import { readSession } from "@/lib/server/session";
import { pageMeta } from "@/lib/seo";
import { capeAnimOf, type CapeAnim, type StoreItem } from "@/lib/store";
import { getCatalog, getMine } from "@/lib/server/store";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({ title: "Your locker", description: "Manage your Native skin, cloak and account.", path: "/account", noindex: true });

/** sha256 of the classic cape PNGs in /public/capes (the server names textures by their sha256). */
const PRESET_CAPE_IDS: Record<string, string> = {
  "0b4f4ee1bf094876a8454838b7cd07184dce86428b3cab4122b3bb7d67e530b6": "anniversary",
  be05a2d92dd043034c9ae6d7c8415e8bc990080ba4dc4c70e9ea92cf9a89705c: "cherry",
  "77065df71efe39771d3af4832ed62803c551772cc2f78e744d52822ae949f6c6": "followers",
  "99aba02ef05ec6aa4d42db8ee43796d6cd50e4b2954ab29f0caeb85f96bf52a1": "founders",
  "2340c0e03dd24a11b15a8b33c2a7e9e32abb2051b2481d0ba7defd635ca7a933": "migrator",
  "6836989ef37c72e84552410f178740a3d630ed4ecdce14029e6e9e155980d06c": "heart",
  f9a76537647989f9a0b6d001e320dac591c359e9e61a31f4ce11c88f207f0ad4: "vanilla",
};

const https = (u: unknown) => (typeof u === "string" && u ? u.replace(/^http:\/\//, "https://") : null);

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
  let capeAnim: CapeAnim | null = null, capeStore: string | null = null;
  try {
    const r = await fetch(`${API_URL}/csl/${encodeURIComponent(s.account.name)}.json`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const p = await r.json();
      skin = https(p.skin);
      cape = https(p.cape);
      model = p.model === "slim" ? "slim" : "default";
      capeAnim = capeAnimOf(p.capeAnimation);
      capeStore = typeof p.capeStore === "string" ? p.capeStore : null;
    }
  } catch {}

  // Premium (Microsoft) accounts wear their real Minecraft skin and cape.
  const premium = authType === "premium" || authType === "merged";
  let mojangCape: string | null = null;
  if (premium && mcUuid) {
    try {
      const r = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${mcUuid.replace(/-/g, "")}`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
      if (r.ok) {
        const p = await r.json();
        const v = (p.properties ?? []).find((x: { name: string }) => x.name === "textures")?.value;
        const t = v ? JSON.parse(Buffer.from(v, "base64").toString("utf8")).textures ?? {} : {};
        if (t.SKIN?.url) {
          skin = https(t.SKIN.url);
          model = t.SKIN.metadata?.model === "slim" ? "slim" : "default";
        }
        mojangCape = https(t.CAPE?.url);
      }
    } catch {}
  }

  const [catalog, mine, founder] = await Promise.all([
    getCatalog(),
    getMine(s.token),
    fetch(`${API_URL}/v1/site/founder`, { headers: { Authorization: `Bearer ${s.token}` }, cache: "no-store", signal: AbortSignal.timeout(6000) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null) as Promise<{ eligible?: boolean; picked?: string | null } | null>,
  ]);
  const byId = new Map((catalog?.items ?? []).map((i) => [i.id, i]));
  const nativeCapes = (mine?.owned ?? []).map((o) => byId.get(o.id)).filter((i): i is StoreItem => !!i);

  // Show the worn cape as its own card (a classic cape or a Native cloak), never as a vague "current cape".
  const wornStore = mine?.equipped ?? capeStore;
  const capeHash = (cape?.match(/\/textures\/([a-f0-9]{64})/i) || [])[1]?.toLowerCase();
  const capeId = !cape ? "none" : wornStore ? "store" : (capeHash && PRESET_CAPE_IDS[capeHash]) || "current";
  if (premium && !wornStore && mojangCape) cape = mojangCape;

  const names = Object.fromEntries((catalog?.items ?? []).map((i) => [i.id, i.name]));
  return (
    <>
      {founder?.eligible && !founder.picked && (
        <div className="mx-auto max-w-[1280px] px-5 pt-8">
          <Link href="/founder" className="dots flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line p-5 transition hover:border-fg/40 sm:p-6">
            <span>
              <span className="block text-[20px] font-extrabold tracking-tight">You have a free founder cloak waiting</span>
              <span className="mt-1 block text-mute">You joined before launch, so one founder cloak is on us. Pick yours.</span>
            </span>
            <span className="inline-flex h-11 items-center rounded-full bg-inv px-5 text-[14.5px] font-semibold text-inv-fg">Pick it now</span>
          </Link>
        </div>
      )}
      <Locker initial={{ name: s.account.name, email: s.account.email, premium, skin, cape, model, capeAnim, capeStore: wornStore, nativeCapes, capeId }} />
      <BillingPanel names={names} />
    </>
  );
}
