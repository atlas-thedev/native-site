"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";

const tabs = [
  { id: "mods", label: "Mods", img: "/ui/manager-mods-v5.webp", text: "See every installed mod, toggle it, update it or remove it. Dependencies are tracked for you." },
  { id: "console", label: "Console", img: "/ui/manager-console.webp", text: "A live game console with filters, search and one-click copy, right next to your instance." },
  { id: "screenshots", label: "Screenshots", img: "/ui/manager-screenshots-v5.webp", text: "Every screenshot you take in game, in a gallery that belongs to the instance." },
  { id: "worlds", label: "Worlds", img: "/ui/manager-worlds.webp", text: "Browse, back up and open your worlds without digging through folders." },
];
const DURATION = 6000;

export default function Tour() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20%" });

  useEffect(() => {
    if (!inView || paused) return;
    const id = setTimeout(() => setI((v) => (v + 1) % tabs.length), DURATION);
    return () => clearTimeout(id);
  }, [i, inView, paused, tick]);

  const pick = (n: number) => {
    setI(n);
    setTick((t) => t + 1);
  };

  return (
    <section id="tour" className="mx-auto max-w-[1280px] px-5 py-24">
      <div className="mb-12 text-center">
        <Reveal><p className="eyebrow">Product tour</p></Reveal>
        <SplitText text="Every instance in one place" className="mx-auto mt-5 max-w-[800px] text-balance text-[clamp(2.2rem,4.8vw,3.8rem)] font-extrabold leading-[1.02] tracking-[-0.04em]" />
      </div>

      <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1 no-scrollbar">
          {tabs.map((t, n) => (
            <button
              key={t.id}
              onClick={() => pick(n)}
              className={`relative overflow-hidden rounded-full px-5 py-2 text-[14.5px] font-semibold transition-colors ${n === i ? "bg-inv text-inv-fg" : "text-mute hover:text-fg"}`}
            >
              {t.label}
              {n === i && !paused && inView && (
                <motion.span key={`${i}-${tick}`} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-inv-fg opacity-40" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: DURATION / 1000, ease: "linear" }} />
              )}
            </button>
          ))}
        </div>

        <div className="dots relative mt-8 rounded-[28px] border border-line px-4 py-10 sm:px-12 sm:py-14">
          <div className="no-scrollbar -mx-2 overflow-x-auto sm:mx-0 sm:overflow-visible">
          <div className="relative mx-auto aspect-[1500/1038] w-[640px] max-w-none sm:w-full sm:max-w-[860px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tabs[i].id}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image src={tabs[i].img} alt={`${tabs[i].label} view of an instance`} fill sizes="860px" className="cutout object-contain" />
              </motion.div>
            </AnimatePresence>
          </div>
          </div>
          <div className="pointer-events-none absolute -left-3 top-8 hidden w-[170px] -rotate-6 xl:block" style={{ animation: "float-y 7s ease-in-out infinite" }}>
            <Image src="/ui/card-1.webp" alt="" width={634} height={626} className="cutout-sm h-auto w-full" />
          </div>
          <div className="pointer-events-none absolute -right-3 bottom-10 hidden w-[170px] rotate-6 xl:block" style={{ animation: "float-y 8s ease-in-out 1s infinite" }}>
            <Image src="/ui/card-2.webp" alt="" width={634} height={626} className="cutout-sm h-auto w-full" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={tabs[i].id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="mx-auto mt-6 max-w-[560px] text-center text-[16.5px] text-mute">
            {tabs[i].text}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
