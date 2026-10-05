"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { site } from "@/lib/site";

const Ctx = createContext(site.fallbackVersion);

/**
 * Starts with the version rendered on the server, then checks /api/version once so a page served
 * from the cache (or built before the latest release) still shows the real latest version.
 */
export const VersionProvider = ({ version, children }: { version: string; children: React.ReactNode }) => {
  const [current, setCurrent] = useState(version);
  useEffect(() => {
    let alive = true;
    fetch("/api/version")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { version?: unknown } | null) => {
        if (alive && d && typeof d.version === "string" && /^\d+\.\d+\.\d+/.test(d.version)) setCurrent(d.version);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return <Ctx.Provider value={current}>{children}</Ctx.Provider>;
};
export const useVersion = () => useContext(Ctx);
