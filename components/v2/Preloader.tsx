"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** First visit of a session: a counter runs to 100 while the wordmark rises, then the curtain lifts. */
export default function Preloader() {
  const [show, setShow] = useState(true);
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("nx-intro") === "1";
      sessionStorage.setItem("nx-intro", "1");
    } catch {}
    if (reduce || seen) {
      setShow(false);
      window.dispatchEvent(new Event("nx:ready"));
      (window as unknown as { __nxReady?: boolean }).__nxReady = true;
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          setShow(false);
          document.documentElement.style.overflow = "";
          (window as unknown as { __nxReady?: boolean }).__nxReady = true;
          window.dispatchEvent(new Event("nx:ready"));
        }, 220);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="pre"
          className="v-pre"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="v-pre-word">
            {"NATIVE".split("").map((c, i) => (
              <motion.span key={i} initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}>
                {c}
              </motion.span>
            ))}
          </div>
          <div className="v-pre-foot">
            <span>Minecraft, launched beautifully</span>
            <span className="v-pre-n">{String(n).padStart(3, "0")}</span>
          </div>
          <div className="v-pre-bar"><i style={{ transform: `scaleX(${n / 100})` }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** True once the preloader is gone (or was skipped). */
export function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if ((window as unknown as { __nxReady?: boolean }).__nxReady) return setReady(true);
    const on = () => setReady(true);
    window.addEventListener("nx:ready", on);
    const t = setTimeout(on, 2600);
    return () => {
      window.removeEventListener("nx:ready", on);
      clearTimeout(t);
    };
  }, []);
  return ready;
}
