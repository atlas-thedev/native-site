"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { storeActionRaw } from "../capes/actions";

/** Heart on an item page: saves it to your wishlist (shown on your profile and in the launcher). */
export default function WishButton({ itemId, signedIn }: { itemId: string; signedIn: boolean }) {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!signedIn) return;
    let dead = false;
    fetch("/api/store", { cache: "no-store" }).then((r) => r.json()).then((d: { wishlist?: string[] }) => !dead && setOn(!!d.wishlist?.includes(itemId))).catch(() => {});
    return () => { dead = true; };
  }, [itemId, signedIn]);
  const click = async () => {
    if (!signedIn) { window.location.href = "/login"; return; }
    setBusy(true);
    const next = !on;
    setOn(next);
    const r = await storeActionRaw({ action: "wish", itemId, on: next }).catch(() => ({ ok: false }));
    if (!r.ok) setOn(!next);
    setBusy(false);
  };
  return (
    <button onClick={click} disabled={busy} aria-pressed={on} className={`pxb is-ghost ${on ? "is-on" : ""}`} title={on ? "On your wishlist" : "Add to wishlist"}>
      <span className="pxb-face"><Heart className={on ? "fill-current" : ""} /> <span className="max-sm:hidden">{on ? "Wishlisted" : "Wishlist"}</span></span>
    </button>
  );
}
