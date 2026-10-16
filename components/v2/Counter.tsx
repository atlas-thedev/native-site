"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `to` the first time it scrolls into view. It renders the real number first (server HTML,
 * no JS, reduced motion), and an interrupted count always lands on `to`, never on a partial value.
 */
export default function Counter({ to, suffix = "", className = "", duration = 1.6 }: { to: number; suffix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [v, setV] = useState(to);
  const played = useRef(false);

  useEffect(() => {
    if (!inView || played.current) {
      setV(to);
      return;
    }
    played.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => { c.stop(); setV(to); };
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}
