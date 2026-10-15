"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Crown, FlaskConical, Vote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import ScrollWords from "../ScrollWords";
import SectionHead from "../SectionHead";
import Counter from "../Counter";
import Magnetic from "../Magnetic";
import ItemArt from "../../launch/ItemArt";
import Reveal from "../../Reveal";
import { useAccount } from "../../useAccount";
import type { StoreItem } from "@/lib/store";

const ease = [0.16, 1, 0.3, 1] as const;

export function Statement({ items }: { items: number }) {
  return (
    <section id="statement" className="v-section v-wrap">
      <div className="v-head-rule">
        <span>Manifesto</span>
      </div>
      <ScrollWords
        className="max-w-[1250px] text-balance text-[clamp(2rem,4.6vw,4.6rem)] font-semibold leading-[1.08] tracking-[-0.035em]"
        text="Native is a Minecraft launcher for people who care how their tools feel. Instances, mods, skins, friends and fixes — one fast app that gets out of your way and lets you play."
        highlight={["feel", "play"]}
      />
      <div className="v-stats mt-[clamp(60px,8vw,120px)]">
        {[
          { n: 3, s: "", l: "Platforms. Windows, macOS and Linux, one account." },
          { n: 0, s: "$", l: "To download and play. Free, forever, for everyone." },
          { n: items, s: "+", l: "Capes, cloaks and cosmetics in the Native locker." },
          { n: 1, s: "", l: "Click to install a modpack, fix a crash or switch your look." },
        ].map((x, i) => (
          <div key={i} className="v-stat">
            <span className="v-stat-n">{x.s === "$" ? "$" : ""}<Counter to={x.n} />{x.s === "+" ? "+" : ""}</span>
            <p className="v-stat-l">{x.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const features = [
  { t: "Instances", d: "Separate worlds, mods and settings for every way you play.", img: "/ui/win-instances-v5.webp" },
  { t: "Mods & packs", d: "Search Modrinth and CurseForge, install in one click, dependencies handled.", img: "/ui/manager-mods-v5.webp" },
  { t: "Skin locker", d: "Your skins and capes in 3D. Wear them in every game.", img: "/ui/win-locker-v5.webp" },
  { t: "Relay chat", d: "Friends, groups and invites — right inside the launcher.", img: "/ui/win-relay-v5.webp" },
  { t: "Crash fixer", d: "Reads the log, finds the culprit and fixes it for you.", img: "/ui/crash-dialog.webp" },
  { t: "Discover", d: "Servers, modpacks and worlds picked for you.", img: "/ui/win-discover-v5.webp" },
  { t: "Every version", d: "From the newest snapshot back to the classics.", img: "/ui/win-versions.webp" },
];

export function FeatureIndex() {
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <section id="features" className="v-section v-wrap" onPointerMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      <SectionHead index="(02)" label="Features" title="Everything, in one launcher" sub="Seven things Native does so you never have to open another tool. Hover a row to peek inside." />
      <ul className="v-index" onPointerLeave={() => setHover(null)}>
        {features.map((f, i) => (
          <motion.li
            key={f.t}
            className="v-index-row"
            onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, delay: i * 0.04, ease }}
          >
            <span className="v-index-n">0{i + 1}</span>
            <span className="v-index-t">{f.t}</span>
            <span className="v-index-d">{f.d}</span>
          </motion.li>
        ))}
      </ul>
      <AnimatePresence>
        {hover != null && (
          <motion.div
            key="peek"
            className="v-peek hidden md:block"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, x: pos.x + 28, y: pos.y - 120 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.35, ease }, x: { type: "spring", stiffness: 260, damping: 28 }, y: { type: "spring", stiffness: 260, damping: 28 } }}
          >
            {features.map((f, i) => (
              <Image key={f.img} src={f.img} alt="" width={880} height={550} sizes="440px" className={`absolute inset-0 transition-opacity duration-300 ${i === hover ? "opacity-100" : "opacity-0"}`} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Three feature spreads with a parallax screenshot each. */
export function Spreads() {
  const rows = [
    { k: "Mod manager", t: "Mods without the mess", d: "Every installed mod in one list. Toggle, update or remove it — Native tracks dependencies so nothing breaks.", pts: ["Modrinth + CurseForge search", "One-click modpacks", "Auto updates per instance"], img: "/ui/manager-mods-v5.webp" },
    { k: "Crash analyzer", t: "It reads the crash so you don’t", d: "When a game closes unexpectedly Native spots the cause, explains it in plain language and offers the fix.", pts: ["Finds the conflicting mod", "Wrong Java? Fixed", "Share a clean report"], img: "/ui/crash-dialog.webp" },
    { k: "Locker", t: "A locker for your look", d: "Preview skins and capes in 3D before you wear them, keep a wardrobe, and switch looks in a click.", pts: ["3D preview", "Skins + capes + cosmetics", "Works on every server you join"], img: "/ui/locker-skins.webp" },
  ];
  return (
    <section className="v-wrap pb-[clamp(60px,9vw,140px)]">
      {rows.map((r, i) => (
        <Spread key={r.k} i={i} {...r} />
      ))}
    </section>
  );
}

function Spread({ i, k, t, d, pts, img }: { i: number; k: string; t: string; d: string; pts: string[]; img: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  return (
    <div ref={ref} className={`v-feat ${i % 2 ? "is-flip" : ""}`}>
      <Reveal>
        <p className="v-label">0{i + 1} / {k}</p>
        <h3 className="v-display v-h3 mt-5">{t}</h3>
        <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-mute">{d}</p>
        <ul className="v-feat-list max-w-[440px]">
          {pts.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </Reveal>
      <div className="v-shot aspect-[16/10]">
        <motion.div style={{ y }} className="absolute inset-[-8%_0]">
          <Image src={img} alt={t} fill sizes="(min-width:1024px) 800px, 94vw" className="object-cover object-top" />
        </motion.div>
      </div>
    </div>
  );
}

export function Locker({ items }: { items: StoreItem[] }) {
  if (!items.length) return null;
  return (
    <section className="v-section v-wrap !pt-0">
      <SectionHead index="(03)" label="The locker" title="Wear something rare" sub="Animated capes, cloaks and cosmetics, made for Native. Preview them in 3D and wear them on every server." />
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 8).map((it, i) => (
          <motion.li key={it.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: (i % 4) * 0.06 }}>
            <Link href={`/cloaks/${encodeURIComponent(it.id)}`} data-cursor="View" className="group relative flex aspect-[4/5] flex-col justify-between bg-bg p-4 transition-colors hover:bg-surface">
              <span className="flex justify-between v-label"><span>0{i + 1}</span>{it.isNew ? <span className="text-fg">New</span> : it.exclusive ? <span>Exclusive</span> : null}</span>
              <span className="grid flex-1 place-items-center">
                <span className="transition duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2 group-hover:scale-110">
                  <ItemArt item={it} width={84} className="cutout-sm" />
                </span>
              </span>
              <span className="flex items-end justify-between gap-2">
                <span className="truncate font-[family-name:var(--font-display)] text-[22px] uppercase leading-none">{it.name}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-dim transition group-hover:text-fg" />
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/store" className="v-btn">Open the store <ArrowUpRight /></Link>
        <Link href="/skins" className="v-btn">Browse skins <ArrowUpRight /></Link>
      </div>
    </section>
  );
}

export function GoFurther() {
  const cards = [
    { k: "Native+", t: "Back Native. Get something shiny.", d: "The launcher is free and always will be. Native+ is how you support it and add a little extra to your account.", href: "/plus", cta: "See Native+", Icon: Crown },
    { k: "Super Beta", t: "Play it before everyone else.", d: "Try new builds early and help shape what ships.", href: "/beta", cta: "Join the beta", Icon: FlaskConical },
    { k: "Community vote", t: "You decide what’s next.", d: "Vote on what Native builds and drops next.", href: "/vote", cta: "Cast your vote", Icon: Vote },
  ];
  return (
    <section className="v-section v-wrap !pt-0">
      <SectionHead index="(05)" label="Go further" title="More than a launcher" />
      <div className="grid gap-px overflow-hidden rounded-[16px] border border-line bg-line lg:grid-cols-3">
        {cards.map(({ k, t, d, href, cta, Icon }) => (
          <Link key={k} href={href} className="group flex min-h-[340px] flex-col bg-bg p-7 transition-colors duration-500 hover:bg-fg hover:text-bg sm:p-9">
            <span className="flex items-center justify-between">
              <span className="v-label group-hover:text-bg/60">{k}</span>
              <Icon className="h-5 w-5" />
            </span>
            <span className="mt-auto block pt-14 font-[family-name:var(--font-display)] text-[clamp(2.2rem,3.4vw,3.2rem)] uppercase leading-[0.95]">{t}</span>
            <span className="mt-4 block max-w-[360px] text-[15px] leading-relaxed text-mute group-hover:text-bg/70">{d}</span>
            <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.08em]">{cta} <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BigCta({ pre }: { pre: boolean }) {
  const signedIn = !!useAccount();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "0%"]);
  return (
    <section ref={ref} className="v-cta">
      <div className="v-wrap py-[clamp(80px,11vw,170px)]">
        <p className="v-label">{pre ? "Before launch" : "Get Native"}</p>
        <motion.h2 style={{ x }} className="v-display mt-6 whitespace-nowrap text-[clamp(3.4rem,13vw,13.5rem)]">
          {pre ? "Be there first" : "Download Native"}
        </motion.h2>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-bg/15 pt-8">
          <p className="max-w-[460px] text-[17px] leading-relaxed opacity-70">
            {pre ? "Make a free account today and pick one exclusive founder cape. Downloads open the second the countdown hits zero." : "Free for Windows, macOS and Linux, with automatic updates built in."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <Link href={pre ? (signedIn ? "/founder" : "/register?next=/founder") : "/download"} className="v-btn is-solid is-lg">
                {pre ? (signedIn ? "Pick your free cape" : "Create free account") : "Download"}
              </Link>
            </Magnetic>
            <Link href={pre ? "/beta" : "/changes"} className="v-btn is-lg">{pre ? "Super Beta" : "What’s new"} <ArrowUpRight /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
