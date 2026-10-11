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
    <section id="faq" className="v-wrap relative grid gap-10 pb-[clamp(84px,11vw,170px)] lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <div className="v-head-rule"><span>(07)</span><span>FAQ</span></div>
        <SplitText as="h2" text="Good questions" className="v-display v-h2 lg:sticky lg:top-28" />
      </div>
      <div className="divide-y divide-line border-y border-line">
        {faqs.map((f, i) => {
          const on = open === i;
          return (
            <Reveal key={f.q} delay={i * 0.04} blur={false} y={16}>
              <button
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className="flex w-full items-center justify-between gap-6 py-6 text-left transition-[padding] duration-500 hover:pl-3"
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
                    <p className="pb-7 pr-16 text-[16px] leading-relaxed text-mute">{f.a}</p>
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
