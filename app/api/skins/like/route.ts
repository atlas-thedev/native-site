import { NextResponse } from "next/server";
import { api, clearSession, readSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });
const HASH = /^[a-f0-9]{32,64}$/;

export async function GET(req: Request) {
  const hash = new URL(req.url).searchParams.get("hash") ?? "";
  if (!HASH.test(hash)) return json({ ok: false }, 400);
  const s = await readSession();
  const r = await api(`/v1/library/skins/${hash}/like`, { method: "GET", headers: upstreamHeaders(req, s ? { Authorization: `Bearer ${s.token}` } : {}) });
  return json({ ok: r.ok, signedIn: !!s, liked: !!r.data.liked, likes: Number(r.data.likes) || 0 });
}

export async function POST(req: Request) {
  let body: { hash?: unknown; like?: unknown } = {};
  try { body = await req.json(); } catch { return json({ ok: false }, 400); }
  const hash = typeof body.hash === "string" ? body.hash : "";
  if (!HASH.test(hash)) return json({ ok: false, error: "Unknown skin." }, 400);
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in to like skins.", signedIn: false }, 401);
  const r = await api(`/v1/library/skins/${hash}/like`, { method: "POST", headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }), body: JSON.stringify({ like: body.like !== false }) });
  if (r.status === 401) { await clearSession(); return json({ ok: false, error: "Your session expired. Sign in again.", expired: true }, 401); }
  return json({ ok: r.ok, liked: !!r.data.liked, likes: Number(r.data.likes) || 0, error: r.ok ? undefined : (r.data.error as string) }, r.ok ? 200 : r.status);
}
