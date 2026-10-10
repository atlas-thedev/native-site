import { NextResponse } from "next/server";
import { api, clearSession, readSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });

/** Your profile bio + social links. */
export async function GET(req: Request) {
  const s = await readSession();
  if (!s) return json({ ok: false, signedIn: false }, 401);
  const r = await api("/v1/profiles/me/about", { method: "GET", headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }) });
  if (r.status === 401) { await clearSession(); return json({ ok: false, expired: true }, 401); }
  return json({ ok: r.ok, bio: r.data.bio ?? "", links: r.data.links ?? [] }, r.ok ? 200 : 502);
}

/** { action: "about", bio, links } saves your profile; { action: "view", name } counts a profile view. */
export async function POST(req: Request) {
  let body: { action?: unknown; name?: unknown; bio?: unknown; links?: unknown } = {};
  try { body = await req.json(); } catch { return json({ ok: false, error: "Bad request." }, 400); }
  if (body.action === "view") {
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 32) : "";
    if (!name) return json({ ok: false }, 400);
    const r = await api(`/v1/profiles/${encodeURIComponent(name)}/view`, { method: "POST", headers: upstreamHeaders(req), body: "{}" });
    return json({ ok: r.ok, views: r.data.views ?? null });
  }
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in first." }, 401);
  const r = await api("/v1/profiles/me/about", { method: "POST", headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }), body: JSON.stringify({ bio: String(body.bio ?? "").slice(0, 280), links: Array.isArray(body.links) ? body.links.slice(0, 8) : [] }) });
  if (r.status === 401) { await clearSession(); return json({ ok: false, error: "Your session expired. Sign in again.", expired: true }, 401); }
  return json({ ok: r.ok, bio: r.data.bio ?? "", links: r.data.links ?? [], error: r.ok ? undefined : (r.data.error as string) || "Couldn’t save that." }, r.ok ? 200 : r.status >= 400 ? r.status : 502);
}
