"use client";

import { ArrowUpRight, FlaskConical, Vote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "../Reveal";
import SplitText from "../SplitText";

export default function PerksCards() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-24 sm:pb-32">
      <div className="mb-10 text-center">
        <SplitText
          text="Go further."
          className="text-[clamp(2.6rem,6vw,5rem)] font-extrabold leading-[1] tracking-[-0.045em]"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal className="h-full">
          <div className="nx-panel flex h-full flex-col p-8 sm:p-10">
            <p className="eyebrow">Cloaks</p>
            <h3 className="mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              Your skin. Your cape.
            </h3>
            <p className="mt-4 max-w-[420px] text-[16.5px] leading-relaxed text-mute">
              Browse Native capes, preview them in 3D and wear them everywhere you play.
            </p>
            <Link href="/cloaks" className="nx-pill nx-pill-ghost mt-7 h-12 w-fit px-6 text-[15px]">
              Browse capes <ArrowUpRight className="h-4 w-4" />
            </Link>
            <div className="nx-shot mt-9 hidden sm:block">
              <Image src="/ui/locker-capes.webp" alt="Cape locker" width={900} height={560} sizes="560px" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="h-full">
          <div className="nx-panel flex h-full flex-col p-8 sm:p-10">
            <div className="plus-glow pointer-events-none absolute inset-0" aria-hidden />
            <p className="eyebrow text-gold">Native+</p>
            <h3 className="relative mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              Back Native. Get something shiny.
            </h3>
            <p className="relative mt-4 max-w-[420px] text-[16.5px] leading-relaxed text-mute">
              The launcher is free and always will be. Native+ is how you support its development and add a little
              extra to your account.
            </p>
            <Link href="/plus" className="plus-gold nx-pill relative mt-7 h-12 w-fit px-6 text-[15px]">
              See Native+ <ArrowUpRight className="h-4 w-4" />
            </Link>
            <div className="relative mt-auto grid gap-3 pt-10 sm:grid-cols-2">
              <Link
                href="/beta"
                className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:bg-surface-2"
              >
                <FlaskConical className="h-5 w-5 text-beta" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[15px] font-bold">Super Beta</span>
                  <span className="text-[13px] text-dim">Try builds early</span>
                </span>
              </Link>
              <Link
                href="/vote"
                className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:bg-surface-2"
              >
                <Vote className="h-5 w-5" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[15px] font-bold">Community vote</span>
                  <span className="text-[13px] text-dim">Shape what’s next</span>
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
