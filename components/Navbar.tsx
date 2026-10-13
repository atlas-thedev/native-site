"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Crown, Gift } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../app/redesign.css";
import { usePathname } from "next/navigation";
import { useAccount } from "./useAccount";
import { useLaunch } from "./launch/LaunchContext";
import { site } from "@/lib/site";
import { Apple, Discord, Linux, Windows } from "./icons";
import ThemeToggle from "./ThemeToggle";
import SkinHead from "./SkinHead";
import CommandSearch from "./search/CommandSearch";

const nav = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store" },
  { href: "/skins", label: "Skins" },
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
  const { launch, theme } = useLaunch();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 240 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    const l = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    document.documentElement.classList.toggle("v-menu-open", open);
    if (open) l?.stop();
    else l?.start();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  const gift = launch.lockDownloads;
  const giftCta = {
    href: name ? "/founder" : "/register?next=/founder",
    label: name ? "Claim free cape" : "Join early",
  };
  const isOn = (href: string) => (href === "/" ? path === "/" : path?.startsWith(href));

  const account = name ? (
    <Link href="/account" data-claim-target title="Your account" className="v-nav-acct hidden sm:inline-flex">
      <SkinHead skin={me?.skin ?? null} name={name} size={30} className="!rounded-[8px]" />
      <span className="max-w-[8rem] truncate">{name}</span>
    </Link>
  ) : (
    <Link href="/login" className={`v-nav-link hidden sm:inline-flex ${name === undefined ? "opacity-0" : ""}`}>
      Sign in
    </Link>
  );

  const menuLinks = [
    ...nav,
    { href: "/plus", label: "Native+" },
    { href: "/cloaks", label: "Cloaks" },
    { href: "/cosmetics", label: "Cosmetics" },
    { href: "/vote", label: "Vote" },
  ];

  return (
    <>
      <header className={`v-nav ${scrolled ? "is-scrolled" : ""} ${hidden && !open ? "is-hidden" : ""} ${open ? "is-open" : ""}`}>
        <nav aria-label="Main" className="v-nav-inner">
          <Link href="/" className="v-nav-brand" aria-label={`${site.name} home`}>
            <img src="/brand/icon.png" alt="" width={30} height={30} className="logo-img h-[30px] w-[30px]" aria-hidden />
            <span>native</span>
          </Link>

          <ul className="v-nav-links">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`v-nav-link ${isOn(l.href) ? "is-on" : ""}`}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/plus" className="nx-plus v-nav-plus">
                <Crown className="nx-plus-icon h-3.5 w-3.5" />
                Native+
              </Link>
            </li>
          </ul>

          <div className="v-nav-right">
            <CommandSearch className="w-11 justify-center lg:w-auto" />
            <div className="hidden xl:block">
              {gift ? (
                <Link href={giftCta.href} className={`${primary} btn-shine gap-2.5 pl-1.5 pr-4`}>
                  <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-inv-fg/10">
                    <Gift className="h-4 w-4" />
                  </span>
                  <span className="whitespace-nowrap">{giftCta.label}</span>
                </Link>
              ) : (
                <DownloadMenu />
              )}
            </div>
            {!theme?.halloween && (
              <div className="hidden xl:block" data-theme-control>
                <div className={`${box} w-11`}><ThemeToggle /></div>
              </div>
            )}
            {account}
            <button
              data-claim-target
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="v-burger xl:hidden"
            >
              <span className="v-burger-txt">{open ? "Close" : "Menu"}</span>
              <span className="v-burger-lines" aria-hidden><i /><i /></span>
            </button>
          </div>
        </nav>
      </header>
      <div className="v-nav-spacer" aria-hidden />

      <AnimatePresence>
        {open && (
          <motion.div
            className="v-menu xl:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="v-menu-list">
              {menuLinks.map((l, i) => (
                <li key={l.href + l.label} className="overflow-hidden">
                  <motion.div initial={{ y: "110%" }} animate={{ y: "0%" }} exit={{ y: "110%" }} transition={{ duration: 0.7, delay: 0.15 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={l.href} onClick={() => setOpen(false)} className={`v-menu-link ${isOn(l.href) ? "is-on" : ""}`}>
                      <span className="v-menu-i">{String(i + 1).padStart(2, "0")}</span>
                      {l.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div className="v-menu-foot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
              <Link href={gift ? giftCta.href : "/download"} onClick={() => setOpen(false)} className="v-btn is-solid">
                {gift ? giftCta.label : "Download"}
              </Link>
              <Link href={name ? "/account" : "/login"} onClick={() => setOpen(false)} className="v-btn">
                {name ? "Your account" : "Sign in"}
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <a href={site.discord} target="_blank" rel="noreferrer" aria-label="Discord" className={`${box} w-11`}><Discord className="h-[17px] w-[17px]" /></a>
                {!theme?.halloween && <div className={`${box} w-11`} data-theme-control><ThemeToggle /></div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
