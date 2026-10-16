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
  logoSize?: number;
  /** Look, set in Admin → Partners */
  buttonStyle?: "gradient" | "solid" | "outline" | "glass";
  buttonColor?: string;
  buttonText?: string;
  button2Label?: string;
  button2Url?: string;
  logoStyle?: "plain" | "tile" | "circle" | "glass";
  logoBg?: string;
  badge?: string;
  showName?: boolean;
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
    logoSize: 52,
    background: "/partners/aurex/banner.webp",
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

/** The long-form partner page (like a product page): hero, a split section, features, media rows and an FAQ. */
export type PartnerStory = {
  headline: [string, string];
  intro: string;
  note: string;
  cta: string;
  heroImage: string;
  split: { title: string; body: string; image?: string };
  features: { title: string; items: { title: string; body: string }[] };
  rows: { title: string; body: string; image: string }[];
  faq: [string, string][];
};

export const PARTNER_STORIES: Record<string, PartnerStory> = {
  aurex01: {
    headline: ["Your own Minecraft server,", "60 ms from home"],
    intro:
      "We’ve partnered with Aurex Hosting, Sri Lanka’s #1 game hosting provider. Start a Minecraft server on Aurex and play it with your friends on Native.",
    note: "From LKR 400/mo · Instant setup",
    cta: "Get a server",
    heroImage: "/partners/aurex/banner.webp",
    split: {
      title: "Low ping, right next door.",
      body: "Aurex runs on AMD Ryzen 7 nodes in Singapore, around 60 ms from Colombo, so your server stays quick for everyone playing from Sri Lanka.",
      image: "/partners/aurex/map.webp",
    },
    features: {
      title: "Everything a server needs.",
      items: [
        { title: "Instant setup", body: "Your server is ready as soon as you order it." },
        { title: "NVMe storage", body: "Worlds load and save fast on NVMe drives." },
        { title: "Always-on DDoS protection", body: "Attacks are filtered before they reach your server." },
        { title: "More than Minecraft", body: "FiveM, MTA, Rust and Hytale servers too, all in one place." },
      ],
    },
    rows: [
      {
        title: "Protected from day one",
        body: "Every Aurex server sits behind DDoS protection that is always on. Nothing to switch on, nothing extra to pay.",
        image: "/partners/aurex/ddos.webp",
      },
      {
        title: "Play it with Native",
        body: "Join your Aurex server from Native with your capes and cosmetics on. Everyone else on Native sees them too.",
        image: "/partners/aurex/crystal.webp",
      },
    ],
    faq: [
      ["Is Aurex part of Native?", "No. Aurex Hosting is an independent company and one of our partners. Your server, billing and support are with Aurex."],
      ["Where are the servers?", "In Singapore, on AMD Ryzen 7 nodes, around 60 ms from Colombo."],
      ["How much does it cost?", "Minecraft servers start from LKR 400 a month. Aurex lists every plan on aurex.lk."],
      ["Do I need Native to use Aurex?", "No. Aurex works with any Minecraft client. Native just makes playing on it nicer."],
    ],
  },
};

/** A simple page for partners without a written story, built from what the admin entered. */
export function storyFor(p: Partner): PartnerStory {
  const known = PARTNER_STORIES[p.id];
  if (known) return known;
  return {
    headline: [p.name, p.tagline || "Partnered with Native"],
    intro: p.description || p.tagline,
    note: p.code ? `Use code ${p.code}` : "",
    cta: p.cta || "Visit",
    heroImage: p.background,
    split: { title: p.tagline || p.name, body: p.description },
    features: { title: "Why we picked them.", items: p.perks.map((perk) => ({ title: perk, body: "" })) },
    rows: p.art ? [{ title: p.name, body: p.tagline, image: p.art }] : [],
    faq: [],
  };
}
