"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";

export type PxVariant = "light" | "green" | "gold" | "ghost" | "danger" | "locked";
export type PxSize = "sm" | "md" | "xl";

const cls = (variant: PxVariant, size: PxSize, icon?: boolean, on?: boolean, extra?: string) =>
  ["pxb", variant !== "light" && `is-${variant}`, size !== "md" && `is-${size}`, icon && "is-icon", on && "is-on", extra].filter(Boolean).join(" ");

type Common = { variant?: PxVariant; size?: PxSize; icon?: boolean; on?: boolean; className?: string; children: ReactNode };

/** A launcher-style pixel slab button: a textured face that presses into a darker base. */
export function PxButton({ variant = "light", size = "md", icon, on, className, children, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} className={cls(variant, size, icon, on, className)}>
      <span className="pxb-face">{children}</span>
    </button>
  );
}

export function PxLink({ variant = "light", size = "md", icon, on, className, children, href, title }: Common & { href: string; title?: string }) {
  return (
    <Link href={href} title={title} className={cls(variant, size, icon, on, className)}>
      <span className="pxb-face">{children}</span>
    </Link>
  );
}

export type ToastMsg = { t: "ok" | "err"; s: string } | null;

/** One toast at a time, bottom centre; it clears itself after a few seconds. */
export function Toast({ msg, onDone }: { msg: ToastMsg; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(onDone, msg.t === "err" ? 5200 : 3800);
    return () => clearTimeout(id);
  }, [msg, onDone]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <AnimatePresence mode="wait">
        {msg && (
          <motion.div key={msg.s} role={msg.t === "err" ? "alert" : "status"} initial={{ opacity: 0, y: 28, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }} transition={{ type: "spring", stiffness: 460, damping: 30 }}
            className="px-toast pointer-events-auto">
            <span className={`px-toast-mark ${msg.t === "err" ? "is-err" : "is-ok"}`} aria-hidden>{msg.t === "err" ? <X className="h-4 w-4" strokeWidth={3} /> : <Check className="h-4 w-4" strokeWidth={3} />}</span>
            <span className="min-w-0 flex-1">{msg.s}</span>
            <button onClick={onDone} aria-label="Dismiss" className="-mr-1 flex h-7 w-7 flex-none items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
