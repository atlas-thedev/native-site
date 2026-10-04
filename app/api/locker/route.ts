import { NextResponse } from "next/server";
import { API_URL } from "@/lib/server/config";
import { api, clearSession, readSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });

const toHttps = (u: unknown) => (typeof u === "string" && u ? u.replace(/^http:\/\//, "https://") : null);

/** Current locker of the signed-in account (public CSL profile). */
export async function GET() {
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in first." }, 401);
  try {
    const r = await fetch(`${API_URL}/csl/${encodeURIComponent(s.account.name)}.json`, { cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (r.status === 404) return json({ ok: true, name: s.account.name, model: s.account.model === "slim" ? "slim" : "default", skin: null, cape: null });
    const p = await r.json();
    return json({ ok: true, name: s.account.name, model: p.model === "slim" ? "slim" : "default", skin: toHttps(p.skin), cape: toHttps(p.cape) });
  } catch {
    return json({ ok: false, error: "Couldn’t load your locker." }, 502);
  }
}

async function currentModel(name: string, fallback: string | undefined): Promise<"slim" | "default"> {
  try {
    const r = await fetch(`${API_URL}/csl/${encodeURIComponent(name)}.json`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (r.ok) return (await r.json()).model === "slim" ? "slim" : "default";
  } catch {}
  return fallback === "slim" ? "slim" : "default";
}

const dataPng = (v: unknown) => {
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const b64 = v.replace(/^data:image\/png;base64,/, "");
  if (b64.length > 1_400_000 || !/^[A-Za-z0-9+/=]+$/.test(b64)) return undefined;
  return b64;
};

/** Publish skin / cape / model to the account. Omitted fields are left unchanged. */
export async function POST(req: Request) {
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in first." }, 401);
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  // The API resets the model when it is omitted, so keep the current one unless the caller picks a new one.
  const requested = body.model === "slim" ? "slim" : body.model === "default" ? "default" : null;
  const model = requested ?? (await currentModel(s.account.name, s.account.model));
  const payload: Record<string, unknown> = { username: s.account.name, model };
  if ("skin" in body) {
    const v = dataPng(body.skin);
    if (v === undefined) return json({ ok: false, error: "That skin file isn’t valid." }, 400);
    payload.skin = v;
    if (typeof body.skinName === "string" && body.skinName.trim()) payload.skinName = body.skinName.trim().slice(0, 32);
  }
  if ("cape" in body) {
    const v = dataPng(body.cape);
    if (v === undefined) return json({ ok: false, error: "That cape file isn’t valid." }, 400);
    payload.cape = v;
  }
  try {
    const r = await api("/v1/wardrobe", {
      method: "POST",
      headers: upstreamHeaders(req, { "X-Native-Token": s.token, Authorization: `Bearer ${s.token}` }),
      body: JSON.stringify(payload),
    });
    if (r.status === 401) {
      await clearSession();
      return json({ ok: false, error: "Your session expired. Please sign in again." }, 401);
    }
    if (!r.ok) return json({ ok: false, error: String(r.data.error || "Couldn’t save your locker.") }, r.status >= 400 ? r.status : 400);
    const p = (r.data.profile ?? {}) as Record<string, unknown>;
    return json({ ok: true, skin: toHttps(p.skin), cape: toHttps(p.cape), model: p.model === "slim" ? "slim" : "default" });
  } catch {
    return json({ ok: false, error: "Can’t reach the Native servers right now." }, 502);
  }
}
