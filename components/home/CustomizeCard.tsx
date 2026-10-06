"use client";

import { ArrowUpRight, BarChart3, Camera, Coffee, Globe2, RefreshCw, ShieldCheck, Boxes } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "../Reveal";
import SplitText from "../SplitText";

const chips = [
  { icon: Boxes, label: "Fabric · Forge · NeoForge · Quilt" },
  { icon: Coffee, label: "Java 8 – 25, automatic" },
  { icon: ShieldCheck, label: "Crash analyzer" },
  { icon: RefreshCw, label: "One-click mod updates" },
  { icon: Camera, label: "Screenshots & worlds" },
  { icon: BarChart3, label: "Playtime stats" },
  { icon: Globe2, label: "6 languages" },
];

export default function CustomizeCard() {
  return (
    <section id="features" className="mx-auto max-w-[1280px] px-5 pb-24 sm:pb-32">
      <Reveal>
        <div className="nx-panel grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:p-14">
          <div className="nx-shot">
            <Image
              src="/ui/win-settings.webp"
              alt="Native Client settings"
              width={1900}
              height={1187}
              sizes="(min-width:1024px) 640px, 90vw"
            />
          </div>
          <div>
            <SplitText
              text="Make it yours."
              className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[1] tracking-[-0.045em]"
            />
            <p className="mt-5 max-w-[460px] text-[17px] leading-relaxed text-mute">
              Loaders, Java, memory, languages and a crash analyzer that fixes problems for you. Native does the setup
              so you can get straight to playing.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {chips.map((c) => (
                <li key={c.label} className="nx-chip">
                  <c.icon className="h-4 w-4 text-fg" /> {c.label}
                </li>
              ))}
            </ul>
            <Link href="/download" className="nx-pill nx-pill-accent mt-9 h-12 px-6 text-[15px]">
              Download Native <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
