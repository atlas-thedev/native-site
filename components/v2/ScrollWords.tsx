"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

function Word({ w, i, n, p, hi }: { w: string; i: number; n: number; p: MotionValue<number>; hi: boolean }) {
  const start = i / n;
  const o = useTransform(p, [start - 0.08, start + 0.02], [0.14, 1]);
  return (
    <motion.span style={{ opacity: o }} className={hi ? "v-hi" : undefined}>
      {w}{" "}
    </motion.span>
  );
}

/** A statement that lights up word by word as it scrolls through the screen. */
export default function ScrollWords({ text, highlight = [], className = "" }: { text: string; highlight?: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} w={w} i={i} n={words.length} p={scrollYProgress} hi={highlight.includes(w.replace(/[.,!?]/g, ""))} />
      ))}
    </p>
  );
}
