"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { SortKey } from "@/lib/store";

const OPTIONS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "popular", label: "Most popular" },
  { id: "new", label: "Newest" },
  { id: "name", label: "A–Z" },
];

/** Themed sort dropdown. Replaces the native <select>, whose option list ignores the site palette. */
export default function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const current = OPTIONS.find((o) => o.id === value) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    list.current?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const show = () => {
    setActive(Math.max(0, OPTIONS.findIndex((o) => o.id === value)));
    setOpen(true);
  };
  const pick = (i: number) => {
    onChange(OPTIONS[i].id);
    setOpen(false);
    btn.current?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % OPTIONS.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + OPTIONS.length) % OPTIONS.length); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(OPTIONS.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(active); }
    else if (e.key === "Escape" || e.key === "Tab") { setOpen(false); if (e.key === "Escape") btn.current?.focus(); }
  };

  return (
    <div ref={root} className="relative">
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`Sort cloaks: ${current.label}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); show(); } }}
        className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13.5px] font-medium text-fg transition ${open ? "border-fg bg-surface-2" : "border-line bg-surface hover:bg-surface-2"}`}
      >
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 text-mute transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            style={{ outline: "none" }}
            aria-label="Sort cloaks"
            aria-activedescendant={`${id}-${OPTIONS[active].id}`}
            onKeyDown={onKey}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 min-w-[180px] origin-top-right overflow-hidden rounded-2xl border border-line bg-bg p-1.5 shadow-[0_20px_60px_-20px_var(--shadow)] outline-none"
          >
            {OPTIONS.map((o, i) => {
              const on = o.id === value;
              return (
                <li
                  key={o.id}
                  id={`${id}-${o.id}`}
                  role="option"
                  aria-selected={on}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(i)}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2 text-[13.5px] transition-colors ${i === active ? "bg-surface-2 text-fg" : "text-mute"} ${on ? "font-semibold text-fg" : ""}`}
                >
                  {o.label}
                  {on && <Check className="h-3.5 w-3.5" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
