"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { FALLBACK_CONFIG, type SiteConfig } from "@/lib/launch";

const Ctx = createContext<SiteConfig>(FALLBACK_CONFIG);

/** Once Native is out nothing stays locked and the founder offer is over, whatever a stale config says. */
const settle = (c: SiteConfig): SiteConfig =>
  c.launch.prelaunch ? c : { ...c, launch: { ...c.launch, launched: true, lockStore: false, lockDownloads: false, founderPick: false } };

/** Site-wide launch config. Flips to "launched" on its own the moment the countdown ends. */
export function LaunchProvider({ config, children }: { config: SiteConfig; children: React.ReactNode }) {
  const [cfg, setCfg] = useState(config);
  useEffect(() => setCfg(config), [config]);
  // pages can be served from cache, so check the live config on load, on focus and every minute
  useEffect(() => {
    let dead = false;
    const pull = async () => {
      if (document.hidden) return;
      try {
        const d = await fetch("/api/site", { cache: "no-store" }).then((r) => r.json());
        if (dead || !d?.ok || !d.launch) return;
        setCfg((c) => ({
          ...c,
          launch: { ...c.launch, ...d.launch },
          maintenance: { ...c.maintenance, ...(d.maintenance ?? {}) },
          announcement: { ...c.announcement, ...(d.announcement ?? {}) },
          beta: { ...c.beta, ...(d.beta ?? {}) },
          theme: { ...c.theme, ...(d.theme ?? {}) },
          offers: Array.isArray(d.offers) ? d.offers : c.offers,
        }));
      } catch {}
    };
    pull();
    const t = setInterval(pull, 15000);
    window.addEventListener("focus", pull);
    return () => {
      dead = true;
      clearInterval(t);
      window.removeEventListener("focus", pull);
    };
  }, []);
  useEffect(() => {
    if (!cfg.launch.prelaunch) return;
    const left = cfg.launch.at - Date.now();
    if (left > 2 ** 31 - 1) return;
    const t = setTimeout(() => {
      setCfg((c) => ({ ...c, launch: { ...c.launch, prelaunch: false, launched: true, lockStore: false, lockDownloads: false } }));
    }, Math.max(0, left));
    return () => clearTimeout(t);
  }, [cfg.launch.prelaunch, cfg.launch.at]);
  return <Ctx.Provider value={settle(cfg)}>{children}</Ctx.Provider>;
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
    done: s !== null && s <= 0,
    days: s == null ? 0 : Math.floor(s / 86400),
    hours: s == null ? 0 : Math.floor((s % 86400) / 3600),
    minutes: s == null ? 0 : Math.floor((s % 3600) / 60),
    seconds: s == null ? 0 : s % 60,
  };
}
