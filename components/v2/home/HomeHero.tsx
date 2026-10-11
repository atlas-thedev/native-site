"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight, Gift, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReady } from "../Preloader";
import Magnetic from "../Magnetic";
import ItemArt from "../../launch/ItemArt";
import { useLaunch, useCountdown } from "../../launch/LaunchContext";
import { useAccount } from "../../useAccount";
import { useVersion } from "../../VersionContext";
import { useOS } from "../../useOS";
import { Apple, Linux, Windows } from "../../icons";
import { platforms } from "@/lib/site";
import type { StoreItem } from "@/lib/store";

const ease = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/** Splits a headline into two balanced display lines. */
function twoLines(s: string) {
  const w = s.trim().split(/\s+/);
  if (w.length < 2) return [s];
  let best = 1, diff = Infinity;
  for (let i = 1; i < w.length; i++) {
    const d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length);
    if (d < diff) { diff = d; best = i; }
  }
  return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
}

function Lines({ lines, go, className = "" }: { lines: string[]; go: boolean; className?: string }) {
  return (
    <h1 className={`v-display v-h1 v-hero-title ${className}`} aria-label={lines.join(" ")}>
      {lines.map((l, i) => (
        <span key={i} className="line" aria-hidden>
          <motion.span initial={{ y: "105%" }} animate={go ? { y: "0%" } : {}} transition={{ duration: 1.2, delay: 0.08 + i * 0.1, ease }} className={i === lines.length - 1 ? "" : ""}>
            {l}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

function Count({ at }: { at: number }) {
  const t = useCountdown(at);
  const cells: [string, string, number][] = [
    [t.days > 99 ? String(t.days) : pad(t.days), t.days === 1 ? "Day" : "Days", 1],
    [pad(t.hours), "Hours", (24 - t.hours) / 24],
    [pad(t.minutes), "Minutes", (60 - t.minutes) / 60],
    [pad(t.seconds), "Seconds", (60 - t.seconds) / 60],
  ];
  return (
    <div role="timer" aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes and ${t.seconds} seconds until launch`} className={`v-count transition-opacity duration-500 ${t.ready ? "" : "opacity-0"}`}>
      {cells.map(([v, l, p], i) => (
        <div key={l}>
          <span className="v-count-n" suppressHydrationWarning>{v}</span>
          <span className="v-count-l v-label"><span>{l}</span><span className="max-sm:hidden">0{i + 1}</span></span>
          {i > 0 && <span aria-hidden className="v-count-bar" style={{ transform: `scaleX(${t.ready ? p : 0})` }} />}
        </div>
      ))}
    </div>
  );
}

export default function HomeHero({ founder = [] }: { founder?: StoreItem[] }) {
  const { launch } = useLaunch();
  const me = useAccount();
  const version = useVersion();
  const os = useOS();
  const go = useReady();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const [when, setWhen] = useState("");
  useEffect(() => {
    const d = new Date(launch.at);
    setWhen(`${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`);
  }, [launch.at]);

  const pre = launch.prelaunch;
  const lines = pre ? twoLines(launch.headline || "Native is almost here.") : ["Minecraft,", "launched", "beautifully."];
  const OsIcon = os === "mac" ? Apple : os === "linux" ? Linux : Windows;
  const up = (d: number) => ({ initial: { opacity: 0, y: 24 }, animate: go ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay: d, ease } });

  return (
    <section ref={ref} className="v-hero">
      <motion.div style={{ y }} className="v-wrap flex flex-1 flex-col">
        <div className="grid items-start gap-[clamp(28px,4vw,64px)] lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <Lines lines={lines} go={go} />

            {pre && (
              <motion.div {...up(0.35)} className="mt-[clamp(18px,2.4vw,34px)]">
                <Count at={launch.at} />
              </motion.div>
            )}

            <motion.p {...up(0.45)} className="v-hero-copy mt-6">
              {pre
                ? launch.subline || "Create your free account before launch and pick one exclusive cape on us."
                : "Instances, mods, modpacks, a 3D skin locker, friends chat and a crash analyzer that fixes things for you. One fast launcher, free for everyone."}
            </motion.p>

            <motion.div {...up(0.55)} className="v-hero-ctas mt-7 !justify-start pb-[clamp(40px,6vw,90px)]">
              {pre ? (
                <>
                  <Magnetic>
                    <Link href={me ? "/founder" : "/register?next=/founder"} className="v-btn is-solid is-lg">
                      {me ? <Gift /> : <UserPlus />} {me ? "Pick your free cape" : "Create free account"}
                    </Link>
                  </Magnetic>
                  <Link href="#features" className="v-btn is-lg">See what’s coming <ArrowDown /></Link>
                </>
              ) : (
                <>
                  <Magnetic>
                    <Link href="/download" className="v-btn is-solid is-lg">
                      <OsIcon /> Download for {platforms[os].label}
                    </Link>
                  </Magnetic>
                  <Link href="/download" className="v-btn is-lg">Other platforms <ArrowUpRight /></Link>
                </>
              )}
            </motion.div>
          </div>

          {pre && launch.founderPick && founder.length > 0 && (
            <motion.div {...up(0.5)} className="lg:pt-[clamp(70px,8vw,130px)]">
              <Link href={me ? "/founder" : "/register?next=/founder"} data-cursor="Pick one" className="group block w-full rounded-[20px] border border-line bg-surface p-6 transition hover:bg-surface-2 lg:w-[360px]">
                <span className="flex items-center justify-between">
                  <span className="v-label">Free founder cape</span>
                  <Gift className="h-4 w-4 text-dim transition group-hover:text-fg" />
                </span>
                <span className="mt-6 flex items-end justify-between gap-3">
                  {founder.map((it, i) => (
                    <span key={it.id} className="flex flex-1 flex-col items-center gap-2 transition duration-500 group-hover:-translate-y-1" style={{ transitionDelay: `${i * 50}ms` }}>
                      <span className="[animation:float-y_4s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.5}s` }}>
                        <ItemArt item={it} width={52} className="cutout-sm" />
                      </span>
                      <span className="v-label !text-[10px] text-center">{it.name}</span>
                    </span>
                  ))}
                </span>
                <span className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[14px] font-semibold">
                  {me ? "Pick yours now" : "Create an account, pick one"}
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

/** The launcher itself, scaling up into view as you scroll. */
export function ShowReel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.82, 1]);
  const r = useTransform(scrollYProgress, [0, 0.45], [28, 10]);
  const iy = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  return (
    <section className="v-wrap pb-[clamp(60px,8vw,120px)]">
      <div ref={ref}>
        <motion.div style={{ scale, borderRadius: r }} className="v-shot origin-top" data-cursor="Native">
          <motion.div style={{ y: iy }} className="scale-[1.12]">
            <Image src="/ui/win-home.webp" alt="Native launcher home screen" width={1900} height={1187} sizes="(min-width:1480px) 1400px, 94vw" className="block h-auto w-full" priority={false} />
          </motion.div>
        </motion.div>
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-3 v-label">
        <span>Fig. 01 — The home screen</span>
        <span>Native Client · 2026</span>
      </div>
    </section>
  );
}
