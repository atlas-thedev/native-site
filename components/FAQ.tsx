"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import Reveal from "./Reveal";
import SplitText from "./SplitText";
import { faqs } from "@/lib/site";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative mx-auto max-w-[920px] px-5 py-32 sm:px-8">
      <div className="mb-14 text-center">
        <Reveal>
          <p className="eyebrow">FAQ</p>
        </Reveal>
        <SplitText text="Good questions." className="mt-5 text-[clamp(2.4rem,5.4vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]" />
      </div>
      <div className="divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-surface">
        {faqs.map((f, i) => {
          const on = open === i;
          return (
            <Reveal key={f.q} delay={i * 0.04} blur={false} y={16}>
              <button
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className="flex w-full items-center justify-between gap-6 px-7 py-6 text-left transition-colors hover:bg-surface"
              >
                <span className="text-[18px] font-semibold tracking-tight">{f.q}</span>
                <motion.span animate={{ rotate: on ? 135 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line">
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-7 pb-7 pr-16 text-[16px] leading-relaxed text-mute">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
