"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useCountdown } from "./LaunchContext";

const pad = (n: number) => String(n).padStart(2, "0");

/** One split-flap digit: the old one folds down, the new one drops in. */
function Flap({ ch }: { ch: string }) {
  return (
    <span className="relative flex h-[1.18em] w-[0.72em] items-center justify-center overflow-hidden rounded-[0.14em] border border-line bg-[linear-gradient(180deg,var(--surface-2)_0%,var(--surface-2)_50%,var(--surface)_50%,var(--surface)_100%)] [perspective:400px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={ch}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.3, 0.7, 0.2, 1] }}
          className="block origin-center leading-none [backface-visibility:hidden]"
        >
          {ch}
        </motion.span>
      </AnimatePresence>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-bg/80" />
    </span>
  );
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="flex gap-[0.06em] font-mono font-extrabold tabular-nums tracking-[-0.04em]">
        {value.split("").map((c, i) => <Flap key={i} ch={c} />)}
      </span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-dim">{label}</span>
    </div>
  );
}

/** The hero's launch clock: split-flap tiles, a ticking minute bar and the launch moment in the visitor's time. */
export default function LaunchClock({ at }: { at: number }) {
  const t = useCountdown(at);
  const [when, setWhen] = useState("");
  useEffect(() => {
    const d = new Date(at);
    setWhen(`${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`);
  }, [at]);
  const units: [string, string][] = [
    [t.days > 99 ? String(t.days) : pad(t.days), t.days === 1 ? "Day" : "Days"],
    [pad(t.hours), "Hours"],
    [pad(t.minutes), "Mins"],
    [pad(t.seconds), "Secs"],
  ];
  return (
    <div className="relative w-full overflow-hidden rounded-[24px] border border-line bg-bg/75 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-mute">
          <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" /><span className="relative h-2 w-2 rounded-full bg-emerald-400" /></span>
          T-minus
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim" suppressHydrationWarning>{when}</span>
      </div>
      <div
        role="timer"
        aria-live="off"
        aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes and ${t.seconds} seconds until launch`}
        className={`flex items-start justify-center gap-2 px-4 pb-6 pt-7 text-[clamp(1.7rem,7.4vw,3.4rem)] sm:gap-4 lg:text-[clamp(2rem,3.6vw,3.4rem)] ${t.ready ? "" : "opacity-0"} transition-opacity duration-500`}
      >
        {units.map(([v, l], i) => (
          <div key={l} className="flex items-start gap-2 sm:gap-4">
            <Unit value={v} label={l} />
            {i < units.length - 1 && <span aria-hidden className="select-none pt-[0.18em] font-mono text-[0.5em] font-bold text-dim [animation:pulse-soft_1s_steps(2)_infinite]">:</span>}
          </div>
        ))}
      </div>
      {/* this minute, filling up second by second */}
      <div className="h-1 w-full bg-surface">
        <div className="h-full bg-fg/80 transition-[width] duration-1000 ease-linear" style={{ width: `${t.ready ? ((60 - t.seconds) / 60) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
