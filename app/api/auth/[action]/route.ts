import { NextResponse } from "next/server";
import { api, clearSession, readSession, setSession, upstreamHeaders, type SiteAccount } from "@/lib/server/session";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 200) => String(v ?? "").slice(0, max);
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

const UP: Record<string, string> = {
  "send-code": "/v1/auth/register/send-code",
  verify: "/v1/auth/register/verify",
  login: "/v1/auth/login",
  forgot: "/v1/auth/password/forgot",
  reset: "/v1/auth/password/reset",
};

export async function GET(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action === "expired") {
    await clearSession();
    return NextResponse.redirect(new URL("/login", req.url), 302);
  }
  if (action !== "me") return json({ ok: false, error: "Not found." }, 404);
  const s = await readSession();
  return json({ ok: true, account: s ? { name: s.account.name, uuid: s.account.uuid ?? null } : null });
}

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;

  if (action === "logout") {
    await clearSession();
    return json({ ok: true });
  }

  const path = UP[action];
  if (!path) return json({ ok: false, error: "Not found." }, 404);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const payload: Record<string, unknown> = {};
  if (action === "login") Object.assign(payload, { login: str(body.login), password: str(body.password, 300) });
  if (action === "send-code") Object.assign(payload, { email: str(body.email), username: str(body.username, 32) });
  if (action === "verify")
    Object.assign(payload, { email: str(body.email), code: str(body.code, 12), username: str(body.username, 32), password: str(body.password, 300), model: body.model === "slim" ? "slim" : "classic" });
  if (action === "forgot") Object.assign(payload, { email: str(body.email) });
  if (action === "reset") Object.assign(payload, { email: str(body.email), code: str(body.code, 12), password: str(body.password, 300) });

  try {
    const r = await api(path, { method: "POST", headers: upstreamHeaders(req), body: JSON.stringify(payload) });
    if (!r.ok) {
      const retry = Number(r.data.retryAfter) || undefined;
      return json({ ok: false, error: str(r.data.error, 300) || "Something went wrong. Please try again.", retry }, r.status >= 400 ? r.status : 400);
    }
    if ((action === "login" || action === "verify") && typeof r.data.token === "string") {
      const a = (r.data.account ?? {}) as Record<string, unknown>;
      const account: SiteAccount = { id: a.id as number, name: str(a.name), email: str(a.email), uuid: a.uuid ? str(a.uuid) : undefined, model: a.model ? str(a.model) : undefined };
      await setSession(r.data.token, account);
      return json({ ok: true, account: { name: account.name } });
    }
    return json({ ok: true, message: str(r.data.message, 300) || undefined });
  } catch {
    return json({ ok: false, error: "Can’t reach the Native servers right now. Try again in a moment." }, 502);
  }
}
