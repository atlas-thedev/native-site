"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Counts up to `to` the first time it scrolls into view. */
export default function Counter({ to, suffix = "", className = "", duration = 1.6 }: { to: number; suffix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [v, setV] = useState(to);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!inView || hasAnimated) return;
    setHasAnimated(true);
    const c = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to, duration, hasAnimated]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}
