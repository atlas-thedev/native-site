"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { Discord, YouTube } from "./icons";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { scrollYProgress } = useScroll();
  const prog = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const [name, setName] = useState<string | null | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dead = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => !dead && setName(d?.account?.name ?? null))
      .catch(() => !dead && setName(null));
    return () => {
      dead = true;
    };
  }, []);

  const account = name ? (
    <Link href="/account" className="hidden h-10 items-center gap-2 rounded-full border border-line px-4 text-[14.5px] font-semibold transition hover:bg-surface-2 sm:inline-flex">
      <User className="h-4 w-4" /> {name}
    </Link>
  ) : (
    <Link href="/login" className={`hidden h-10 items-center rounded-full px-4 text-[14.5px] font-medium text-mute transition hover:bg-surface-2 hover:text-fg sm:inline-flex ${name === undefined ? "opacity-0" : ""}`}>
      Sign in
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5">
        <div className="flex items-center gap-9">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
            <span className="logo-mark h-7 w-7" aria-hidden />
            <span className="text-[19px] font-extrabold tracking-tight">native</span>
          </Link>
          <ul className="hidden items-center gap-1 md:flex">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-full px-4 py-2 text-[14.5px] font-medium text-mute transition-colors hover:bg-surface-2 hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-1.5">
          <a href={site.discord} target="_blank" rel="noreferrer" aria-label="Discord" className="hidden h-10 w-10 items-center justify-center rounded-full text-mute transition hover:bg-surface-2 hover:text-fg lg:flex">
            <Discord className="h-[18px] w-[18px]" />
          </a>
          <a href={site.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="hidden h-10 w-10 items-center justify-center rounded-full text-mute transition hover:bg-surface-2 hover:text-fg lg:flex">
            <YouTube className="h-[20px] w-[20px]" />
          </a>
          <ThemeToggle />
          {account}
          <Link href="/download" className="ml-1 inline-flex h-10 items-center rounded-full bg-inv px-5 text-[14.5px] font-semibold text-inv-fg transition hover:opacity-85 active:scale-95">
            Download
          </Link>
          <button onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="flex h-10 w-10 items-center justify-center rounded-full text-fg transition hover:bg-surface-2 md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden border-t border-line md:hidden">
            <ul className="mx-auto max-w-[1280px] space-y-1 px-5 py-4">
              {[...nav, name ? { href: "/account", label: "Account" } : { href: "/login", label: "Sign in" }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-[17px] font-semibold hover:bg-surface-2">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div style={{ scaleX: prog }} className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-fg" />
    </header>
  );
}
