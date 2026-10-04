"use client";

import { motion, useInView } from "motion/react";
import { createElement, useRef } from "react";

type Props = {
  text: string;
  className?: string;
  accent?: string[];
  accentClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  once?: boolean;
};

export default function SplitText({
  text,
  className,
  accent = [],
  accentClassName = "text-mute",
  delay = 0,
  stagger = 0.07,
  as = "h2",
  once = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const words = text.split(" ");
  const children = words.map((word, i) => {
    const clean = word.replace(/[.,!?]/g, "");
    const isAccent = accent.includes(clean);
    return (
      <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
        <motion.span
          className={`inline-block will-change-transform ${isAccent ? accentClassName : ""}`}
          initial={{ y: "115%", rotate: 4, opacity: 0 }}
          animate={inView ? { y: "0%", rotate: 0, opacity: 1 } : { y: "115%", rotate: 4, opacity: 0 }}
          transition={{ duration: 1, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
        >
          {word}
        </motion.span>
        {i < words.length - 1 ? "\u00A0" : ""}
      </span>
    );
  });
  return createElement(as, { ref, className, "aria-label": text }, children);
}
