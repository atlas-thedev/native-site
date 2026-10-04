"use client";

import { motion } from "motion/react";
import { BarChart3, Camera, Globe2, Globe, RefreshCw, Shirt } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";

const words = ["Fabric", "Forge", "NeoForge", "Quilt", "Vanilla", "Modrinth", "CurseForge", "Java 8 – 25", "Snapshots"];

const tiles = [
  { icon: Globe2, title: "Six languages", body: "English, Español, Deutsch, Français, Português (Brasil) and Türkçe." },
  { icon: BarChart3, title: "Playtime stats", body: "See how long you have played each instance and in total." },
  { icon: RefreshCw, title: "Mod updates", body: "Native checks your installed mods and updates them in one sweep." },
  { icon: Camera, title: "Screenshots", body: "Every in-game screenshot is collected per instance." },
  { icon: Globe, title: "Worlds", body: "Browse and back up your worlds without touching folders." },
  { icon: Shirt, title: "Skins and capes", body: "A 3D wardrobe for the look you play with." },
];

export default function More() {
  const row = [...words, ...words];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1280px] px-5">
        <div className="mb-12 text-center">
          <Reveal><p className="eyebrow">And that’s not all</p></Reveal>
          <SplitText text="Always up to date with Minecraft" className="mx-auto mt-5 max-w-[860px] text-balance text-[clamp(2.2rem,4.8vw,3.8rem)] font-extrabold leading-[1.02] tracking-[-0.04em]" />
          <Reveal delay={0.15}>
            <p className="mx-auto mt-5 max-w-[560px] text-lg text-mute">From the classic 1.x releases to the newest 26.x versions, snapshots included.</p>
          </Reveal>
        </div>
      </div>

      <div className="marquee overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-track flex items-center gap-10 pr-10">
          {row.map((w, n) => (
            <span key={n} className="flex items-center gap-10 whitespace-nowrap text-[clamp(2.4rem,5vw,4.4rem)] font-extrabold tracking-[-0.04em]">
              <span className={n % 2 ? "text-dim" : ""}>{w}</span>
              <span className="h-2 w-2 rounded-full bg-line" style={{ background: "var(--dim)" }} />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1280px] gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t, n) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: (n % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="rounded-[22px] border border-line bg-surface p-7"
          >
            <t.icon className="h-6 w-6" />
            <h3 className="mt-5 text-[19px] font-bold tracking-tight">{t.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">{t.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
