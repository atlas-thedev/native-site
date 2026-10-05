"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const curated = [
  { v: "26.2", n: "Chaos Cubed", img: "chaos_cubed" },
  { v: "26.1", n: "Tiny Takeover", img: "tiny_takeover" },
  { v: "1.21.11", n: "Mounts of Mayhem", img: "mounts_mayhem" },
  { v: "1.21.10", n: "The Copper Age", img: "copper_age" },
  { v: "1.21", n: "Tricky Trials", img: "tricky_trials" },
  { v: "1.20", n: "Trails & Tales", img: "trails_tales" },
  { v: "1.19", n: "The Wild Update", img: "wild_update" },
  { v: "1.18", n: "Caves & Cliffs II", img: "caves_cliffs_2" },
  { v: "1.17", n: "Caves & Cliffs", img: "cavesandcliffs" },
  { v: "1.16", n: "Nether Update", img: "nether_update" },
  { v: "1.14", n: "Village & Pillage", img: "village_pillage" },
  { v: "1.13", n: "Update Aquatic", img: "update_aquatic" },
  { v: "1.12", n: "World of Color", img: "world_color" },
  { v: "1.10", n: "Frostburn Update", img: "frostburn_update" },
  { v: "1.9", n: "Combat Update", img: "combat_update" },
  { v: "1.8", n: "Bountiful Update", img: "bountiful_update" },
];

type Latest = { release: string; releaseDate: string | null; snapshot: string; snapshotDate: string | null } | null;

const cardSize = "h-[min(520px,62vh)] w-[min(340px,72vw)] shrink-0 rounded-[26px]";
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");

export default function VersionsRail({ latest }: { latest: Latest }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(2400);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const measure = () => {
      setMobile(window.innerWidth < 1024);
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth + 80));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.04, 0.96], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0.04, 0.96], [0, 1]);

  const rail = (
    <div ref={track} className="flex w-max items-center gap-5 pl-[max(1.5rem,calc((100vw-1240px)/2+2rem))] pr-24">
      <div className="mr-10 w-[min(520px,80vw)] shrink-0">
        <p className="eyebrow">Versions</p>
        <h2 className="mt-5 text-balance text-[clamp(2.6rem,5.6vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.045em]">
          Every version.
          <br />
          <span className="text-mute">Every era.</span>
        </h2>
        <p className="mt-6 max-w-[420px] text-lg leading-relaxed text-mute">
          From the combat update classics to the newest releases and snapshots, straight from Mojang. Create an instance for any release and Native sets up the loader and Java.
        </p>
        <p className="mt-8 flex items-center gap-3 font-mono text-[12px] text-dim">
          scroll <span className="h-px w-16 bg-line" />
        </p>
      </div>
      {latest && !curated.some((c) => c.v === latest.release) && (
        <Link href="/changes" className={`${cardSize} group flex flex-col justify-between bg-inv p-6 text-inv-fg transition-transform duration-500 hover:-translate-y-2.5`}>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">Latest release</span>
          <div>
            <div className="text-[clamp(3rem,4.6vw,4.2rem)] font-extrabold leading-none tracking-[-0.05em]">{latest.release}</div>
            <div className="mt-2 text-[15px] font-medium opacity-70">Released {fmt(latest.releaseDate)}</div>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold">See what’s new <span aria-hidden>→</span></div>
          </div>
        </Link>
      )}
      {latest && (
        <Link href="/changes" className={`${cardSize} group flex flex-col justify-between border border-dashed border-dim p-6 transition-transform duration-500 hover:-translate-y-2.5`}>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Latest snapshot</span>
          <div>
            <div className="text-[clamp(1.5rem,2.2vw,2.1rem)] font-extrabold leading-[1.05] tracking-[-0.04em] [overflow-wrap:anywhere]">{latest.snapshot}</div>
            <div className="mt-2 text-[15px] font-medium text-mute">{fmt(latest.snapshotDate)}</div>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold">Playable today <span aria-hidden>→</span></div>
          </div>
        </Link>
      )}
      {curated.map((v, i) => (
        <motion.figure
          key={v.v}
          whileHover={{ y: -10 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`group relative ${cardSize} overflow-hidden border border-line bg-black text-white`}
        >
          <Image src={`/art/${v.img}.webp`} alt={`${v.n} artwork`} fill quality={95} sizes="(max-width: 640px) 72vw, 340px" className="object-cover grayscale transition duration-[1200ms] ease-out group-hover:scale-110 group-hover:grayscale-0" />
          <div className="absolute inset-0 bg-black/45" />
          <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/70">{String(i + 1).padStart(2, "0")}</span>
            <div className="mt-1 text-[clamp(3rem,4.6vw,4.2rem)] font-extrabold leading-none tracking-[-0.05em] text-white">{v.v}</div>
            <div className="mt-1 text-[16px] font-medium text-white/80">{v.n}</div>
          </figcaption>
        </motion.figure>
      ))}
      <div className={`ml-6 flex ${cardSize} flex-col items-start justify-end border border-dashed border-dim p-6`}>
        <div className="text-3xl font-extrabold tracking-tight">…and snapshots, legacy &amp; more.</div>
        <p className="mt-2 text-mute">Release, snapshot and classic builds, all in the same list.</p>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <section id="versions" className="relative overflow-hidden py-24">
        <div className="no-scrollbar overflow-x-auto pb-4">{rail}</div>
      </section>
    );
  }

  return (
    <section id="versions" ref={ref} className="relative" style={{ height: "380vh" }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div style={{ x }} className="will-change-transform">
          {rail}
        </motion.div>
        <div className="absolute inset-x-0 bottom-10 mx-auto h-[3px] w-[min(520px,70vw)] overflow-hidden rounded-full bg-line">
          <motion.div className="h-full origin-left rounded-full bg-inv" style={{ scaleX: bar }} />
        </div>
      </div>
    </section>
  );
}
