import { NextResponse } from "next/server";
import { api, clearSession, readSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });

/** Payments config + (when signed in) the account's Native+ status and purchases. */
export async function GET(req: Request) {
  const cfg = await api("/v1/billing/config", { method: "GET", headers: upstreamHeaders(req) });
  const config = cfg.data ?? {};
  const s = await readSession();
  if (!s) return json({ ok: true, signedIn: false, config });
  const me = await api("/v1/billing/me", { method: "GET", headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }) });
  if (me.status === 401) {
    await clearSession();
    return json({ ok: true, signedIn: false, config });
  }
  return json({ ok: true, signedIn: true, config, plus: me.data?.plus ?? null, purchases: me.data?.purchases ?? [] });
}

const ACTIONS = { checkout: "/v1/billing/checkout", portal: "/v1/billing/portal", redeem: "/v1/store/redeem" } as const;

/**
 * { action: "checkout", kind: "cape", itemId } | { action: "checkout", kind: "plus", plan: "monthly" | "yearly" }
 * { action: "portal" } opens Paddle's customer portal. { action: "redeem", code } redeems a code.
 */
export async function POST(req: Request) {
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in with your Native account first.", signIn: true }, 401);
  let b: Record<string, unknown> = {};
  try {
    b = await req.json();
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }
  const action = typeof b.action === "string" && b.action in ACTIONS ? (b.action as keyof typeof ACTIONS) : null;
  if (!action) return json({ ok: false, error: "Bad request." }, 400);
  const body =
    action === "checkout" ? { kind: b.kind === "plus" ? "plus" : "cape", itemId: String(b.itemId ?? "").slice(0, 80), plan: b.plan === "yearly" ? "yearly" : "monthly" }
    : action === "redeem" ? { code: String(b.code ?? "").slice(0, 40) }
    : {};
  const { status, data } = await api(ACTIONS[action], {
    method: "POST",
    headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}`, "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (status === 401) {
    await clearSession();
    return json({ ok: false, error: "Your session expired. Sign in again.", expired: true }, 401);
  }
  if (status >= 400 || data?.ok === false) return json({ ok: false, error: (data?.error as string) || "Couldn’t do that. Try again." }, status >= 400 ? status : 502);
  return json({ ...data, ok: true });
}
