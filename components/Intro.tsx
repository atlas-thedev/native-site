"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { INTRO } from "@/lib/site";

/** Short brand intro: mark pops in, line fills, curtain lifts. Skipped for reduced motion. */
export default function Intro() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(false);
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => {
      setShow(false);
      document.documentElement.style.overflow = "";
    }, INTRO * 1000 + 250);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg text-fg"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.img
            src="/brand/icon.png"
            alt=""
            width={96}
            height={96}
            className="logo-img h-24 w-24"
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
          />
          <div className="mt-8 h-[2px] w-40 overflow-hidden rounded-full bg-line">
            <motion.div className="h-full bg-fg" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: INTRO, ease: [0.65, 0, 0.35, 1] }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
