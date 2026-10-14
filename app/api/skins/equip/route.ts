import { NextResponse } from "next/server";
import { api, clearSession, readSession, setSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });
const HASH = /^[a-f0-9]{32,64}$/;

export async function GET(req: Request) {
  const hash = new URL(req.url).searchParams.get("hash") ?? "";
  if (!HASH.test(hash)) return json({ ok: false }, 400);
  const s = await readSession();
  if (!s) return json({ ok: true, signedIn: false, wearing: false });
  try {
    const r = await api(`/csl/${encodeURIComponent(s.account.name)}.json`, {
      method: "GET",
      headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }),
    });
    const profile = r.data as { skin?: string; skins?: Record<string, string> };
    const currentSkin = profile?.skin || profile?.skins?.default || profile?.skins?.slim || "";
    const isWearing = currentSkin.toLowerCase().includes(hash.toLowerCase());
    return json({ ok: true, signedIn: true, wearing: isWearing });
  } catch {
    return json({ ok: true, signedIn: true, wearing: false });
  }
}

export async function POST(req: Request) {
  let body: { hash?: unknown; model?: unknown } = {};
  try { body = await req.json(); } catch { return json({ ok: false }, 400); }
  const hash = typeof body.hash === "string" ? body.hash.toLowerCase().trim() : "";
  if (!HASH.test(hash)) return json({ ok: false, error: "Unknown skin." }, 400);
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in to wear this skin.", signedIn: false }, 401);

  const model = body.model === "slim" ? "slim" : "default";
  const r = await api("/v1/skins/equip", {
    method: "POST",
    headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}`, "X-Native-Token": s.token }),
    body: JSON.stringify({ hash, model }),
  });

  if (r.status === 401) {
    await clearSession();
    return json({ ok: false, error: "Your session expired. Sign in again.", expired: true }, 401);
  }

  if (!r.ok) {
    return json({ ok: false, error: (r.data.error as string) || "Could not equip skin." }, r.status);
  }

  // Update session cookie if model changed
  try {
    await setSession(s.token, { ...s.account, model: model === "slim" ? "slim" : "classic" });
  } catch {}

  return json({ ok: true, wearing: true });
}
