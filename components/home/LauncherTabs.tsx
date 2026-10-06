"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Reveal from "../Reveal";
import SplitText from "../SplitText";

const tabs = [
  {
    id: "instances",
    label: "Your instances",
    title: "Every game gets its own space.",
    body: "Create isolated instances for any Minecraft version. Native installs Fabric, Forge, NeoForge or Quilt and the right Java for you, then keeps worlds, screenshots and playtime organised per instance.",
    img: "/ui/win-instances.webp",
    alt: "Native Client instances screen",
  },
  {
    id: "mods",
    label: "Mods & modpacks",
    title: "Find it. Install it. Play.",
    body: "Search Modrinth and CurseForge together, see dependencies before you install and update every mod in one sweep. Shaders, resource packs and data packs are covered too.",
    img: "/ui/win-discover.webp",
    alt: "Native Client Discover screen",
  },
  {
    id: "locker",
    label: "Skin locker",
    title: "Your look, in 3D.",
    body: "Preview skins and capes on a live 3D model, keep a wardrobe of favourites and sync it to your account. Manage it from the launcher or right here on the website.",
    img: "/ui/win-locker.webp",
    alt: "Native Client skin locker",
  },
  {
    id: "relay",
    label: "Play together",
    title: "Friends are built in.",
    body: "Relay gives you friends, direct messages, group chats and presence that shows which instance someone is playing, with one-click sharing so everyone is on the same page.",
    img: "/ui/win-relay.webp",
    alt: "Native Client Relay chat",
  },
] as const;

export default function LauncherTabs() {
  const [id, setId] = useState<(typeof tabs)[number]["id"]>(tabs[0].id);
  const tab = tabs.find((t) => t.id === id) ?? tabs[0];

  return (
    <section id="launcher" className="mx-auto max-w-[1280px] px-5 py-24 sm:py-32">
      <div className="mb-10 text-center">
        <SplitText
          text="Your launcher."
          className="text-[clamp(2.6rem,6vw,5rem)] font-extrabold leading-[1] tracking-[-0.045em]"
        />
        <Reveal delay={0.1}>
          <div className="mt-8 flex justify-center">
            <div role="tablist" aria-label="Launcher features" className="nx-seg">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={t.id === id}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setId(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1"
          >
            <h3 className="text-[clamp(1.9rem,3.4vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              {tab.title}
            </h3>
            <p className="mt-5 text-[17px] leading-relaxed text-mute">{tab.body}</p>
            <Link
              href="/download"
              className="nx-pill nx-pill-ghost mt-8 h-12 px-6 text-[15px]"
            >
              Try it in Native <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="nx-shot order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Image
                src={tab.img}
                alt={tab.alt}
                width={1900}
                height={1187}
                sizes="(min-width:1024px) 760px, 94vw"
                style={{ display: "block", width: "100%", height: "auto", borderRadius: 13 }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
