"use client";

import { motion } from "motion/react";
import { ArrowRight, Gift, Sparkle, UserPlus } from "lucide-react";
import Link from "next/link";
import ItemArt from "./ItemArt";
import LaunchClock from "./LaunchClock";
import { useLaunch } from "./LaunchContext";
import { useAccount } from "../useAccount";
import { INTRO } from "@/lib/site";
import type { StoreItem } from "@/lib/store";

const ease = [0.16, 1, 0.3, 1] as const;
const up = (d: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d + INTRO, ease } });

/** Pre-launch hero: the pitch on the left, the launch clock and the free founder capes on the right. */
export default function LaunchHero({ founder }: { founder: StoreItem[] }) {
  const { launch } = useLaunch();
  const me = useAccount();
  const pickHref = me ? "/founder" : "/register?next=/founder";
  const capes = launch.founderPick ? founder.slice(0, 3) : [];

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,#000_20%,transparent_75%)]" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-10 h-[620px] w-[620px] rounded-full bg-fg/[0.06] blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-fg/25 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-28 lg:pt-24">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.span {...up(0.02)} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-mute">
            <Sparkle className="h-3.5 w-3.5 text-fg" /> Early access is open
          </motion.span>

          <motion.h1 {...up(0.08)} className="mt-6 max-w-[640px] text-balance text-[clamp(2.7rem,6.4vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            {launch.headline || "Native is almost here."}
          </motion.h1>

          <motion.p {...up(0.2)} className="mt-6 max-w-[520px] text-pretty text-[18px] leading-relaxed text-mute">
            {launch.subline || "Create your free account before launch and pick one exclusive cape on us."}
          </motion.p>

          <motion.div {...up(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {me ? (
              <Link href="/founder" className="inline-flex h-14 items-center gap-2 rounded-full bg-inv px-8 text-[17px] font-semibold text-inv-fg transition hover:opacity-85 active:scale-95">
                <Gift className="h-5 w-5" /> Pick your free cape
              </Link>
            ) : (
              <Link href="/register?next=/founder" className="inline-flex h-14 items-center gap-2 rounded-full bg-inv px-8 text-[17px] font-semibold text-inv-fg transition hover:opacity-85 active:scale-95">
                <UserPlus className="h-5 w-5" /> Create your free account
              </Link>
            )}
            <Link href="#tour" className="inline-flex h-14 items-center gap-2 rounded-full border border-line bg-bg/70 px-7 text-[17px] font-semibold backdrop-blur transition hover:bg-surface-2">
              See what’s coming <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.ul {...up(0.42)} className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13.5px] text-dim lg:justify-start">
            <li>Free forever</li><li aria-hidden>·</li><li>Windows, macOS & Linux</li><li aria-hidden>·</li><li>Every Minecraft version</li>
          </motion.ul>
        </div>

        <motion.div {...up(0.22)} className="relative mx-auto w-full max-w-[600px]">
          <LaunchClock at={launch.at} />

          {capes.length > 0 && (
            <div className="relative mt-4 overflow-hidden rounded-[24px] border border-line bg-bg/75 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Founder offer</p>
                  <p className="mt-1 text-[16px] font-bold tracking-tight">Join before launch, keep one free</p>
                </div>
                <Link href={pickHref} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line px-4 text-[13.5px] font-semibold transition hover:bg-surface-2">
                  Pick <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul className="mt-5 grid grid-cols-3 gap-3">
                {capes.map((it, i) => (
                  <li key={it.id}>
                    <Link href={pickHref} className="group flex flex-col items-center rounded-[16px] border border-line bg-surface px-2 pb-3 pt-4 transition hover:-translate-y-1 hover:border-fg/40" style={{ transitionDelay: `${i * 30}ms` }}>
                      <ItemArt item={it} width={44} className="cutout-sm transition duration-500 group-hover:scale-110" />
                      <span className="mt-2.5 truncate text-[12.5px] font-bold tracking-tight">{it.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
