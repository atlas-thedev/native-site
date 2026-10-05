import { NextResponse } from "next/server";
import { api, clearSession, readSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });

async function call(req: Request, method: "GET" | "POST" | "DELETE", body?: string) {
  const s = await readSession();
  if (!s) return json({ ok: false, signedIn: false, error: "Sign in first.", expired: true }, 401);
  const headers = upstreamHeaders(req, { Authorization: `Bearer ${s.token}`, ...(body ? { "Content-Type": "application/json" } : {}) });
  const r = await api(method === "GET" ? "/v1/beta/me" : "/v1/beta/apply", { method, headers, body });
  if (r.status === 401) {
    await clearSession();
    return json({ ok: false, signedIn: false, error: "Your session expired. Sign in again.", expired: true }, 401);
  }
  return json({ ...r.data, signedIn: true }, r.status);
}

export const GET = (req: Request) => call(req, "GET");
export const DELETE = (req: Request) => call(req, "DELETE");
export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > 8000) return json({ ok: false, error: "That’s a bit long." }, 413);
  return call(req, "POST", text);
}
