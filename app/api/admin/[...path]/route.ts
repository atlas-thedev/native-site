import { NextResponse } from "next/server";
import { readSession, upstreamHeaders } from "@/lib/server/session";
import { API_URL } from "@/lib/server/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED = /^(site|site\/.*|polls|polls\/.*|store\/.*|billing\/.*|users|users\/.*|overview|status)$/;

/** Admin proxy: /api/admin/<path> → Native API /v1/admin/<path>, with the session token from the httpOnly cookie. */
async function forward(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const sub = path.map(encodeURIComponent).join("/");
  if (!ALLOWED.test(path.join("/"))) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  const s = await readSession();
  if (!s) return NextResponse.json({ ok: false, error: "Sign in first.", signIn: true }, { status: 401 });
  const search = new URL(req.url).search;
  const init: RequestInit = {
    method: req.method,
    headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }),
    cache: "no-store",
    signal: AbortSignal.timeout(55000),
  };
  if (!["GET", "HEAD"].includes(req.method)) init.body = await req.text();
  try {
    const r = await fetch(`${API_URL}/v1/admin/${sub}${search}`, init);
    const text = await r.text();
    return new NextResponse(text, { status: r.status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Can’t reach the Native API." }, { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
