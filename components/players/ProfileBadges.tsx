import { BadgeCheck, Shield, Star } from "lucide-react";

/* The launcher's badges (native-client src/features/social/Badges.jsx): same art, names and colours. */
const PLUS_ART = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect width="16" height="16" rx="4" fill="#ffd68c"/><path fill="#1a1306" d="M3 5h2v2h1V5h1V4h2v1h1v2h1V5h2v7H3z"/><path fill="#ffd68c" d="M5 10h6v1H5z"/></svg>')}`;
type Real = { name: string; description: string; gradient: string; art: string };
const REAL: Record<string, Real> = {
  developer: { name: "Active Developer", description: "Verified Native Core Developer", gradient: "linear-gradient(135deg,#5865f2 0%,#3ba55d 100%)", art: "/badges/developer.png" },
  early_supporter: { name: "Early Supporter", description: "Supported Native Client in its earliest days", gradient: "linear-gradient(135deg,#f47b67 0%,#faa61a 100%)", art: "/badges/early-supporter.png" },
  bug_hunter: { name: "Bug Hunter", description: "Found and reported crucial launcher bugs", gradient: "linear-gradient(135deg,#3ba55d 0%,#57f287 100%)", art: "/badges/bug-hunter.png" },
  staff: { name: "Native Staff", description: "Official Native Client Staff Team", gradient: "linear-gradient(135deg,#5865f2 0%,#eb459e 100%)", art: "/badges/staff.png" },
  super_beta_tester: { name: "Super Beta Tester", description: "Hand-picked to test Native before everyone else", gradient: "linear-gradient(135deg,#2fd4c9 0%,#ffd36b 100%)", art: "/badges/launcher-super-beta-tester.png" },
  partner: { name: "Native Partner", description: "Official Native partner", gradient: "linear-gradient(135deg,#8b5cf6 0%,#f5b94a 100%)", art: "/badges/partner.png" },
  plus: { name: "Native+", description: "Native+ member", gradient: "linear-gradient(135deg,#ffd68c 0%,#f5b94a 100%)", art: PLUS_ART },
};
const ALIASES: Record<string, string> = { dev: "developer", "early supporter": "early_supporter", "bug hunter": "bug_hunter", "super beta tester": "super_beta_tester", "native+": "plus", "native plus": "plus" };

type Plain = { label: string; bg: string; fg: string; Icon: typeof Star };
const ADMIN: Plain = { label: "Admin", bg: "linear-gradient(#ff6b6b,#d63a3a)", fg: "#fff", Icon: Shield };
const PREMIUM: Plain = { label: "Premium", bg: "linear-gradient(#6ee7a0,#22a35a)", fg: "#03230f", Icon: BadgeCheck };
const OTHER = (label: string): Plain => ({ label, bg: "linear-gradient(#5b5b63,#3a3a40)", fg: "#fff", Icon: Star });

/** A launcher badge: its pixel art in a tile with the badge's gradient, and the name. */
function RealBadge({ b }: { b: Real }) {
  return (
    <span title={`${b.name} · ${b.description}`} className="inline-flex h-[28px] items-center gap-2 rounded-[8px] border border-white/10 bg-black/40 py-0 pl-[3px] pr-2.5 text-[12px] font-bold text-white shadow-[0_1px_0_rgb(0_0_0/0.25)]">
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px]" style={{ background: b.gradient }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.art} alt="" width={18} height={18} className="h-[18px] w-[18px] [image-rendering:pixelated]" draggable={false} />
      </span>
      {b.name}
    </span>
  );
}

function PlainBadge({ look, title }: { look: Plain; title?: string }) {
  const { Icon } = look;
  return (
    <span title={title ?? look.label} className="inline-flex h-[28px] items-center gap-1.5 rounded-[8px] px-2.5 text-[12px] font-bold shadow-[inset_0_-2px_0_rgb(0_0_0/0.2),0_1px_0_rgb(0_0_0/0.25)]" style={{ background: look.bg, color: look.fg }}>
      <Icon className="h-3.5 w-3.5" />{look.label}
    </span>
  );
}

/** Admin, Native+, Premium (Microsoft-linked Minecraft account) and the player's own badges. */
export default function ProfileBadges({ badges = [], admin = false, plus = false, premium = false }: { badges?: string[]; admin?: boolean; plus?: boolean; premium?: boolean }) {
  const seen = new Set<string>();
  const out: React.ReactNode[] = [];
  const real = (id: string) => { if (!seen.has(id) && REAL[id]) { seen.add(id); out.push(<RealBadge key={id} b={REAL[id]} />); } };
  const plain = (id: string, look: Plain, title?: string) => { if (!seen.has(id)) { seen.add(id); out.push(<PlainBadge key={id} look={look} title={title} />); } };
  if (admin) plain("admin", ADMIN, "Native team");
  if (plus) real("plus");
  if (premium) plain("premium", PREMIUM, "Premium Minecraft account connected (Microsoft)");
  for (const raw of badges) {
    const k = String(raw).trim().toLowerCase();
    const id = REAL[k] ? k : ALIASES[k];
    if (id) real(id);
    else if (k) plain(k, OTHER(String(raw).trim()));
  }
  return <>{out}</>;
}
