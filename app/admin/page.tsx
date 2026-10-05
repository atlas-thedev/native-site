import { notFound, redirect } from "next/navigation";
import AdminApp from "@/components/admin/AdminApp";
import { API_URL } from "@/lib/server/config";
import { readSession } from "@/lib/server/session";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({ title: "Admin", description: "Native admin dashboard.", path: "/admin", noindex: true });

export default async function AdminPage() {
  const s = await readSession();
  if (!s) redirect("/login?next=/admin");
  let isAdmin = false;
  try {
    const r = await fetch(`${API_URL}/v1/admin/status`, { headers: { Authorization: `Bearer ${s.token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (r.status === 401) redirect("/api/auth/expired");
    isAdmin = r.ok && (await r.json()).isAdmin === true;
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
  }
  if (!isAdmin) notFound();
  return <AdminApp name={s.account.name} />;
}
