"use client";

import { motion } from "motion/react";
import {
  ArrowUpRight,
  Bug,
  Compass,
  Gauge,
  Layers,
  MessageCircle,
  Package,
  RefreshCw,
  Server,
  Shirt,
  Swords,
  UserRound,
  Users,
  Zap,
  History,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import SectionHead from "../SectionHead";
import Counter from "../Counter";
import Reveal from "../../Reveal";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (i = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.9, delay: i * 0.05, ease },
});

/** "One launcher. Everything included." Stats + every feature grouped by what it is for. */
export function Included({ items, versions }: { items: number; versions: number }) {
  const groups: { k: string; icon: ReactNode; list: string[] }[] = [
    { k: "Launcher", icon: <Zap />, list: ["Instances", "Every version", "Fast start", "Auto updates"] },
    { k: "Mods & packs", icon: <Package />, list: ["Modrinth", "CurseForge", "One-click modpacks", "Dependency check"] },
    { k: "Your look", icon: <Shirt />, list: ["3D skin locker", "Animated capes", "Cosmetics", "Dyes"] },
    { k: "Social", icon: <MessageCircle />, list: ["Relay chat", "Friends", "Groups", "Invites"] },
    { k: "Fixes", icon: <Bug />, list: ["Crash analyzer", "Java fixer", "Clean reports", "Logs"] },
    { k: "Discover", icon: <Compass />, list: ["Servers", "Modpacks", "Worlds", "Skins"] },
  ];
  const stats = [
    { n: versions, s: "+", l: "Minecraft versions" },
    { n: items, s: "+", l: "Capes & cosmetics" },
    { n: 3, s: "", l: "Platforms" },
  ];
  return (
    <section id="features" className="v-section v-wrap">
      <SectionHead index="(01)" label="Everything included" title="One launcher. Everything included." sub="Instances, mods, skins, friends and fixes packed into one fast app. Install it, sign in, play. That simple." />
      <div className="grid grid-cols-3 border-y border-line">
        {stats.map((x, i) => (
          <motion.div key={x.l} {...rise(i)} className={`py-7 ${i ? "border-l border-line pl-[clamp(14px,2vw,28px)]" : ""}`}>
            <span className="v-stat-n block"><Counter to={x.n} />{x.s}</span>
            <span className="v-label mt-2 block">{x.l}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => (
          <motion.div key={g.k} {...rise(i)} className="bg-bg p-6 sm:p-7">
            <span className="flex items-center justify-between">
              <span className="v-label">Native · {g.k}</span>
              <span className="text-dim [&>svg]:h-5 [&>svg]:w-5">{g.icon}</span>
            </span>
            <ul className="mt-6 flex flex-wrap gap-2">
              {g.list.map((t) => (
                <li key={t} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13.5px] font-semibold">{t}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/** Big headline + screenshot + three small points, alternating sides. */
function Feature({ i, k, t, d, img, pts }: { i: number; k: string; t: string; d: string; img: string; pts: { icon: ReactNode; t: string; d: string }[] }) {
  return (
    <div className="v-section !pb-0">
      <div className={`grid items-center gap-[clamp(28px,5vw,80px)] lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <Reveal>
          <p className="v-label">{k}</p>
          <h2 className="v-display v-h2 mt-5">{t}</h2>
          <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-mute">{d}</p>
        </Reveal>
        <motion.div {...rise()} className="v-shot aspect-[16/10]">
          <Image src={img} alt={t} fill sizes="(min-width:1024px) 640px, 94vw" className="object-cover object-top" />
        </motion.div>
      </div>
      <div className="mt-10 grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-3">
        {pts.map((p, j) => (
          <motion.div key={p.t} {...rise(j)} className="bg-bg p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-line bg-surface [&>svg]:h-[18px] [&>svg]:w-[18px]">{p.icon}</span>
            <h3 className="mt-4 text-[17px] font-bold tracking-tight">{p.t}</h3>
            <p className="mt-1 text-[14.5px] leading-relaxed text-mute">{p.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Highlights() {
  return (
    <section className="v-wrap">
      <Feature
        i={0}
        k="Relay chat"
        t="Your friends. Right in the launcher."
        d="Chat with friends, start a group and invite people into your game without alt-tabbing to another app."
        img="/ui/win-relay.webp"
        pts={[
          { icon: <MessageCircle />, t: "Direct messages", d: "Emoji, GIFs and pasted images." },
          { icon: <Users />, t: "Groups", d: "One chat for the whole squad." },
          { icon: <Swords />, t: "Invites", d: "See what friends play and join them." },
        ]}
      />
      <Feature
        i={1}
        k="Mods & crashes"
        t="Mods without the mess."
        d="Search Modrinth and CurseForge, install in a click and let Native handle the rest. If a game crashes, Native reads the log and offers the fix."
        img="/ui/manager-mods.webp"
        pts={[
          { icon: <Package />, t: "One-click modpacks", d: "Whole packs, ready to play." },
          { icon: <RefreshCw />, t: "Updates per instance", d: "Keep each setup up to date." },
          { icon: <Bug />, t: "Crash analyzer", d: "Finds the culprit, explains it." },
        ]}
      />
    </section>
  );
}

/** "Our launcher. Lightning fast." Eight cards. */
export function LauncherGrid() {
  const cards: { icon: ReactNode; t: string; d: string }[] = [
    { icon: <Gauge />, t: "Fast start", d: "From click to playing in seconds." },
    { icon: <Layers />, t: "Instances", d: "Separate mods, worlds and settings for every way you play." },
    { icon: <History />, t: "Every version", d: "The newest snapshot back to the classics." },
    { icon: <Package />, t: "Mod browser", d: "Modrinth and CurseForge, built in." },
    { icon: <Shirt />, t: "3D locker", d: "Skins, capes and cosmetics on your own model." },
    { icon: <Server />, t: "Servers", d: "Find a server and jump straight in." },
    { icon: <UserRound />, t: "Native or Microsoft", d: "Sign in with the account you already have." },
    { icon: <RefreshCw />, t: "Auto updates", d: "Always on the latest build, no reinstalling." },
  ];
  return (
    <section className="v-section v-wrap">
      <SectionHead index="(04)" label="The launcher" title="Our launcher. Lightning fast." sub="Everything you need to play the way you want, in one window." />
      <div className="grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.t} {...rise(i % 4)} className="group bg-bg p-6 transition-colors duration-300 hover:bg-surface sm:p-7">
            <span className="text-dim transition group-hover:text-fg [&>svg]:h-6 [&>svg]:w-6">{c.icon}</span>
            <h3 className="mt-8 text-[18px] font-bold tracking-tight">{c.t}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">{c.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/** Plain-language explainer, like an encyclopedia entry, before the FAQ. */
export function Explainer({ versions }: { versions: number }) {
  const facts = [
    { t: "Free forever", d: "The launcher costs nothing." },
    { t: `${versions}+ versions`, d: "Snapshots to the classics." },
    { t: "3 platforms", d: "Windows, macOS and Linux." },
  ];
  return (
    <section className="v-section v-wrap">
      <div className="grid gap-[clamp(28px,5vw,80px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal>
          <p className="v-label">Good to know</p>
          <h2 className="v-display v-h2 mt-5">What is a Minecraft launcher?</h2>
        </Reveal>
        <Reveal>
          <p className="text-[17px] leading-relaxed text-mute">
            A launcher is the app you start Minecraft from. The official one starts the game and not much else. Native adds the tools you would otherwise hunt for: separate instances, a mod browser, a 3D skin locker, friends chat and a crash analyzer.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-mute">
            You still need your Minecraft account. Native changes how you set up and launch the game, not the game itself, and it never adds cheats.
          </p>
          <div className="mt-8 grid grid-cols-3 border-t border-line">
            {facts.map((f, i) => (
              <div key={f.t} className={`pt-5 ${i ? "border-l border-line pl-4" : ""}`}>
                <span className="block text-[17px] font-bold tracking-tight">{f.t}</span>
                <span className="mt-1 block text-[13.5px] text-mute">{f.d}</span>
              </div>
            ))}
          </div>
          <Link href="/download" className="v-btn mt-8">Get Native <ArrowUpRight /></Link>
        </Reveal>
      </div>
    </section>
  );
}
