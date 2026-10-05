import { NextResponse } from "next/server";
import { api, clearSession, readSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  const s = await readSession();
  if (!s) return json({ ok: true, signedIn: false, eligible: false, picked: null, capes: [] });
  const r = await api("/v1/site/founder", { method: "GET", headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }) });
  if (r.status === 401) {
    await clearSession();
    return json({ ok: true, signedIn: false, eligible: false, picked: null, capes: [] });
  }
  return json({ ...r.data, signedIn: true }, r.status < 400 ? 200 : r.status);
}

/** { itemId } claims the one free founder cape. */
export async function POST(req: Request) {
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in first.", expired: true }, 401);
  let body: { itemId?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }
  const r = await api("/v1/site/founder", {
    method: "POST",
    headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }),
    body: JSON.stringify({ itemId: String(body.itemId ?? "").slice(0, 80) }),
  });
  if (r.status === 401) {
    await clearSession();
    return json({ ok: false, error: "Your session expired. Sign in again.", expired: true }, 401);
  }
  if (!r.ok) return json({ ok: false, error: String(r.data.error || "Couldn’t claim that cape.") }, r.status >= 400 ? r.status : 400);
  return json({ ok: true, picked: r.data.picked ?? null });
}
