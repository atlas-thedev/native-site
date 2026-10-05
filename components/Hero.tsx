"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import Button from "./Button";
import SplitText from "./SplitText";
import { Apple, Linux, Windows } from "./icons";
import { useOS } from "./useOS";
import Link from "next/link";
import { INTRO, platforms } from "@/lib/site";
import { useVersion } from "./VersionContext";
import { useLaunch } from "./launch/LaunchContext";
import LaunchHero from "./launch/LaunchHero";
import type { StoreItem } from "@/lib/store";

const MotionLink = motion.create(Link);

export default function Hero({ founder = [] }: { founder?: StoreItem[] }) {
  const { launch } = useLaunch();
  if (launch.prelaunch) return <LaunchHero founder={founder} />;
  return <LaunchedHero />;
}

function LaunchedHero() {
  const os = useOS();
  const version = useVersion();
  const OsIcon = os === "mac" ? Apple : os === "linux" ? Linux : Windows;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const winY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="dots pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]" aria-hidden />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-5 pb-24 pt-16 lg:grid-cols-[500px_1fr] lg:pb-32 lg:pt-24">
        <div className="relative z-10">
          <MotionLink
            href="/changes"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: INTRO, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-4 pr-3 text-[13.5px] font-medium text-mute transition hover:bg-surface-2 hover:text-fg"
          >
            See what’s new in {version} <ArrowRight className="h-3.5 w-3.5" />
          </MotionLink>

          <SplitText
            as="h1"
            text="Minecraft, launched beautifully."
            delay={0.1 + INTRO}
            className="mt-6 text-balance text-[clamp(2.8rem,6.2vw,5.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em]"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 + INTRO, ease }}
            className="mt-7 max-w-[470px] text-pretty text-[18px] leading-relaxed text-mute"
          >
            Instances, mods, modpacks, a 3D skin locker, friends chat and a crash analyzer that fixes problems for you — in one fast, obsessively crafted launcher.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65 + INTRO, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button href="/download" size="lg">
              <OsIcon className="h-5 w-5" /> Download for {platforms[os].label}
            </Button>
            <Button href="#tour" variant="ghost" size="lg">
              Take the tour
            </Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + INTRO }} className="mt-5 flex items-center gap-2 text-[13.5px] text-dim">
            <Download className="h-3.5 w-3.5" /> Supported on Windows, Linux and macOS
          </motion.p>
        </div>

        <div className="relative h-[340px] sm:h-[460px] lg:h-[640px]">
          <motion.div
            style={{ y: winY }}
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.3, delay: 0.3 + INTRO, ease }}
            className="absolute left-0 top-0 w-[135%] sm:w-[125%] lg:top-6 lg:w-[142%]"
          >
            <Image src="/ui/win-home.webp" alt="Native Client home screen" width={1900} height={1187} priority sizes="(min-width:1024px) 1000px, 130vw" className="cutout h-auto w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
