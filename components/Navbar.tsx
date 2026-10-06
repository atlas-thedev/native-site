"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Gift, Menu, Shield, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../app/redesign.css";
import { useAccount } from "./useAccount";
import { useLaunch } from "./launch/LaunchContext";
import { site } from "@/lib/site";
import { Apple, Discord, Linux, Windows, YouTube } from "./icons";
import ThemeToggle from "./ThemeToggle";
import SkinHead from "./SkinHead";

const nav = [
  { href: "/#launcher", label: "The launcher" },
  { href: "/#features", label: "Features" },
  { href: "/capes", label: "Capes" },
  { href: "/beta", label: "Beta" },
  { href: "/changes", label: "Changes" },
  { href: "/support", label: "Support" },
  { href: "/plus", label: "Native+" },
];

const getLinks = [
  { label: "Windows", sub: "Installer · x64", href: "/api/download/windows", Icon: Windows },
  { label: "macOS", sub: "Apple Silicon", href: "/api/download/mac", Icon: Apple },
  { label: "macOS", sub: "Intel", href: "/api/download/mac?arch=x64", Icon: Apple },
  { label: "Linux", sub: "AppImage · .deb", href: "/api/download/linux", Icon: Linux },
];

function GetMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="nx-pill nx-pill-ghost h-10 pl-4 pr-3 text-[14.5px]"
      >
        Get Native
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="nx-menu absolute right-0 top-[calc(100%+10px)] w-[260px] p-2"
          >
            {getLinks.map(({ label, sub, href, Icon }) => (
              <a
                key={href}
                role="menuitem"
                href={href}
                download=""
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-2"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[14.5px] font-semibold">{label}</span>
                  <span className="text-[12.5px] text-dim">{sub}</span>
                </span>
              </a>
            ))}
            <Link
              href="/download"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl border-t border-line px-3 pb-2 pt-3 text-[13px] text-mute transition hover:text-fg"
            >
              All downloads and release notes →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const me = useAccount();
  const name = me === undefined ? undefined : (me?.name ?? null);
  const { launch } = useLaunch();
  const [open, setOpen] = useState(false);

  const gift = launch.lockDownloads;
  const giftCta = {
    href: name ? "/founder" : "/register?next=/founder",
    label: name ? "Claim free cape" : "Join early",
  };

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
      className={`nx-pill nx-pill-accent hidden h-10 px-5 text-[14.5px] sm:inline-flex ${name === undefined ? "opacity-0" : ""}`}
    >
      Sign in
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-7">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${site.name} home`}>
            <img src="/brand/icon.png" alt="" width={28} height={28} className="logo-img h-7 w-7" aria-hidden />
            <span className="text-[19px] font-extrabold tracking-tight">native</span>
          </Link>
          <ul className="hidden items-center gap-0.5 lg:flex">
            {nav.map((l) => {
              const plus = l.href === "/plus";
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={
                      plus
                        ? "ml-1 inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1.5 text-[14px] font-semibold text-gold transition hover:bg-surface-2"
                        : "rounded-full px-3 py-2 text-[14.5px] font-medium text-mute transition-colors hover:bg-surface-2 hover:text-fg"
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={site.discord}
            target="_blank"
            rel="noreferrer"
            aria-label="Discord"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-mute transition hover:bg-surface-2 hover:text-fg xl:flex"
          >
            <Discord className="h-[18px] w-[18px]" />
          </a>
          <a
            href={site.youtube}
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-mute transition hover:bg-surface-2 hover:text-fg xl:flex"
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
          {gift ? (
            <Link
              href={giftCta.href}
              className="group btn-shine nx-pill nx-pill-ghost h-10 pl-1.5 pr-4 text-[14.5px]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2">
                <Gift className="h-[15px] w-[15px] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
              </span>
              {giftCta.label}
            </Link>
          ) : (
            <GetMenu />
          )}
          {account}
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
                { href: gift ? giftCta.href : "/download", label: gift ? giftCta.label : "Download" },
                ...(me?.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
                name ? { href: "/account", label: "Account" } : { href: "/login", label: "Sign in" },
              ].map((l) => (
                <li key={l.href + l.label}>
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
    </header>
  );
}
