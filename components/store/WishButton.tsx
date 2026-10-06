"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { toggleWish, useWishlist } from "./wishlist";

/** Heart on an item page: saves it to your wishlist (shown on your profile and in the launcher). */
export default function WishButton({ itemId, signedIn }: { itemId: string; signedIn: boolean }) {
  const { has, error } = useWishlist(signedIn);
  const [busy, setBusy] = useState(false);
  const on = signedIn && has(itemId);
  const click = async () => {
    if (!signedIn) { window.location.href = "/login"; return; }
    setBusy(true);
    await toggleWish(itemId);
    setBusy(false);
  };
  return (
    <span className="flex flex-col items-end gap-1">
      <button onClick={click} disabled={busy} aria-pressed={on} className={`pxb is-ghost ${on ? "is-on" : ""}`} title={on ? "On your wishlist" : "Add to wishlist"}>
        <span className="pxb-face"><Heart className={on ? "fill-current" : ""} /> <span className="max-sm:hidden">{on ? "Wishlisted" : "Wishlist"}</span></span>
      </button>
      {error && <span role="alert" className="max-w-[240px] text-right text-[12px] text-mute">{error}</span>}
    </span>
  );
}
