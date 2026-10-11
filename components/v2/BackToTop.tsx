"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const up = () => {
    const l = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (l) l.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button onClick={up} aria-label="Back to top" className="v-top">
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
