import { BadgeCheck, Bug, Code2, Crown, FlaskConical, Gem, Heart, Shield, Star, Wrench, Video } from "lucide-react";

type Look = { label: string; bg: string; fg: string; Icon: typeof Star };
// Solid colours with their own text colour, so badges read the same in light and dark mode.
const KNOWN: Record<string, Look> = {
  admin: { label: "Admin", bg: "linear-gradient(#ff6b6b,#d63a3a)", fg: "#fff", Icon: Shield },
  staff: { label: "Staff", bg: "linear-gradient(#5ea8ff,#2f74e0)", fg: "#fff", Icon: Wrench },
  developer: { label: "Developer", bg: "linear-gradient(#a98bff,#7651ea)", fg: "#fff", Icon: Code2 },
  dev: { label: "Developer", bg: "linear-gradient(#a98bff,#7651ea)", fg: "#fff", Icon: Code2 },
  moderator: { label: "Moderator", bg: "linear-gradient(#4fd1c5,#1f9e93)", fg: "#06201d", Icon: Shield },
  beta: { label: "Beta tester", bg: "linear-gradient(#ffb36b,#f07d1f)", fg: "#2a1300", Icon: FlaskConical },
  "beta tester": { label: "Beta tester", bg: "linear-gradient(#ffb36b,#f07d1f)", fg: "#2a1300", Icon: FlaskConical },
  tester: { label: "Tester", bg: "linear-gradient(#ffb36b,#f07d1f)", fg: "#2a1300", Icon: Bug },
  founder: { label: "Founder", bg: "linear-gradient(#ffe08a,#e9a91c)", fg: "#2b1b02", Icon: Gem },
  supporter: { label: "Supporter", bg: "linear-gradient(#ff8fc8,#e0479a)", fg: "#fff", Icon: Heart },
  partner: { label: "Partner", bg: "linear-gradient(135deg,#8b5cf6,#f5b94a)", fg: "#fff", Icon: Star },
  early_supporter: { label: "Early supporter", bg: "linear-gradient(#ff9b6b,#f0661f)", fg: "#fff", Icon: Heart },
  bug_hunter: { label: "Bug hunter", bg: "linear-gradient(#7fe07a,#2f9b2b)", fg: "#0b2a0a", Icon: Bug },
  super_beta_tester: { label: "Super beta tester", bg: "linear-gradient(#5fe3d8,#e9b93a)", fg: "#06201d", Icon: FlaskConical },
  verified: { label: "Verified", bg: "linear-gradient(#5ea8ff,#2f74e0)", fg: "#fff", Icon: BadgeCheck },
  creator: { label: "Creator", bg: "linear-gradient(#ff8fc8,#e0479a)", fg: "#fff", Icon: Video },
};
const PLUS: Look = { label: "Native+", bg: "linear-gradient(#ffe08a,#e9a91c)", fg: "#000", Icon: Crown };
const PREMIUM: Look = { label: "Premium", bg: "linear-gradient(#6ee7a0,#22a35a)", fg: "#03230f", Icon: BadgeCheck };
const OTHER = (label: string): Look => ({ label, bg: "linear-gradient(#5b5b63,#3a3a40)", fg: "#fff", Icon: Star });
const isPlusBadge = (b: string) => /^(native)?\s*\+?\s*plus$|^native\+$/i.test(b);

function Badge({ look, title }: { look: Look; title?: string }) {
  const { Icon } = look;
  return (
    <span title={title ?? look.label} className="inline-flex h-[24px] items-center gap-1.5 rounded-[6px] px-2 text-[11px] font-black uppercase tracking-[0.07em] shadow-[inset_0_-2px_0_rgb(0_0_0/0.2),0_1px_0_rgb(0_0_0/0.25)]" style={{ background: look.bg, color: look.fg }}>
      <Icon className="h-3.5 w-3.5" />{look.label}
    </span>
  );
}

/** Admin, Native+, Premium (Microsoft-linked Minecraft account) and the player's own badges. */
export default function ProfileBadges({ badges = [], admin = false, plus = false, premium = false }: { badges?: string[]; admin?: boolean; plus?: boolean; premium?: boolean }) {
  const seen = new Set<string>();
  const out: { key: string; look: Look; title?: string }[] = [];
  const add = (key: string, look: Look, title?: string) => { if (!seen.has(look.label)) { seen.add(look.label); out.push({ key, look, title }); } };
  if (admin) add("admin", KNOWN.admin, "Native team");
  if (plus) add("plus", PLUS, "Native+ member");
  if (premium) add("premium", PREMIUM, "Premium Minecraft account connected (Microsoft)");
  for (const b of badges) {
    if (isPlusBadge(b)) { if (plus) continue; add("plus", PLUS); continue; }
    const k = b.trim().toLowerCase();
    add(k, KNOWN[k] ?? OTHER(b.trim()));
  }
  return <>{out.map((b) => <Badge key={b.key} look={b.look} title={b.title} />)}</>;
}
