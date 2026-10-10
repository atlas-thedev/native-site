import { NextResponse } from "next/server";
import { api, upstreamHeaders } from "@/lib/server/session";
import { getCatalog } from "@/lib/server/store";

export const dynamic = "force-dynamic";
type Item = { id: string; name: string; kind: string; slot: string | null };

/** Ctrl+K search: players (Native and Minecraft, with their skin), store items (with their art) and skins. */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 32);
  if (!q) return NextResponse.json({ ok: true, players: [], items: [] });
  const [r, catalog] = await Promise.all([api(`/v1/search?q=${encodeURIComponent(q)}`, { method: "GET", headers: upstreamHeaders(req) }), getCatalog()]);
  const byId = new Map([...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])].map((i) => [i.id, i]));
  const items = ((r.data.items as Item[] | undefined) ?? []).map((it) => {
    const full = byId.get(it.id);
    return full ? { ...it, stillUrl: full.stillUrl || null, stripUrl: full.animated ? full.stripUrl : null, frames: full.frames, fps: full.fps, animated: !!full.animated, modelUrl: full.modelUrl ?? null, textureUrl: full.textureUrl ?? null } : it;
  });
  return NextResponse.json({ ok: r.ok, players: r.data.players ?? [], items }, { headers: { "Cache-Control": "private, max-age=10" } });
}
