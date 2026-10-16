"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCountdown } from "./LaunchContext";

const pad = (n: number) => String(n).padStart(2, "0");

function Digit({ ch, big }: { ch: string; big: boolean }) {
  return (
    <span className={`relative inline-flex justify-center overflow-hidden ${big ? "w-[0.62em]" : "w-[0.64em]"}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={ch}
          initial={{ y: "-70%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "70%", opacity: 0, filter: "blur(6px)" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="inline-block"
        >
          {ch}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Unit({ value, label, big, progress = null }: { value: string; label: string; big: boolean; progress?: number | null }) {
  return (
    <div className={`group relative flex flex-col items-center ${big ? "overflow-hidden rounded-[28px] border border-line bg-[linear-gradient(180deg,var(--surface-2),var(--surface)_55%,transparent)] px-2 pb-3 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_60px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-fg/30 sm:px-5 sm:pb-5 sm:pt-4" : ""}`}>
      {big && <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-fg/40 to-transparent" />}
      {big && <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-line" />}
      <span className="relative inline-flex whitespace-nowrap font-mono font-extrabold leading-none tabular-nums tracking-[-0.06em] [text-shadow:0_2px_24px_rgba(255,255,255,0.12)]">
        {value.split("").map((c, i) => <Digit key={i} ch={c} big={big} />)}
      </span>
      <span className={`relative mt-2 font-mono uppercase text-dim ${big ? "text-[9px] tracking-[0.18em] sm:text-[12.5px] sm:tracking-[0.28em]" : "text-[10px] tracking-[0.2em]"}`}>{label}</span>
      {big && progress != null && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-surface">
          <span className="block h-full bg-fg/70 transition-[width] duration-1000 ease-linear" style={{ width: `${progress * 100}%` }} />
        </span>
      )}
    </div>
  );
}

/** Days / hours / minutes / seconds to `at`. `size="hero"` is the giant one. */
export default function Countdown({ at, size = "hero", className = "" }: { at: number; size?: "hero" | "sm"; className?: string }) {
  const t = useCountdown(at);
  const big = size === "hero";

  if (t.done || at <= Date.now()) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>Early Access Active</span>
      </div>
    );
  }

  // each tile fills up as its unit runs out (the seconds bar sweeps every minute)
  const units: [string, string, number | null][] = [
    [t.days > 99 ? String(t.days) : pad(t.days), t.days === 1 ? "Day" : "Days", null],
    [pad(t.hours), "Hours", t.ready ? (24 - t.hours) / 24 : 0],
    [pad(t.minutes), "Minutes", t.ready ? (60 - t.minutes) / 60 : 0],
    [pad(t.seconds), "Seconds", t.ready ? (60 - t.seconds) / 60 : 0],
  ];
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes and ${t.seconds} seconds until launch`}
      className={`flex items-start justify-center ${big ? "gap-1.5 text-[clamp(2.4rem,10vw,9.5rem)] sm:gap-4" : "gap-3 text-[26px]"} ${t.ready ? "" : "opacity-0"} transition-opacity duration-500 ${className}`}
    >
      {units.map(([v, l, prog], i) => (
        <div key={l} className="flex shrink-0 items-start">
          <Unit value={v} label={l} big={big} progress={big ? prog : null} />
          {i < units.length - 1 && <span className={`select-none font-mono font-bold text-dim ${big ? "mx-0.5 hidden pt-[0.08em] text-[0.6em] sm:inline [animation:pulse-soft_1s_steps(2)_infinite]" : "mx-0.5"}`}>:</span>}
        </div>
      ))}
    </div>
  );
}
