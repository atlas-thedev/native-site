"use client";

import WornShot from "@/components/cosmetics/WornShot";
import { useAccount } from "@/components/useAccount";
import type { StoreItem } from "@/lib/store";

/** A cosmetic worn on the visitor's own skin when signed in (Steve only for guests). Waits for the account so it never flashes Steve first. */
export default function MyShot({ item, className }: { item: StoreItem; className: string }) {
  const me = useAccount();
  if (me === undefined) return <span className={`${className} block`} aria-hidden="true" />;
  return <WornShot item={item} skin={me?.skin ?? null} model={me?.model ?? "default"} className={className} hideFallback={!item.stillUrl || item.stillUrl === item.textureUrl} />;
}
