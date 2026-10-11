"use client";

import { useEffect, useRef } from "react";

/** A small dot that trails the pointer and swells over anything clickable. Fine pointers only. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = dot.current;
    if (!el) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
      const t = e.target as HTMLElement | null;
      const hot = t?.closest?.("a, button, [role=button], input, textarea, select, label, summary, [data-cursor]");
      const label = t?.closest?.("[data-cursor]")?.getAttribute("data-cursor") || "";
      el.dataset.hot = hot ? (label ? "label" : "1") : "";
      el.dataset.label = label;
      const lab = el.firstElementChild as HTMLElement | null;
      if (lab && lab.textContent !== label) lab.textContent = label;
      const text = t?.closest?.("input, textarea, [contenteditable=true]");
      el.dataset.text = text ? "1" : "";
    };
    const leave = () => (el.style.opacity = "0");
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);
  return (
    <div ref={dot} className="v-cursor" aria-hidden>
      <span className="v-cursor-label" />
    </div>
  );
}
