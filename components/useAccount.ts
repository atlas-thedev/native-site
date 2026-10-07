"use client";

import { useEffect, useState } from "react";

export type Me = { name: string; uuid: string | null; isAdmin: boolean; skin: string | null; model: "default" | "slim" } | null;
let pending: Promise<Me> | null = null;

/** The signed-in account (undefined while loading, null when signed out). Shared by every caller on a page. */
export function useAccount() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  useEffect(() => {
    let dead = false;
    pending ??= fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d?.account ? { name: String(d.account.name), uuid: d.account.uuid ?? null, isAdmin: !!d.account.isAdmin, skin: d.account.skin ? String(d.account.skin) : null, model: (d.account.model === "slim" ? "slim" : "default") as "default" | "slim" } : null))
      .catch(() => null);
    pending.then((m) => !dead && setMe(m));
    return () => {
      dead = true;
    };
  }, []);
  return me;
}
