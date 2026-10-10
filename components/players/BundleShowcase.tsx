import { BadgeCheck, Boxes, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { StoreItem } from "@/lib/store";
import type { OwnedBundle } from "./BundleChips";

export const RARITY_COLOR: Record<string, string> = { rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b", mythic: "#ef4444" };
export const bundleColor = (b: Pick<OwnedBundle, "accent" | "rarity">) => b.accent || RARITY_COLOR[b.rarity ?? "epic"] || RARITY_COLOR.epic;

/** Complete sets in a locker, shown as one showcase card per set with every piece in it. */
export default function BundleShowcase({ bundles, byId, piece }: { bundles: OwnedBundle[]; byId: Map<string, StoreItem>; piece: (it: StoreItem) => ReactNode }) {
  if (!bundles.length) return null;
  return (
    <section id="bundles" className="mt-6 scroll-mt-24">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <h2 className="text-[15px] font-extrabold tracking-tight">Complete sets</h2>
        <span className="text-[13px] text-dim">{bundles.length}</span>
      </div>
      <ul className="mt-3 grid gap-4 lg:grid-cols-2">
        {bundles.map((b) => {
          const color = bundleColor(b);
          const pieces = (b.itemIds ?? []).map((id) => byId.get(id)).filter((i): i is StoreItem => !!i);
          return (
            <li key={b.id} className="bundle-card relative overflow-hidden rounded-[12px] border-2 bg-surface" style={{ borderColor: color, ["--bc" as string]: color } as React.CSSProperties}>
              <div className="pointer-events-none absolute inset-0 opacity-[0.16]" style={{ background: `radial-gradient(120% 90% at 0% 0%, ${color}, transparent 60%)` }} />
              {b.artUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.artUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.18]" />
              )}
              <div className="relative flex items-start justify-between gap-3 px-4 pt-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] text-white shadow-lg" style={{ background: color }}>
                    <Boxes className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-extrabold leading-tight">{b.name}</p>
                    <p className="truncate text-[12.5px] text-dim">{b.tagline || `${pieces.length} pieces · the full look`}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-[5px] px-2 py-[3px] text-[10.5px] font-black uppercase tracking-wider text-white" style={{ background: color }}>
                    <BadgeCheck className="h-3.5 w-3.5" /> Complete
                  </span>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color }}>{b.rarity ?? "epic"}</span>
                </div>
              </div>
              <ul className="relative grid grid-cols-4 gap-2 p-4">
                {pieces.map((it) => (
                  <li key={it.id} className="flex flex-col items-center gap-1.5 rounded-[8px] border border-line bg-black/20 p-2" title={it.name}>
                    <span className="flex h-[72px] w-full items-center justify-center">{piece(it)}</span>
                    <span className="w-full truncate text-center text-[11.5px] font-semibold">{it.name}</span>
                  </li>
                ))}
              </ul>
              <div className="relative h-1 w-full" style={{ background: color }} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
