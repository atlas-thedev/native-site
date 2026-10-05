"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowRight, Gift, Menu, Shield, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "./useAccount";
import { useLaunch } from "./launch/LaunchContext";
import { nav, site } from "@/lib/site";
import { Discord, YouTube } from "./icons";
import ThemeToggle from "./ThemeToggle";
import SkinHead from "./SkinHead";

export default function Navbar() {
  const { scrollYProgress } = useScroll();
  const prog = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const me = useAccount();
  const name = me === undefined ? undefined : (me?.name ?? null);
  const { launch } = useLaunch();
  const [open, setOpen] = useState(false);

  const gift = launch.lockDownloads;
  const cta = gift
    ? {
        href: name ? "/founder" : "/register?next=/founder",
        label: name ? "Claim free cape" : "Join early",
      }
    : { href: "/download", label: "Download" };

  const account = name ? (
    <Link
      href="/account"
      data-claim-target
      title="Your account"
      className="group hidden h-10 items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3.5 text-[14px] font-semibold transition hover:border-fg/30 hover:bg-surface-2 sm:inline-flex"
    >
      <SkinHead skin={me?.skin ?? null} name={name} size={30} className="!rounded-full ring-1 ring-line" />
      <span className="max-w-[7.5rem] truncate">{name}</span>
    </Link>
  ) : (
    <Link
      href="/login"
      className={`hidden h-10 items-center rounded-full px-4 text-[14.5px] font-medium text-mute transition hover:bg-surface-2 hover:text-fg sm:inline-flex ${name === undefined ? "opacity-0" : ""}`}
    >
      Sign in
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
      <nav
        aria-label="Main"
        className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5"
      >
        <div className="flex items-center gap-9">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${site.name} home`}
          >
            <img
              src="/brand/icon.png"
              alt=""
              width={28}
              height={28}
              className="logo-img h-7 w-7"
              aria-hidden
            />
            <span className="text-[19px] font-extrabold tracking-tight">
              native
            </span>
          </Link>
          <ul className="hidden items-center gap-0.5 lg:flex">
            {nav.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-[14.5px] font-medium text-mute transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={site.discord}
            target="_blank"
            rel="noreferrer"
            aria-label="Discord"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-mute transition hover:bg-surface-2 hover:text-fg lg:flex"
          >
            <Discord className="h-[18px] w-[18px]" />
          </a>
          <a
            href={site.youtube}
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-mute transition hover:bg-surface-2 hover:text-fg lg:flex"
          >
            <YouTube className="h-[20px] w-[20px]" />
          </a>
          <ThemeToggle />
          {me?.isAdmin && (
            <Link
              href="/admin"
              aria-label="Admin dashboard"
              title="Admin dashboard"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-mute transition hover:bg-surface-2 hover:text-fg sm:flex"
            >
              <Shield className="h-[18px] w-[18px]" />
            </Link>
          )}
          {account}
          <Link
            href={cta.href}
            className={`group ml-1 inline-flex h-10 items-center gap-2 rounded-full bg-inv text-[14.5px] font-semibold text-inv-fg transition hover:opacity-90 active:scale-95 ${gift ? "btn-shine pl-1.5 pr-4" : "px-5"}`}
          >
            {gift && (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-inv-fg/10">
                <Gift className="h-[15px] w-[15px] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
              </span>
            )}
            <span className="whitespace-nowrap">{cta.label}</span>
            {!gift && <ArrowRight className="-mr-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
          </Link>
          <button
            data-claim-target
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full text-fg transition hover:bg-surface-2 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <ul className="mx-auto max-w-[1280px] space-y-1 px-5 py-4">
              {[
                ...nav,
                ...(me?.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
                name
                  ? { href: "/account", label: "Account" }
                  : { href: "/login", label: "Sign in" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-[17px] font-semibold hover:bg-surface-2"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ scaleX: prog }}
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-fg"
      />
    </header>
  );
}
