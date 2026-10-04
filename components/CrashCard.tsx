"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Check } from "lucide-react";
import Reveal from "./Reveal";

const points = ["Finds the conflicting mod, wrong Java or low memory", "One-click fixes applied to the instance", "Share a clean report with a link"];

export default function CrashCard() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-8">
      <Reveal blur={false}>
        <div style={{ overflow: "visible" }} className="card grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow">Crash analyzer</p>
            <h3 className="mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">It reads the crash so you don’t have to.</h3>
            <p className="mt-4 max-w-[480px] text-[16.5px] leading-relaxed text-mute">
              When the game closes unexpectedly Native opens the log, works out what went wrong and tells you in plain language.
            </p>
            <ul className="mt-7 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[15.5px]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-inv text-inv-fg"><Check className="h-3 w-3" strokeWidth={3.5} /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex justify-center lg:-my-24 lg:justify-end lg:pr-4">
            <motion.div initial={{ rotate: 3 }} whileHover={{ rotate: 0, y: -8 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} className="w-[min(380px,80%)]">
              <Image src="/ui/crash-dialog.webp" alt="Native crash analyzer dialog" width={1100} height={1242} sizes="380px" className="cutout h-auto w-full" />
            </motion.div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
