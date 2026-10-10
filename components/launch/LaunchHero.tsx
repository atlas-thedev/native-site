"use client";

import { motion } from "motion/react";
import { ArrowRight, Gift, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import ItemArt from "./ItemArt";
import Countdown from "./Countdown";
import ToonScene from "./Toons";
import { useLaunch } from "./LaunchContext";
import { useAccount } from "../useAccount";
import { INTRO } from "@/lib/site";
import type { StoreItem } from "@/lib/store";

const ease = [0.16, 1, 0.3, 1] as const;
const up = (d: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d + INTRO, ease } });

/** Pre-launch hero: giant countdown, cartoon cast, and the free founder cape offer. */
export default function LaunchHero({ founder }: { founder: StoreItem[] }) {
  const { launch } = useLaunch();
  const me = useAccount();
  const pickHref = me ? "/founder" : "/register?next=/founder";
  const [when, setWhen] = useState("");
  useEffect(() => {
    const d = new Date(launch.at);
    setWhen(`${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`);
  }, [launch.at]);

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]" aria-hidden />
      <ToonScene />
      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center px-5 pb-[210px] pt-14 text-center sm:pb-[250px] sm:pt-20 lg:pb-[230px]">

        <motion.span {...up(0.02)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-bg/70 px-3.5 py-1.5 text-[13px] font-semibold text-mute backdrop-blur">
          <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" /><span className="relative h-2 w-2 rounded-full bg-emerald-400" /></span>
          Early access is open
        </motion.span>

        <motion.h1 {...up(0.08)} className={`max-w-[900px] text-balance bg-gradient-to-b from-fg to-fg/70 bg-clip-text pb-1 text-[clamp(2.4rem,5.6vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-transparent`}>
          {launch.headline || "Native is almost here."}
        </motion.h1>

        <motion.div {...up(0.18)} className="relative mt-9 w-full">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg/[0.07] blur-[90px]" />
          <Countdown at={launch.at} />
          <p className="mt-5 font-mono text-[11.5px] uppercase tracking-[0.22em] text-dim" suppressHydrationWarning>{when ? `Launching ${when}` : "\u00a0"}</p>
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
                  <Link href={pickHref} className="group relative flex flex-col items-center overflow-hidden rounded-[20px] border border-line bg-bg/80 px-3 pb-2.5 pt-3 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-fg/40 hover:shadow-[0_18px_40px_-18px_rgba(255,255,255,0.25)]" style={{ transitionDelay: `${i * 30}ms` }}>
                    <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,var(--surface-2),transparent)] opacity-0 transition duration-300 group-hover:opacity-100" />
                    <span className="relative [animation:float-y_4s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.6}s` }}>
                      <ItemArt item={it} width={46} className="cutout-sm transition duration-500 group-hover:scale-110" />
                    </span>
                    <span className="relative mt-2 text-[12.5px] font-bold tracking-tight">{it.name}</span>
                    <span className="relative mt-1 rounded-full bg-inv px-2 py-[1px] text-[9.5px] font-black uppercase tracking-wider text-inv-fg">Free</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  );
}
