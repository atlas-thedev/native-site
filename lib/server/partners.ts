import { API_URL } from "./config";
import { FALLBACK_PARTNERS, localArt, type Partner, type PartnerAnimation } from "../partners";

const ANIMATIONS = new Set<PartnerAnimation>(["aurora", "orbit", "glitch", "float", "shine", "pulse", "grid", "none"]);
const HEX = /^#[0-9a-f]{6}$/i;
const https = (v: unknown) => (typeof v === "string" && /^https:\/\//.test(v) ? v : "");

function clean(raw: Record<string, unknown>): Partner | null {
  const website = https(raw.website);
  const logo = https(raw.logo);
  if (typeof raw.id !== "string" || typeof raw.name !== "string" || !website || !logo) return null;
  const accent = HEX.test(String(raw.accent)) ? String(raw.accent) : "#ffffff";
  return {
    id: raw.id,
    name: raw.name.slice(0, 48),
    tagline: String(raw.tagline ?? "").slice(0, 90),
    description: String(raw.description ?? "").slice(0, 500),
    website,
    cta: String(raw.cta || "Visit").slice(0, 24),
    logo: localArt(logo),
    background: localArt(https(raw.background)),
    art: localArt(https(raw.art)),
    accent,
    accent2: HEX.test(String(raw.accent2)) ? String(raw.accent2) : accent,
    animation: ANIMATIONS.has(raw.animation as PartnerAnimation) ? (raw.animation as PartnerAnimation) : "aurora",
    speed: Math.max(0.25, Math.min(3, Number(raw.speed) || 1)),
    intensity: Math.max(0, Math.min(100, Number.isFinite(Number(raw.intensity)) ? Number(raw.intensity) : 60)),
    perks: (Array.isArray(raw.perks) ? raw.perks : []).map((p) => String(p).slice(0, 40)).filter(Boolean).slice(0, 6),
    code: String(raw.code ?? "").slice(0, 24),
    tier: raw.tier === "featured" || raw.tier === "sponsor" ? raw.tier : "partner",
  };
}

/** Live partners from the Native API (cached for a minute). Falls back to the built-in list; never throws. */
export async function getPartners(): Promise<Partner[]> {
  try {
    const r = await fetch(`${API_URL}/v1/site/partners`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return FALLBACK_PARTNERS;
    const d = (await r.json()) as { partners?: Record<string, unknown>[] };
    if (!Array.isArray(d.partners)) return FALLBACK_PARTNERS;
    return d.partners.map(clean).filter((p): p is Partner => p !== null);
  } catch {
    return FALLBACK_PARTNERS;
  }
}
