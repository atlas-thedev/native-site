"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Gift, Menu, Shield, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../app/redesign.css";
import { useAccount } from "./useAccount";
import { useLaunch } from "./launch/LaunchContext";
import { site } from "@/lib/site";
import { Apple, Discord, Linux, Windows } from "./icons";
import ThemeToggle from "./ThemeToggle";
import SkinHead from "./SkinHead";

const nav = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/capes", label: "Capes" },
  { href: "/beta", label: "Beta" },
  { href: "/changes", label: "Changes" },
  { href: "/support", label: "Support" },
];

const getLinks = [
  { label: "Windows", sub: "Installer · x64", href: "/api/download/windows", Icon: Windows },
  { label: "macOS", sub: "Apple Silicon", href: "/api/download/mac", Icon: Apple },
  { label: "macOS", sub: "Intel", href: "/api/download/mac?arch=x64", Icon: Apple },
  { label: "Linux", sub: "AppImage · .deb", href: "/api/download/linux", Icon: Linux },
];

/** Square-ish bordered control, used for every boxed item in the bar. */
const box =
  "nx-box inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-line bg-surface text-[13px] font-extrabold uppercase tracking-[0.04em] transition hover:bg-surface-2";

function DownloadMenu() {
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${box} px-6`}
      >
        Download
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="nx-menu absolute right-0 top-[calc(100%+10px)] w-[260px] !rounded-[12px] p-2"
          >
            {getLinks.map(({ label, sub, href, Icon }) => (
              <a
                key={href}
                role="menuitem"
                href={href}
                download=""
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-surface-2"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[14px] font-bold">{label}</span>
                  <span className="text-[12.5px] text-dim">{sub}</span>
                </span>
              </a>
            ))}
            <Link
              href="/download"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-lg border-t border-line px-3 pb-2 pt-3 text-[13px] text-mute transition hover:text-fg"
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

  const account = (
    <Link
      href={name ? "/account" : "/login"}
      data-claim-target={name ? true : undefined}
      title={name ? "Your account" : "Sign in"}
      className={`nx-box hidden h-11 min-w-[190px] items-center gap-3 rounded-[10px] border border-line bg-surface px-3.5 text-left transition hover:bg-surface-2 sm:flex ${name === undefined ? "opacity-0" : ""}`}
    >
      {name ? (
        <SkinHead skin={me?.skin ?? null} name={name} size={24} className="!rounded-md ring-1 ring-line" />
      ) : (
        <User className="h-[17px] w-[17px]" />
      )}
      <span className="flex min-w-0 flex-1 flex-col leading-[1.2]">
        <span className="truncate text-[13px] font-bold">{name ?? "Login"}</span>
        <span className="truncate text-[12px] text-dim">{name ? "Your locker and account" : "Account and orders"}</span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-dim" />
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-6 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${site.name} home`}>
          <img src="/brand/icon.png" alt="" width={32} height={32} className="logo-img h-8 w-8" aria-hidden />
          <span className="text-[20px] font-extrabold uppercase tracking-tight">native</span>
        </Link>

        <div className="flex items-center gap-2">
          <ul className="mr-2 hidden items-center gap-1 xl:flex">
            {nav.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-[10px] px-3.5 py-3 text-[13px] font-extrabold uppercase tracking-[0.04em] transition-colors hover:text-mute"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/plus" className={`${box} px-5 text-gold`}>
                Native+
              </Link>
            </li>
          </ul>

          <div className="hidden xl:block">
            {gift ? (
              <Link href={giftCta.href} className={`${box} btn-shine gap-2.5 px-5`}>
                <Gift className="h-4 w-4" /> {giftCta.label}
              </Link>
            ) : (
              <DownloadMenu />
            )}
          </div>

          <div className="hidden xl:block">
            <div className={`${box} w-11`}>
              <ThemeToggle />
            </div>
          </div>
          {me?.isAdmin && (
            <Link href="/admin" aria-label="Admin dashboard" title="Admin dashboard" className={`${box} hidden w-11 sm:inline-flex`}>
              <Shield className="h-[17px] w-[17px]" />
            </Link>
          )}
          <a href={site.discord} target="_blank" rel="noreferrer" aria-label="Discord" className={`${box} hidden w-11 2xl:inline-flex`}>
            <Discord className="h-[17px] w-[17px]" />
          </a>
          {account}
          <button
            data-claim-target
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`${box} w-11 xl:hidden`}
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
            className="overflow-hidden border-t border-line xl:hidden"
          >
            <ul className="mx-auto max-w-[1280px] space-y-1 px-5 py-4">
              {[
                ...nav,
                { href: "/plus", label: "Native+" },
                { href: gift ? giftCta.href : "/download", label: gift ? giftCta.label : "Download" },
                ...(me?.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
                name ? { href: "/account", label: "Account" } : { href: "/login", label: "Sign in" },
              ].map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-[10px] px-4 py-3 text-[15px] font-extrabold uppercase tracking-[0.04em] hover:bg-surface-2"
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
