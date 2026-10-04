"use client";

import { useInView } from "motion/react";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const steps = ["Resolve Fabric for 1.21.4", "Install Java 21", "Download libraries", "Fetch assets", "Launch game"];

export default function LaunchPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10%" });
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setT((v) => (v > steps.length * 100 + 110 ? 0 : v + 2.2)), 40);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-8">
      <Reveal blur={false}>
        <div ref={ref} className="dots rounded-[28px] border border-line px-6 py-16 sm:px-14">
          <div className="mx-auto max-w-[760px]">
            <h2 className="text-center text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-[-0.035em]">From click to game</h2>
            <p className="mx-auto mt-3 max-w-[520px] text-center text-mute">Native resolves the version and loader, installs what is missing and starts Minecraft while you watch it happen.</p>
            <div className="mt-12 space-y-4">
              {steps.map((s, i) => {
                const p = Math.min(100, Math.max(0, t - i * 100));
                const done = p >= 100;
                return (
                  <div key={s} className="flex items-center gap-5">
                    <span className="hidden w-[210px] shrink-0 text-right text-[15px] font-semibold sm:block">{s}</span>
                    <div className="relative h-11 flex-1 overflow-hidden rounded-xl border border-line bg-surface">
                      <div className="h-full rounded-xl bg-inv" style={{ width: `${p}%`, opacity: done ? 0.9 : 1 }} />
                      <span className="absolute inset-y-0 left-4 flex items-center text-[13px] font-semibold text-fg mix-blend-difference sm:hidden">{s}</span>
                      <span className="absolute inset-y-0 right-4 flex items-center font-mono text-[12px] text-mute">
                        {done ? <Check className="h-4 w-4 text-inv-fg" strokeWidth={3} /> : p > 0 ? `${Math.round(p)}%` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
