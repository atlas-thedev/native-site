"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Check, Crown, Heart, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import SectionHead from "../SectionHead";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.8, delay: i * 0.08, ease },
});

const tiers = [
  {
    name: "Supporter",
    amount: "$3",
    sub: "One-time tip or monthly",
    badge: "Community",
    desc: "Help cover high-speed multiplayer relay server and CDN costs while keeping Native completely ad-free.",
    perks: [
      "Supporter Discord badge & role",
      "Supporter heart flair on your web profile",
      "Access to private backer Discord lounge",
      "Listed on the Community Wall of Backers",
    ],
    cta: "Support with $3",
    highlight: false,
  },
  {
    name: "Champion",
    amount: "$10",
    sub: "Most popular backer tier",
    badge: "Loyalty Choice",
    desc: "For dedicated players who want to accelerate launcher development and unlock in-game cosmetic flair.",
    perks: [
      "Everything in Supporter",
      "Exclusive in-game Supporter Cloak",
      "Priority voting power on feature roadmap",
      "Direct Q&A channel with Native devs",
      "Early preview builds access",
    ],
    cta: "Become a Champion ($10)",
    highlight: true,
  },
  {
    name: "Patron Founder",
    amount: "$25+",
    sub: "Lifetime legacy supporter",
    badge: "Hall of Fame",
    desc: "Make a decisive impact on the project’s future. Enjoy lifetime prestige and premier loyalty perks.",
    perks: [
      "Everything in Champion",
      "Permanent Hall of Fame profile crown",
      "Custom username gradient in Relay chat",
      "Direct 1-on-1 feedback sessions",
      "Lifetime early access to beta branches",
    ],
    cta: "Join as Patron ($25)",
    highlight: false,
  },
];

const PRESETS = [3, 5, 10, 25, 50];

export default function DonationCorner() {
  const [customAmount, setCustomAmount] = useState<number | "">(10);

  return (
    <section id="donate" className="v-section v-wrap">
      <SectionHead
        index="(08)"
        label="Community Supporter"
        title="Keep Native free. Fuel the vision."
        sub="Native Client is 100% free, open, and without commercial ads. Community contributions fund our multiplayer relay servers, skin CDNs, and daily updates. Support the team and earn exclusive loyalty rewards."
      />

      {/* Tiers Grid */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((t, i) => (
          <motion.div
            key={t.name}
            {...rise(i)}
            className={`relative flex flex-col justify-between rounded-[28px] border p-7 sm:p-8 transition duration-300 ${
              t.highlight
                ? "border-amber-500/50 bg-[linear-gradient(180deg,var(--surface),var(--surface-2))] shadow-xl shadow-amber-500/5"
                : "border-line bg-surface/70 hover:border-fg/30 hover:bg-surface"
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
              <Link
                href="/donate"
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14.5px] font-bold transition ${
                  t.highlight
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "bg-inv text-inv-fg hover:opacity-85"
                }`}
              >
                <Heart className="h-4 w-4" /> {t.cta}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Quick Tip Bar & Native+ Callout */}
      <motion.div
        {...rise(3)}
        className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-line bg-surface/50 p-6 sm:p-8 backdrop-blur"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h4 className="text-[17px] font-bold text-fg">Custom Tip or Native+ Membership</h4>
            <p className="text-[14px] text-mute">
              Want every paid cloak & 3D cosmetic included monthly? Explore Native+ or send a custom tip amount.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/plus"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 text-[14px] font-bold text-amber-500 transition hover:bg-amber-500/20"
          >
            <Crown className="h-4 w-4" /> View Native+ Membership
          </Link>
          <Link
            href="/donate"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[14px] font-semibold text-fg transition hover:bg-surface-2"
          >
            Donation Corner & Wall of Backers <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
