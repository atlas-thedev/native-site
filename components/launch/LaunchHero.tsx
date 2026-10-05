"use client";

import { motion } from "motion/react";
import { ArrowRight, Gift, UserPlus } from "lucide-react";
import Link from "next/link";
import CapeStrip from "../CapeStrip";
import Countdown from "./Countdown";
import ToonScene from "./Toons";
import EarlyAccess from "../EarlyAccess";
import { useLaunch } from "./LaunchContext";
import { useAccount } from "../useAccount";
import { INTRO } from "@/lib/site";
import type { StoreItem } from "@/lib/store";

const ease = [0.16, 1, 0.3, 1] as const;
const up = (d: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d + INTRO, ease } });

/** Pre-launch hero: giant countdown, cartoon cast, and the free founder cape offer. */
export default function LaunchHero({ founder }: { founder: StoreItem[] }) {
  const { launch, beta } = useLaunch();
  const me = useAccount();
  const pickHref = me ? "/founder" : "/register?next=/founder";

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]" aria-hidden />
      <ToonScene />
      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center px-5 pb-[210px] pt-14 text-center sm:pb-[250px] sm:pt-20 lg:pb-[230px]">
        {beta.open && (
          <motion.div {...up(0)}>
            <EarlyAccess />
          </motion.div>
        )}

        <motion.h1 {...up(0.08)} className={`${beta.open ? "mt-7" : ""} max-w-[900px] text-balance text-[clamp(2.4rem,5.6vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.045em]`}>
          {launch.headline || "Native is almost here."}
        </motion.h1>

        <motion.div {...up(0.18)} className="mt-9 w-full">
          <Countdown at={launch.at} />
        </motion.div>

        <motion.p {...up(0.3)} className="mt-9 max-w-[560px] text-pretty text-[18px] leading-relaxed text-mute">
          {launch.subline || "Create your free account before launch and pick one exclusive cape on us."}
        </motion.p>

        <motion.div {...up(0.4)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {me ? (
            <Link href="/founder" className="inline-flex h-14 items-center gap-2 rounded-full bg-inv px-8 text-[17px] font-semibold text-inv-fg transition hover:opacity-85 active:scale-95">
              <Gift className="h-5 w-5" /> Pick your free cape
            </Link>
          ) : (
            <Link href="/register?next=/founder" className="inline-flex h-14 items-center gap-2 rounded-full bg-inv px-8 text-[17px] font-semibold text-inv-fg transition hover:opacity-85 active:scale-95">
              <UserPlus className="h-5 w-5" /> Create your free account
            </Link>
          )}
          <Link href="#tour" className="inline-flex h-14 items-center gap-2 rounded-full border border-line bg-bg/70 px-8 text-[17px] font-semibold backdrop-blur transition hover:bg-surface-2">
            See what’s coming <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {launch.founderPick && founder.length > 0 && (
          <motion.div {...up(0.55)} className="mt-10 flex flex-col items-center">
            <p className="font-mono text-[11.5px] uppercase tracking-[0.22em] text-dim">Join before launch and pick one free</p>
            <ul className="mt-4 flex items-end gap-3 sm:gap-4">
              {founder.map((it, i) => (
                <li key={it.id}>
                  <Link href={pickHref} className="group flex flex-col items-center rounded-[20px] border border-line bg-bg/80 px-3 pb-2.5 pt-3 backdrop-blur transition hover:-translate-y-1 hover:border-fg/40" style={{ transitionDelay: `${i * 30}ms` }}>
                    <CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={46} label={`${it.name} cape`} className="cutout-sm transition duration-500 group-hover:scale-110" />
                    <span className="mt-2 text-[12.5px] font-bold tracking-tight">{it.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12.5px] text-dim">After launch every cape is $1.99.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
