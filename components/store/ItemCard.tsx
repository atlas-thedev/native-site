import { Check, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import WishHeart from "./WishHeart";
import { isPaid, money, priceNow, type StoreItem } from "@/lib/store";

export const priceOf = (it: StoreItem) =>
  it.exclusive ? "Event" : isPaid(it) ? (it.salePrice != null ? <>{money(priceNow(it))} <s className="font-normal opacity-50">{money(it.price)}</s></> : money(it.price)) : "Free";

type Props = {
  item: StoreItem;
  href: string;
  /** the picture: a cape strip or a cosmetic still */
  art: ReactNode;
  /** badges, top-left and top-right of the picture */
  left?: ReactNode;
  right?: ReactNode;
  bottom?: ReactNode;
  own?: boolean;
  worn?: boolean;
  aspect?: string;
  /** show how many players have it under the name */
  players?: boolean;
  /** show a wishlist heart (pass whether the visitor is signed in) */
  wish?: { signedIn: boolean };
};

/** One tile in the store: bevelled card, picture with badges, a footer with the name and the price. */
export default function ItemCard({ item, href, art, left, right, bottom, own, worn, aspect = "aspect-square", players, wish }: Props) {
  return (
    <Link href={href} className={`st-card group flex h-full flex-col ${worn ? "is-on" : ""}`}>
      <div className={`st-art ${aspect}`}>
        <div className="transition duration-300 group-hover:scale-[1.06]">{art}</div>
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">{left}</div>
          <div className="flex flex-col items-end gap-1.5">{right}{wish && <WishHeart itemId={item.id} signedIn={wish.signedIn} />}</div>
        </div>
        {bottom && <div className="absolute bottom-2.5 left-2.5 flex flex-col items-start gap-1.5">{bottom}</div>}
        {own && (
          <span title={worn ? "You’re wearing this" : "In your locker"} aria-label={worn ? "You’re wearing this" : "In your locker"}
            className={`absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-[4px] border-2 border-black/60 ${worn ? "bg-inv text-inv-fg" : "bg-surface-2 text-fg"}`}>
            <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
          </span>
        )}
      </div>
      <div className="st-foot">
        <span className="min-w-0">
          <span className="block truncate text-[14.5px] font-bold tracking-tight">{item.name}</span>
          {players && <span className="mt-0.5 flex items-center gap-1 font-mono text-[11.5px] text-dim"><Users className="h-3 w-3" />{(item.owners ?? 0).toLocaleString()}</span>}
        </span>
        <span className="shrink-0 font-mono text-[12.5px] font-semibold text-mute">{priceOf(item)}</span>
      </div>
    </Link>
  );
}
