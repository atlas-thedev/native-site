"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Crown, Gift, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../app/redesign.css";
import { usePathname } from "next/navigation";
import { useAccount } from "./useAccount";
import { useLaunch } from "./launch/LaunchContext";
import { site } from "@/lib/site";
import { Apple, Discord, Linux, Windows } from "./icons";
import ThemeToggle from "./ThemeToggle";
import { HalloweenSpiders } from "./Halloween";
import SkinHead from "./SkinHead";
import CommandSearch, { openSearch } from "./search/CommandSearch";
import { MENU_GROUPS, NAV, isGroup, onPage, type NavPage } from "@/lib/navLinks";

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

/** A navbar link that opens a small menu of pages: on hover, on click and from the keyboard. */
function NavGroup({ label, items, active, hovered, onHover }: { label: string; items: NavPage[]; active: boolean; hovered: boolean; onHover: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const closeTimer = useRef(0);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); ref.current?.querySelector<HTMLButtonElement>("button")?.focus(); } };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  const enter = () => { window.clearTimeout(closeTimer.current); onHover(); setOpen(true); };
  const leave = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 160); };
  return (
    <li ref={ref} className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && enter()} onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      {hovered && <motion.span layoutId="nav-hover" className="v-nav-hover" transition={{ type: "spring", stiffness: 520, damping: 40 }} />}
      <button type="button" className={`v-nav-link v-nav-group ${active ? "is-on" : ""} ${open ? "is-open" : ""}`} aria-expanded={open} aria-haspopup="true"
        onClick={() => setOpen((v) => !v)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); window.setTimeout(() => ref.current?.querySelector<HTMLAnchorElement>("a")?.focus(), 30); } }}>
        {label}
        <ChevronDown className="v-nav-chev h-3.5 w-3.5" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="v-nav-drop" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onPointerEnter={() => window.clearTimeout(closeTimer.current)}>
            <ul>
              {items.map(({ href, label: name, desc, Icon }) => (
                <li key={href}>
                  <Link href={href} className={`v-nav-drop-item ${onPage(path, href) ? "is-on" : ""}`} onClick={() => setOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                      e.preventDefault();
                      const links = [...(ref.current?.querySelectorAll<HTMLAnchorElement>(".v-nav-drop-item") ?? [])];
                      const i = links.indexOf(e.currentTarget);
                      links[(i + (e.key === "ArrowDown" ? 1 : links.length - 1)) % links.length]?.focus();
                    }}>
                    <span className="v-nav-drop-icon"><Icon className="h-[18px] w-[18px]" /></span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-bold leading-tight">{name}</span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-dim">{desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
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
  const isOn = (href: string) => onPage(path, href);
  const [hover, setHover] = useState<string | null>(null);

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

  let menuIndex = 0;

  return (
    <>
      <header className={`v-nav ${scrolled ? "is-scrolled" : ""} ${hidden && !open ? "is-hidden" : ""} ${open ? "is-open" : ""}`}>
        <nav aria-label="Main" className="v-nav-inner">
          <Link href="/" className="v-nav-brand" aria-label={`${site.name} home`}>
            <img src="/brand/icon.png" alt="" width={30} height={30} className="logo-img h-[30px] w-[30px]" aria-hidden />
            <span>native</span>
          </Link>

          <ul className="v-nav-links" onPointerLeave={() => setHover(null)}>
            {NAV.map((entry) => isGroup(entry) ? (
              <NavGroup key={entry.label} label={entry.label} items={entry.items} active={entry.items.some((i) => isOn(i.href))}
                hovered={hover === entry.label} onHover={() => setHover(entry.label)} />
            ) : (
              <li key={entry.href} className="relative" onPointerEnter={() => setHover(entry.href)}>
                {hover === entry.href && <motion.span layoutId="nav-hover" className="v-nav-hover" transition={{ type: "spring", stiffness: 520, damping: 40 }} />}
                <Link href={entry.href} className={`v-nav-link ${isOn(entry.href) ? "is-on" : ""}`} aria-current={isOn(entry.href) ? "page" : undefined}>
                  {entry.label}
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
        <HalloweenSpiders hidden={hidden && !open} menuOpen={open} />
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
            <motion.button type="button" className="v-menu-search" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
              onClick={() => { setOpen(false); window.setTimeout(openSearch, 80); }}>
              <Search className="h-5 w-5 shrink-0" /> <span className="truncate">Search players, cloaks, pages…</span>
            </motion.button>
            <div className="v-menu-groups">
              {MENU_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="v-menu-i v-menu-group">{group.label}</p>
                  <ul className="v-menu-list">
                    {group.items.map((l) => {
                      const i = menuIndex++;
                      return (
                        <li key={l.href} className="overflow-hidden">
                          <motion.div initial={{ y: "110%" }} animate={{ y: "0%" }} exit={{ y: "110%" }} transition={{ duration: 0.7, delay: 0.15 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}>
                            <Link href={l.href} onClick={() => setOpen(false)} className={`v-menu-link ${isOn(l.href) ? "is-on" : ""}`}>
                              <l.Icon className="v-menu-icon" aria-hidden />
                              {l.label}
                            </Link>
                          </motion.div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
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
