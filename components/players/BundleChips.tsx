import { Boxes } from "lucide-react";
import Link from "next/link";

export type OwnedBundle = { id: string; name: string; artUrl: string | null; accent: string | null; count: number };

/** Every store bundle this player has completed. */
export default function BundleChips({ bundles }: { bundles: OwnedBundle[] }) {
  return (
    <div className="mt-6">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-dim">Bundles · {bundles.length}</p>
      <ul className="mt-2 flex flex-wrap gap-2.5">
        {bundles.map((b) => (
          <li key={b.id}>
            <Link href="/store" className="inline-flex items-center gap-2.5 rounded-[8px] border-2 border-line bg-surface px-2.5 py-2 transition hover:border-fg/40" style={b.accent ? { borderLeftColor: b.accent, borderLeftWidth: 4 } : undefined}>
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[6px] bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {b.artUrl ? <img src={b.artUrl} alt="" className="h-9 w-9 object-cover" /> : <Boxes className="h-5 w-5" />}
              </span>
              <span>
                <span className="block text-[13.5px] font-bold">{b.name}</span>
                <span className="block text-[11.5px] text-dim">{b.count} {b.count === 1 ? "item" : "items"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
