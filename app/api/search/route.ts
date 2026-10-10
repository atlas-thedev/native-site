import { NextResponse } from "next/server";
import { api, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/** Ctrl+K search: players (Native and Minecraft), skins by wearer and store items. */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 32);
  if (!q) return NextResponse.json({ ok: true, players: [], items: [] });
  const r = await api(`/v1/search?q=${encodeURIComponent(q)}`, { method: "GET", headers: upstreamHeaders(req) });
  return NextResponse.json({ ok: r.ok, players: r.data.players ?? [], items: r.data.items ?? [] }, { headers: { "Cache-Control": "private, max-age=10" } });
}
