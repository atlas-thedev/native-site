import { API_URL } from "./config";
import { FALLBACK_CONFIG, type SiteConfig } from "../launch";

/** Launch state, maintenance, announcement and live offers from the Native API. Never throws. */
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const r = await fetch(`${API_URL}/v1/site/config`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!r.ok) return FALLBACK_CONFIG;
    const d = (await r.json()) as Partial<SiteConfig>;
    return {
      serverTime: Number(d.serverTime) || Date.now(),
      launch: { ...FALLBACK_CONFIG.launch, ...(d.launch ?? {}) },
      maintenance: { ...FALLBACK_CONFIG.maintenance, ...(d.maintenance ?? {}) },
      announcement: { ...FALLBACK_CONFIG.announcement, ...(d.announcement ?? {}) },
      beta: { ...FALLBACK_CONFIG.beta, ...(d.beta ?? {}) },
      theme: { halloween: Boolean(d.theme?.halloween) },
      offers: Array.isArray(d.offers) ? d.offers : [],
    };
  } catch {
    return FALLBACK_CONFIG;
  }
}
