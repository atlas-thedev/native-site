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

function Unit({ value, label, big }: { value: string; label: string; big: boolean }) {
  return (
    <div className={`flex flex-col items-center ${big ? "rounded-[28px] border border-line bg-bg/70 px-2 pb-3 pt-3 backdrop-blur-sm sm:px-5 sm:pb-5 sm:pt-4" : ""}`}>
      <span className="inline-flex whitespace-nowrap font-mono font-extrabold leading-none tabular-nums tracking-[-0.06em]">
        {value.split("").map((c, i) => <Digit key={i} ch={c} big={big} />)}
      </span>
      <span className={`mt-2 font-mono uppercase text-dim ${big ? "text-[9px] tracking-[0.18em] sm:text-[12.5px] sm:tracking-[0.28em]" : "text-[10px] tracking-[0.2em]"}`}>{label}</span>
    </div>
  );
}

/** Days / hours / minutes / seconds to `at`. `size="hero"` is the giant one. */
export default function Countdown({ at, size = "hero", className = "" }: { at: number; size?: "hero" | "sm"; className?: string }) {
  const t = useCountdown(at);
  const big = size === "hero";
  const units: [string, string][] = [
    [t.days > 99 ? String(t.days) : pad(t.days), t.days === 1 ? "Day" : "Days"],
    [pad(t.hours), "Hours"],
    [pad(t.minutes), "Minutes"],
    [pad(t.seconds), "Seconds"],
  ];
  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes and ${t.seconds} seconds until launch`}
      className={`flex items-start justify-center ${big ? "gap-1.5 text-[clamp(2.4rem,10vw,9.5rem)] sm:gap-4" : "gap-3 text-[26px]"} ${t.ready ? "" : "opacity-0"} transition-opacity duration-500 ${className}`}
    >
      {units.map(([v, l], i) => (
        <div key={l} className="flex shrink-0 items-start">
          <Unit value={v} label={l} big={big} />
          {i < units.length - 1 && <span className={`select-none font-mono font-bold text-dim ${big ? "mx-0.5 hidden pt-[0.08em] text-[0.6em] sm:inline [animation:pulse-soft_1s_steps(2)_infinite]" : "mx-0.5"}`}>:</span>}
        </div>
      ))}
    </div>
  );
}
