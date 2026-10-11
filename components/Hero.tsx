"use client";

import { motion } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SplitText from "./SplitText";
import { Apple, Linux, Windows } from "./icons";
import { useOS } from "./useOS";
import { INTRO, platforms } from "@/lib/site";
import { useVersion } from "./VersionContext";
import { useLaunch } from "./launch/LaunchContext";
import LaunchHero from "./launch/LaunchHero";
import type { StoreItem } from "@/lib/store";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero({ founder = [] }: { founder?: StoreItem[] }) {
  const { launch } = useLaunch();
  if (launch.prelaunch) return <LaunchHero founder={founder} />;
  return <LaunchedHero />;
}

function LaunchedHero() {
  const os = useOS();
  const version = useVersion();
  const OsIcon = os === "mac" ? Apple : os === "linux" ? Linux : Windows;

  return (
    <section className="relative overflow-hidden">
      <div className="nx-glow" aria-hidden />
      <div className="relative mx-auto max-w-[1280px] px-5 pt-14 sm:pt-20">
        <div className="grid items-end gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          <SplitText
            as="h1"
            text="Minecraft, launched beautifully."
            accent={["launched", "beautifully"]}
            accentClassName="text-mute"
            delay={0.1 + INTRO}
            className="v-display !leading-[0.9] text-balance text-[clamp(3rem,8.4vw,7.4rem)] "
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45 + INTRO, ease }}
            className="pb-2"
          >
            <p className="max-w-[440px] text-pretty text-[18px] leading-relaxed text-mute">
              Instances, mods, modpacks, a 3D skin locker, friends chat and a crash analyzer that fixes things for you.
              One fast launcher, free for everyone.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/download" className="nx-pill nx-pill-accent h-14 px-7 text-[17px]">
                <OsIcon className="h-5 w-5" /> Download for {platforms[os].label}
                <ArrowDown className="h-4 w-4" />
              </Link>
              <Link
                href="/download"
                className="inline-flex items-center gap-1 text-[15px] font-medium text-mute transition hover:text-fg"
              >
                Other platforms <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-5 text-[13.5px] text-dim">
              v{version} · Free · Windows, macOS and Linux ·{" "}
              <Link href="/changes" className="underline decoration-dim underline-offset-4 transition hover:text-fg">
                What’s new
              </Link>
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.3 + INTRO, ease }}
          className="nx-shot nx-fade-b mx-auto mt-14 max-w-[1120px] sm:mt-20"
        >
          <Image
            src="/ui/win-home.webp"
            alt="Native Client home screen"
            width={1900}
            height={1187}
            priority
            sizes="(min-width:1280px) 1100px, 94vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
