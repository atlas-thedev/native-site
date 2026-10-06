"use client";

import { Heart } from "lucide-react";
import { toggleWish, useWishlist } from "./wishlist";

/** The heart on a store card: saves the item to your wishlist without opening the item. */
export default function WishHeart({ itemId, signedIn }: { itemId: string; signedIn: boolean }) {
  const { has, error } = useWishlist(signedIn);
  const on = signedIn && has(itemId);
  const click = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!signedIn) { window.location.href = "/login"; return; }
    toggleWish(itemId);
  };
  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      title={error || (on ? "On your wishlist" : signedIn ? "Add to wishlist" : "Sign in to use your wishlist")}
      className={`flex h-7 w-7 items-center justify-center rounded-[4px] border-2 border-black/60 transition ${on ? "bg-[#ff6b8b] text-black" : "bg-black/55 text-white/80 hover:bg-black/80 hover:text-white"}`}
    >
      <Heart className={`h-3.5 w-3.5 ${on ? "fill-current" : ""}`} strokeWidth={2.6} />
    </button>
  );
}
