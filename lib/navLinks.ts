import {
  Crown, Download, FileText, Flag, FlaskConical, Gem, Handshake, History, House, LifeBuoy, ShoppingBag, Shirt, User, Users, Vote,
  type LucideIcon,
} from "lucide-react";

/** One page of the site, as the navbar menus and the Ctrl+K search show it. */
export type NavPage = { href: string; label: string; desc: string; Icon: LucideIcon; keywords?: string };
export type NavEntry = NavPage | { label: string; items: NavPage[] };

export const PAGES = {
  home: { href: "/", label: "Home", desc: "The Native launcher and client", Icon: House, keywords: "start landing" },
  store: { href: "/store", label: "Store", desc: "Every cloak, cosmetic and bundle", Icon: ShoppingBag, keywords: "shop buy" },
  cloaks: { href: "/cloaks", label: "Cloaks", desc: "Animated capes for the launcher and the game", Icon: Flag, keywords: "capes cape" },
  cosmetics: { href: "/cosmetics", label: "Cosmetics", desc: "Hats, wings and more for your skin", Icon: Gem, keywords: "hats wings" },
  plus: { href: "/plus", label: "Native+", desc: "Every paid cape, the gold N+ and more", Icon: Crown, keywords: "plus premium subscription" },
  players: { href: "/players", label: "Players", desc: "Find anyone and see what they wear", Icon: Users, keywords: "profiles friends" },
  skins: { href: "/skins", label: "Skins", desc: "The skin library, worn by real players", Icon: Shirt, keywords: "skin library" },
  vote: { href: "/vote", label: "Vote", desc: "Help pick what we make next", Icon: Vote, keywords: "poll community" },
  partners: { href: "/partners", label: "Partners", desc: "Servers and creators we team up with", Icon: Handshake, keywords: "servers creators" },
  beta: { href: "/beta", label: "Beta", desc: "Become a Super Beta Tester", Icon: FlaskConical, keywords: "super beta tester apply" },
  changes: { href: "/changes", label: "Changes", desc: "What’s new in every release", Icon: History, keywords: "changelog updates release notes" },
  support: { href: "/support", label: "Support", desc: "Help, crash fixes and contact", Icon: LifeBuoy, keywords: "help contact faq crash" },
  download: { href: "/download", label: "Download", desc: "Windows, macOS and Linux", Icon: Download, keywords: "install get launcher windows mac linux" },
  account: { href: "/account", label: "Your account", desc: "Skin, cloaks, locker and settings", Icon: User, keywords: "profile settings locker login sign in" },
  terms: { href: "/terms", label: "Terms of Service", desc: "The rules for using Native", Icon: FileText, keywords: "legal tos" },
  privacy: { href: "/privacy", label: "Privacy Policy", desc: "What we keep and why", Icon: FileText, keywords: "legal data gdpr" },
  refunds: { href: "/refunds", label: "Refund Policy", desc: "Getting your money back", Icon: FileText, keywords: "legal refund money" },
} satisfies Record<string, NavPage>;

/** The desktop navbar: plain links and two small menus. */
export const NAV: NavEntry[] = [
  PAGES.home,
  { label: "Store", items: [PAGES.store, PAGES.cloaks, PAGES.cosmetics, PAGES.plus] },
  { label: "Community", items: [PAGES.players, PAGES.skins, PAGES.vote, PAGES.partners] },
  PAGES.beta,
  PAGES.changes,
  PAGES.support,
];

/** The phone menu, in groups. */
export const MENU_GROUPS: { label: string; items: NavPage[] }[] = [
  { label: "Native", items: [PAGES.home, PAGES.download, PAGES.changes, PAGES.beta] },
  { label: "Store", items: [PAGES.store, PAGES.cloaks, PAGES.cosmetics, PAGES.plus] },
  { label: "Community", items: [PAGES.players, PAGES.skins, PAGES.vote, PAGES.partners, PAGES.support] },
];

/** Pages the search can jump to. */
export const SEARCH_PAGES: NavPage[] = Object.values(PAGES);

export const isGroup = (e: NavEntry): e is { label: string; items: NavPage[] } => "items" in e;
export const onPage = (path: string | null, href: string) => (href === "/" ? path === "/" : !!path?.startsWith(href));
