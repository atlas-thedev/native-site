"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Crown, Gift, Menu, X } from "lucide-react";
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
  { href: "/players", label: "Players" },
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
/** The one filled call to action in the bar (Download, or Claim free cape before launch). */
const primary =
  "nx-cta group inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-inv text-[13px] font-extrabold uppercase tracking-[0.04em] text-inv-fg transition hover:opacity-90 active:scale-[0.98]";

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
        className={`${primary} px-5`}
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

  const account = name ? (
    <Link
      href="/account"
      data-claim-target
      title="Your account"
      className="group hidden h-11 items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-4 text-[14px] font-semibold transition hover:border-fg/30 hover:bg-surface-2 sm:inline-flex"
    >
      <SkinHead skin={me?.skin ?? null} name={name} size={34} className="!rounded-full ring-1 ring-line" />
      <span className="max-w-[8rem] truncate">{name}</span>
    </Link>
  ) : (
    <Link
      href="/login"
      className={`hidden h-11 items-center rounded-full px-4 text-[14.5px] font-semibold text-mute transition hover:bg-surface-2 hover:text-fg sm:inline-flex ${name === undefined ? "opacity-0" : ""}`}
    >
      Sign in
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-xl">
      <nav aria-label="Main" className="flex h-[72px] w-full items-center gap-6 px-5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${site.name} home`}>
          <img src="/brand/icon.png" alt="" width={32} height={32} className="logo-img h-8 w-8" aria-hidden />
          <span className="text-[20px] font-extrabold uppercase tracking-tight">native</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <ul className="mr-1 hidden items-center gap-0.5 xl:flex">
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
              <Link href="/plus" className="nx-plus ml-2 inline-flex h-11 items-center gap-2 rounded-[10px] px-4 text-[13px] font-extrabold uppercase tracking-[0.04em]">
                <Crown className="nx-plus-icon h-4 w-4" />
                Native+
              </Link>
            </li>
          </ul>

          <div className="hidden xl:block">
            {gift ? (
              <Link href={giftCta.href} className={`${primary} btn-shine gap-2.5 pl-1.5 pr-4`}>
                <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-inv-fg/10">
                  <Gift className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
                </span>
                <span className="whitespace-nowrap">{giftCta.label}</span>
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
            <ul className="space-y-1 px-5 py-4 lg:px-8">
              {[
                ...nav,
                { href: "/plus", label: "Native+" },
                { href: gift ? giftCta.href : "/download", label: gift ? giftCta.label : "Download" },
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
