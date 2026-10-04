"use client";

import { motion } from "motion/react";
import { Boxes, Coffee, Package } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";

const items = [
  {
    icon: Boxes,
    title: "Built-in modloaders",
    body: "Fabric, Forge, NeoForge and Quilt are one click away. Native installs the right loader build for your Minecraft version, so you never touch an installer again.",
  },
  {
    icon: Package,
    title: "Mods and modpacks",
    body: "Search Modrinth and CurseForge together, see dependencies before you install, and update everything in one sweep. Shaders, resource packs and data packs too.",
  },
  {
    icon: Coffee,
    title: "The right Java, automatically",
    body: "Native detects the Java runtimes on your machine and installs the one each version needs. Nothing to download, nothing to configure.",
    invert: true,
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1280px] px-5 py-24">
      <div className="mb-14 text-center">
        <SplitText text="Elevate your Minecraft experience" className="mx-auto max-w-[800px] text-balance text-[clamp(2.2rem,4.8vw,3.8rem)] font-extrabold leading-[1.02] tracking-[-0.04em]" />
        <Reveal delay={0.15}>
          <p className="mx-auto mt-5 max-w-[620px] text-lg text-mute">Everything you do in Minecraft — organised, fast and out of your way.</p>
        </Reveal>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.article
            key={it.title}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className={`rounded-[24px] p-8 ${it.invert ? "bg-inv text-inv-fg" : "border border-line bg-surface"}`}
          >
            <div className="flex items-center gap-3">
              <it.icon className="h-6 w-6" />
              <h3 className="text-[21px] font-bold tracking-tight">{it.title}</h3>
            </div>
            <p className={`mt-4 text-[15.5px] leading-relaxed ${it.invert ? "opacity-70" : "text-mute"}`}>{it.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
