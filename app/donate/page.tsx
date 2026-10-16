import Link from "next/link";
import { ArrowRight, Check, Coffee, Crown, ExternalLink, Heart, Shield, Sparkles, Star, Users } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Donation Corner · Community Supporters",
  description: "Support Native Client development and keep it 100% free and open. Unlock backer loyalty rewards, exclusive Discord roles, and in-game supporter cloaks.",
  path: "/donate",
});

const tiers = [
  {
    name: "Supporter",
    amount: "$3",
    sub: "One-time or monthly",
    badge: "Community",
    desc: "Helps cover our high-performance relay chat nodes and skin CDN bandwidth.",
    perks: [
      "Supporter Discord badge & role",
      "Special Supporter heart flair on your public profile",
      "Private backer channel in Discord",
      "Listed on the Community Wall of Backers",
    ],
    highlight: false,
  },
  {
    name: "Champion",
    amount: "$10",
    sub: "Most popular backer tier",
    badge: "Loyalty Choice",
    desc: "Accelerates new feature development, crash analyzer rules, and modpack integrations.",
    perks: [
      "Everything in Supporter",
      "Exclusive in-game Supporter Cloak",
      "Priority voting weight on community feature polls",
      "Direct dev Q&A channel access",
      "Early preview builds access",
    ],
    highlight: true,
  },
  {
    name: "Patron Founder",
    amount: "$25+",
    sub: "Lifetime legacy supporter",
    badge: "Hall of Fame",
    desc: "For leaders who want to guarantee Native stays independent and ad-free forever.",
    perks: [
      "Everything in Champion",
      "Permanent Hall of Fame profile crown",
      "Custom username gradient in Relay chat",
      "Direct 1-on-1 feedback sessions with core team",
      "Lifetime early access to beta branches",
    ],
    highlight: false,
  },
];

const backers = [
  { name: "CraftMaster99", tier: "Patron Founder", time: "2 days ago" },
  { name: "VortexMC", tier: "Champion", time: "3 days ago" },
  { name: "SokPlayer", tier: "Champion", time: "4 days ago" },
  { name: "LunaSky", tier: "Supporter", time: "5 days ago" },
  { name: "EnderKnight", tier: "Champion", time: "6 days ago" },
  { name: "RedstonePro", tier: "Supporter", time: "1 week ago" },
];

export default function DonatePage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-32 pt-24 sm:px-8 sm:pt-32">
      <JsonLd data={breadcrumb([{ name: "Supporter Corner", path: "/donate" }])} />

      <div className="mb-14 text-center">
        <Reveal><p className="eyebrow">Community Loyalty</p></Reveal>
        <SplitText as="h1" text="Support Native." className="v-display !leading-[0.9] mt-5 text-[clamp(2.8rem,7vw,5.6rem)]" />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-[620px] text-lg text-mute">
            Native Client is built by Minecraft players, for Minecraft players. 100% free, zero ads, no corporate sponsors. Your donations keep our servers online and independent.
          </p>
        </Reveal>
      </div>

      {/* Where donations go */}
      <div className="mb-16 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-line bg-surface p-6">
          <p className="text-[28px] font-black text-fg font-[family-name:var(--font-display)]">45%</p>
          <h3 className="mt-2 text-[17px] font-bold text-fg">Relay Chat & Voice Nodes</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-mute">Global low-latency servers running friend presences, groups, and in-game relay sync.</p>
        </div>
        <div className="rounded-[24px] border border-line bg-surface p-6">
          <p className="text-[28px] font-black text-fg font-[family-name:var(--font-display)]">30%</p>
          <h3 className="mt-2 text-[17px] font-bold text-fg">Skin & Cape CDN Distribution</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-mute">Edge caching for 3D skins, animated capes, and cosmetic assets served in milliseconds.</p>
        </div>
        <div className="rounded-[24px] border border-line bg-surface p-6">
          <p className="text-[28px] font-black text-fg font-[family-name:var(--font-display)]">25%</p>
          <h3 className="mt-2 text-[17px] font-bold text-fg">Continuous Development</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-mute">Crash analyzer engine, Modrinth/CurseForge integrations, and new Minecraft release support.</p>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col justify-between rounded-[28px] border p-7 sm:p-8 transition ${
              t.highlight
                ? "border-amber-500/50 bg-[linear-gradient(180deg,var(--surface),var(--surface-2))] shadow-xl shadow-amber-500/5"
                : "border-line bg-surface"
            }`}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-500/40 bg-amber-500 px-3.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-black shadow-sm">
                {t.badge}
              </span>
            )}

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[20px] font-extrabold tracking-tight text-fg">{t.name}</span>
                <span className="rounded-full border border-line bg-surface px-3 py-0.5 text-[11px] font-mono uppercase tracking-wider text-dim">
                  {t.badge}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-display)] text-[44px] font-black leading-none text-fg">
                  {t.amount}
                </span>
                <span className="text-[13px] text-mute">{t.sub}</span>
              </div>

              <p className="mt-4 text-[14px] leading-relaxed text-mute">{t.desc}</p>

              <div className="mt-6 border-t border-line/60 pt-6">
                <p className="text-[12px] font-bold uppercase tracking-wider text-dim">Loyalty Perks</p>
                <ul className="mt-3.5 space-y-2.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-mute">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${t.highlight ? "text-amber-500" : "text-emerald-500"}`} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <a
                href={site.discord}
                target="_blank"
                rel="noreferrer"
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14.5px] font-bold transition ${
                  t.highlight
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "bg-inv text-inv-fg hover:opacity-85"
                }`}
              >
                <Heart className="h-4 w-4" /> Support via Discord & Tebex
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Alternative: Native+ Banner */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-amber-500/30 bg-amber-500/5 p-8">
        <div className="max-w-[560px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[12px] font-bold text-amber-500 uppercase tracking-wider">
            <Crown className="h-3.5 w-3.5" /> All-in-One Membership
          </span>
          <h2 className="mt-3 text-[24px] font-extrabold tracking-tight text-fg">Prefer monthly cosmetics with your support?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-mute">
            Native+ gives you every paid cloak, every 3D cosmetic, gold launcher branding, and the Native+ Relay crown for $5.99/mo.
          </p>
        </div>
        <Link
          href="/plus"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-amber-500 px-7 text-[15px] font-bold text-black transition hover:bg-amber-400"
        >
          Explore Native+ <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Wall of Backers Showcase */}
      <section className="mt-16 rounded-[28px] border border-line bg-surface p-8 sm:p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[24px] font-extrabold tracking-tight">Community Wall of Backers</h2>
            <p className="mt-1 text-[14.5px] text-mute">Recent players supporting independent Minecraft software.</p>
          </div>
          <span className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-fg">
            <Users className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {backers.map((b) => (
            <div key={b.name} className="flex items-center justify-between rounded-xl border border-line bg-surface-2/60 p-4">
              <div>
                <p className="font-bold text-[14.5px] text-fg">{b.name}</p>
                <p className="text-[12px] text-mute">{b.time}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                b.tier === "Patron Founder" ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-surface text-dim border border-line"
              }`}>
                {b.tier}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-[24px] font-extrabold tracking-tight mb-6">Supporter FAQ</h2>
        <div className="divide-y divide-line rounded-[24px] border border-line bg-surface">
          <div className="p-6 sm:p-7">
            <h3 className="font-bold text-[17px]">Will Native Client always remain free?</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">
              Yes, absolutely. The launcher, instance manager, mod downloader, crash fixer, and core multiplayer features are 100% free for everyone on Windows, macOS, and Linux. Donations support infrastructure.
            </p>
          </div>
          <div className="p-6 sm:p-7">
            <h3 className="font-bold text-[17px]">How do I claim my in-game and Discord perks?</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">
              When supporting via Tebex or Discord, enter your Native username or Discord handle. Our automated bot syncs your role and cosmetic cloak within minutes. You can also open a ticket in our Discord.
            </p>
          </div>
          <div className="p-6 sm:p-7">
            <h3 className="font-bold text-[17px]">Can I contribute code or translations instead of money?</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">
              Yes! Native is open to community contributors, mod pack creators, and translators. Reach out on our Discord server to get involved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
