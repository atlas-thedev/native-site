"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";

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

/* ---------- tabs: the launcher Locker's sliding pixel slab (squash & stretch, pixel poof) ---------- */

export type PxTab = { id: string; label: ReactNode; icon?: ReactNode; count?: number | null; title?: string };

const reducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Segmented pixel tabs: a textured slab slides to the picked tab and squashes on the way, with a tiny pixel poof. */
export function PxTabs({ items, value, onChange, size = "md", fill = false, className = "", label = "Tabs" }: { items: PxTab[]; value: string; onChange?: (id: string) => void; size?: "sm" | "md"; fill?: boolean; className?: string; label?: string }) {
  const root = useRef<HTMLDivElement | null>(null);
  const tabs = useRef(new Map<string, HTMLButtonElement>());
  const [slab, setSlab] = useState({ x: 0, w: 0, shown: false });
  const [motionKind, setMotionKind] = useState<null | "moving" | "nudge">(null);
  const [bursts, setBursts] = useState<{ key: number; x: number; y: number; pieces: { dx: number; dy: number; size: number; delay: number }[] }[]>([]);
  const burstId = useRef(0);

  const measure = useCallback(() => {
    const el = tabs.current.get(value);
    if (!el || !root.current) { setSlab((s) => ({ ...s, shown: false })); return; }
    setSlab({ x: el.offsetLeft, w: el.offsetWidth, shown: true });
    // a strip that scrolls sideways keeps the picked tab in view
    const box = root.current;
    if (box.scrollWidth > box.clientWidth + 1) {
      const left = el.offsetLeft - 8;
      const right = el.offsetLeft + el.offsetWidth + 8 - box.clientWidth;
      if (box.scrollLeft > left) box.scrollTo({ left, behavior: "smooth" });
      else if (box.scrollLeft < right) box.scrollTo({ left: right, behavior: "smooth" });
    }
  }, [value]);
  const shape = items.map((it) => `${it.id}:${it.count ?? ""}`).join("|");
  useLayoutEffect(() => { measure(); }, [measure, shape]);
  useLayoutEffect(() => {
    if (!root.current || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root.current);
    // web fonts change tab widths once they load
    document.fonts?.ready.then(() => measure()).catch(() => {});
    return () => ro.disconnect();
  }, [measure]);

  const poof = (event: ReactMouseEvent | null) => {
    const host = root.current;
    if (!host || reducedMotion()) return;
    const rect = host.getBoundingClientRect();
    const x = (event?.clientX || rect.left + rect.width / 2) - rect.left + host.scrollLeft;
    const y = (event?.clientY || rect.top + rect.height / 2) - rect.top;
    const count = size === "sm" ? 8 : 12;
    const key = ++burstId.current;
    const pieces = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 22 + Math.random() * 30;
      return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist * 0.7 - 10, size: 3 + Math.round(Math.random() * 3), delay: Math.random() * 60 };
    });
    setBursts((list) => [...list, { key, x, y, pieces }]);
    setTimeout(() => setBursts((list) => list.filter((b) => b.key !== key)), 900);
  };
  const choose = (id: string, event: ReactMouseEvent | null) => {
    if (id === value) { setMotionKind(null); requestAnimationFrame(() => setMotionKind("nudge")); return; }
    setMotionKind("moving");
    poof(event);
    onChange?.(id);
  };
  const onKey = (event: ReactKeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const at = items.findIndex((it) => it.id === value);
    const next = items[(at + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length];
    if (next) { choose(next.id, null); tabs.current.get(next.id)?.focus(); }
  };
  return (
    <div ref={root} className={`pxt${size === "sm" ? " is-sm" : ""}${fill ? " is-fill" : ""} ${className}`.trim()} role="tablist" aria-label={label} onKeyDown={onKey}>
      <span className={`pxt-slab${slab.shown ? "" : " is-hidden"}${motionKind ? ` is-${motionKind}` : ""}`} style={{ "--pxt-x": `${slab.x}px`, "--pxt-w": `${slab.w}px` } as CSSProperties} onAnimationEnd={() => setMotionKind(null)} aria-hidden />
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            ref={(node) => { if (node) tabs.current.set(it.id, node); else tabs.current.delete(it.id); }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            title={it.title}
            className={`pxt-tab${active ? " is-active" : ""}`}
            onClick={(event) => choose(it.id, event)}
          >
            <span className="pxt-tab-inner">
              {it.icon ? <span className="pxt-icon">{it.icon}</span> : null}
              <span className="pxt-label">{it.label}</span>
              {it.count != null && <span className="pxt-count">{it.count}</span>}
            </span>
          </button>
        );
      })}
      {bursts.map((b) => (
        <span key={b.key} className="px-burst" style={{ left: b.x, top: b.y }} aria-hidden>
          {b.pieces.map((p, i) => <i key={i} style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--s": `${p.size}px`, animationDelay: `${p.delay}ms` } as CSSProperties} />)}
        </span>
      ))}
    </div>
  );
}
