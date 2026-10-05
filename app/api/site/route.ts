import { NextResponse } from "next/server";
import { API_URL } from "@/lib/server/config";

export const dynamic = "force-dynamic";

/** The live site config (launch, maintenance, banners), never cached, so open pages pick up changes. */
export async function GET() {
  try {
    const r = await fetch(`${API_URL}/v1/site/config`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!r.ok) return NextResponse.json({ ok: false }, { status: 502, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(await r.json(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
