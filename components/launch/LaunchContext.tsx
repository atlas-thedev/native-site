"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { FALLBACK_CONFIG, type SiteConfig } from "@/lib/launch";

const Ctx = createContext<SiteConfig>(FALLBACK_CONFIG);

/** Site-wide launch config. Flips to "launched" on its own the moment the countdown ends. */
export function LaunchProvider({ config, children }: { config: SiteConfig; children: React.ReactNode }) {
  const [cfg, setCfg] = useState(config);
  useEffect(() => setCfg(config), [config]);
  useEffect(() => {
    if (!cfg.launch.prelaunch) return;
    const left = cfg.launch.at - Date.now();
    if (left > 2 ** 31 - 1) return;
    const t = setTimeout(() => {
      setCfg((c) => ({ ...c, launch: { ...c.launch, prelaunch: false, launched: true, lockStore: false, lockDownloads: false } }));
    }, Math.max(0, left));
    return () => clearTimeout(t);
  }, [cfg.launch.prelaunch, cfg.launch.at]);
  return <Ctx.Provider value={cfg}>{children}</Ctx.Provider>;
}

export const useLaunch = () => useContext(Ctx);

/** Seconds left until `at`, ticking every second (null before hydration so SSR and client match). */
export function useCountdown(at: number) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = now == null ? null : Math.max(0, at - now);
  const s = ms == null ? null : Math.floor(ms / 1000);
  return {
    ready: s != null,
    done: s === 0,
    days: s == null ? 0 : Math.floor(s / 86400),
    hours: s == null ? 0 : Math.floor((s % 86400) / 3600),
    minutes: s == null ? 0 : Math.floor((s % 3600) / 60),
    seconds: s == null ? 0 : s % 60,
  };
}
