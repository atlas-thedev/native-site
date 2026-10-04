import { NextResponse } from "next/server";
import { API_URL } from "@/lib/server/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const t = Date.now();
  try {
    const r = await fetch(`${API_URL}/health`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    const ok = r.ok && ((await r.json().catch(() => ({}))) as { ok?: boolean }).ok !== false;
    return NextResponse.json({ ok, ms: Date.now() - t }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, ms: null }, { headers: { "Cache-Control": "no-store" } });
  }
}
