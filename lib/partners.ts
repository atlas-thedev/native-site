/** Partners shown on /partners and the home page. Edited in the launcher's Admin → Partners. */
export type PartnerAnimation = "aurora" | "orbit" | "glitch" | "float" | "shine" | "pulse" | "grid" | "none";

export type Partner = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  website: string;
  cta: string;
  logo: string;
  background: string;
  art: string;
  accent: string;
  accent2: string;
  animation: PartnerAnimation;
  speed: number;
  intensity: number;
  perks: string[];
  code: string;
  tier: "featured" | "partner" | "sponsor";
};

/* Art the API serves from its bundle has a copy here, so it loads from our own domain. */
const LOCAL: Record<string, string> = {
  "aurex-logo-v1.webp": "/partners/aurex/logo.webp",
  "aurex-hero-v1.webp": "/partners/aurex/hero.webp",
  "aurex-crystal-v1.webp": "/partners/aurex/crystal.webp",
  "aurex-banner-v1.webp": "/partners/aurex/banner.webp",
};
export function localArt(url: string): string {
  const m = /\/v1\/site\/partners\/media\/([a-z0-9._-]+)$/.exec(url || "");
  return (m && LOCAL[m[1]]) || url || "";
}

export const FALLBACK_PARTNERS: Partner[] = [
  {
    id: "aurex01",
    name: "Aurex Hosting",
    tagline: "Sri Lanka’s #1 game hosting provider.",
    description:
      "Minecraft, FiveM, MTA, Rust and Hytale servers on AMD Ryzen 7 nodes in Singapore, around 60 ms from Colombo. Instant setup, NVMe storage and always-on DDoS protection.",
    website: "https://www.aurex.lk/en",
    cta: "Get a server",
    logo: "/partners/aurex/logo.webp",
    background: "/partners/aurex/hero.webp",
    art: "/partners/aurex/crystal.webp",
    accent: "#8b5cf6",
    accent2: "#c07eff",
    animation: "aurora",
    speed: 1,
    intensity: 70,
    perks: ["Ryzen 7 nodes", "NVMe storage", "Always-on DDoS protection", "From LKR 400/mo"],
    code: "",
    tier: "featured",
  },
];
