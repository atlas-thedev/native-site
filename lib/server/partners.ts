import { API_URL } from "./config";
import { FALLBACK_PARTNERS, localArt, type Partner, type PartnerAnimation } from "../partners";

const ANIMATIONS = new Set<PartnerAnimation>(["aurora", "orbit", "glitch", "float", "shine", "pulse", "grid", "none"]);
const HEX = /^#[0-9a-f]{6}$/i;
// http:// links (a backend behind a plain-http proxy hop) are upgraded, not dropped with the whole partner.
const https = (v: unknown) => {
  const s = typeof v === "string" ? v.replace(/^http:\/\//i, "https://") : "";
  return /^https:\/\//.test(s) ? s : "";
};

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
    logoSize: Number(raw.logoSize) ? Math.max(20, Math.min(160, Number(raw.logoSize))) : 52,
    buttonStyle: (["gradient", "solid", "outline", "glass"] as const).find((v) => v === raw.buttonStyle) ?? "gradient",
    buttonColor: HEX.test(String(raw.buttonColor)) ? String(raw.buttonColor) : "",
    buttonText: HEX.test(String(raw.buttonText)) ? String(raw.buttonText) : "",
    button2Label: https(raw.button2Url) ? String(raw.button2Label ?? "").slice(0, 24) : "",
    button2Url: raw.button2Label ? https(raw.button2Url) : "",
    logoStyle: (["plain", "tile", "circle", "glass"] as const).find((v) => v === raw.logoStyle) ?? "plain",
    logoBg: HEX.test(String(raw.logoBg)) ? String(raw.logoBg) : "",
    badge: String(raw.badge ?? "").slice(0, 24),
    showName: raw.showName !== false,
  };
}

/*
 * The root layout is force-dynamic, which turns off Next's fetch cache, so without this every visit to
 * /partners asked the API again. Partners are kept in memory instead: fresh for a minute, then served
 * from memory straight away while one background request refreshes them. A failed refresh keeps the
 * last good list; the built-in list is only used before the API has ever answered.
 */
const FRESH_MS = 60_000;
let cached: { at: number; partners: Partner[] } | null = null;
let refreshing: Promise<Partner[]> | null = null;

async function load(): Promise<Partner[]> {
  const r = await fetch(`${API_URL}/v1/site/partners`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error(`partners ${r.status}`);
  const d = (await r.json()) as { partners?: Record<string, unknown>[] };
  if (!Array.isArray(d.partners)) throw new Error("partners: bad response");
  return d.partners.map(clean).filter((p): p is Partner => p !== null);
}

function refresh(): Promise<Partner[]> {
  if (!refreshing) {
    refreshing = load()
      .then((partners) => { cached = { at: Date.now(), partners }; return partners; })
      .catch(() => cached?.partners ?? FALLBACK_PARTNERS)
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

/** Live partners from the Native API, served from memory (see above). Never throws. */
export async function getPartners(): Promise<Partner[]> {
  if (cached) {
    if (Date.now() - cached.at > FRESH_MS) void refresh(); // stale: answer now, refresh in the background
    return cached.partners;
  }
  return refresh();
}
