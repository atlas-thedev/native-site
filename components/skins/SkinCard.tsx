import Link from "next/link";
import { Heart, Users } from "lucide-react";
import SkinBody from "./SkinBody";
import type { SkinEntry } from "@/lib/profiles";

/** One skin in a grid: flat body render, likes and how many players wore it. */
export default function SkinCard({ skin, caption }: { skin: SkinEntry; caption?: string }) {
  return (
    <Link href={`/skins/${skin.hash}`} className="st-card group flex flex-col overflow-hidden" aria-label={`Skin ${skin.hash.slice(0, 8)}`}>
      <div className="relative flex aspect-[3/4] items-center justify-center bg-black/30 p-4">
        <SkinBody skin={skin.url} model={skin.model} alt="Skin preview" className="h-full max-h-[190px] w-auto drop-shadow-[0_10px_18px_rgb(0_0_0/0.55)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04]" />
        {skin.source === "mojang" && <span className="st-tag absolute left-2 top-2">Minecraft</span>}
        {skin.model === "slim" && <span className="st-tag absolute right-2 top-2">Slim</span>}
      </div>
      <div className="st-foot flex items-center justify-between gap-2 text-[12.5px] text-dim">
        <span className="truncate font-bold text-fg">{caption ?? `#${skin.hash.slice(0, 6)}`}</span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{skin.likes}</span>
          {skin.wearers !== undefined && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{skin.wearers}</span>}
        </span>
      </div>
    </Link>
  );
}
