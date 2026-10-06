import Link from "next/link";
import { Package } from "lucide-react";
import SkinHead from "../SkinHead";
import type { PlayerHit } from "@/lib/store";

/** A player in the search results: face, name, how much they own. */
export default function PlayerCard({ player, skin }: { player: PlayerHit; skin: string | null }) {
  return (
    <Link href={`/u/${encodeURIComponent(player.name)}`} className="st-card group flex flex-row items-center gap-4 p-4">
      <span className="slot-well flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden"><SkinHead skin={skin} name={player.name} size={48} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-bold tracking-tight">{player.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[12px] text-dim"><Package className="h-3 w-3" />{player.owned.toLocaleString()} {player.owned === 1 ? "item" : "items"}</span>
      </span>
    </Link>
  );
}
