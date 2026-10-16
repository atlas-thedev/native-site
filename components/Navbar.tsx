"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, Crown, Gift } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../app/redesign.css";
import "../app/nav.css";
import { usePathname } from "next/navigation";
import { useAccount } from "./useAccount";
import { useLaunch } from "./launch/LaunchContext";
import { site } from "@/lib/site";
import { Apple, Discord, Linux, Windows } from "./icons";
import ThemeToggle from "./ThemeToggle";
import { HalloweenSpiders } from "./Halloween";
import SkinHead from "./SkinHead";
import CommandSearch from "./search/CommandSearch";
import { MENU_GROUPS, NAV, isGroup, onPage, type NavPage } from "@/lib/navLinks";

const getLinks = [
  { label: "Windows", sub: "Installer · x64", href: "/api/download/windows", Icon: Windows },
  { label: "macOS", sub: "Apple Silicon", href: "/api/download/mac", Icon: Apple },
  { label: "macOS", sub: "Intel", href: "/api/download/mac?arch=x64", Icon: Apple },
  { label: "Linux", sub: "AppImage · .deb", href: "/api/download/linux", Icon: Linux },
];

/** Closes a popover on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open, close, ref]);
}

const pop = { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] as const } };

function DownloadMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), ref);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className="nv-cta">
        Download
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" className="nv-pop nv-pop-right" {...pop}>
            {getLinks.map(({ label, sub, href, Icon }) => (
              <a key={href} role="menuitem" href={href} download="" onClick={() => setOpen(false)} className="nv-pop-item">
                <span className="nv-pop-icon"><Icon className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0">
                  <span className="nv-pop-title">{label}</span>
                  <span className="nv-pop-desc">{sub}</span>
                </span>
              </a>
            ))}
            <Link href="/download" onClick={() => setOpen(false)} className="nv-pop-foot">
              All downloads and release notes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A nav link that opens a small menu of pages: on hover, on click and from the keyboard. */
function NavGroup({ label, items, active }: { label: string; items: NavPage[]; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const closeTimer = useRef(0);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useDismiss(open, () => setOpen(false), ref);
  const enter = () => { window.clearTimeout(closeTimer.current); setOpen(true); };
  const leave = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 140); };
  return (
    <li ref={ref} className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && enter()} onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button type="button" className={`nv-link ${active ? "is-on" : ""} ${open ? "is-open" : ""}`} aria-expanded={open} aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); window.setTimeout(() => ref.current?.querySelector<HTMLAnchorElement>("a")?.focus(), 30); } }}>
        {label}
        <ChevronDown className="nv-chev" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="nv-pop nv-pop-center" {...pop} onPointerEnter={() => window.clearTimeout(closeTimer.current)}>
            {items.map(({ href, label: name, desc, Icon }) => (
              <Link key={href} href={href} className={`nv-pop-item ${onPage(path, href) ? "is-on" : ""}`} onClick={() => setOpen(false)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                  e.preventDefault();
                  const links = [...(ref.current?.querySelectorAll<HTMLAnchorElement>(".nv-pop-item") ?? [])];
                  const i = links.indexOf(e.currentTarget);
                  links[(i + (e.key === "ArrowDown" ? 1 : links.length - 1)) % links.length]?.focus();
                }}>
                <span className="nv-pop-icon"><Icon className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0">
                  <span className="nv-pop-title">{name}</span>
                  <span className="nv-pop-desc">{desc}</span>
                </span>
              </Link>
            ))}
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

  const account = name ? (
    <Link href="/account" data-claim-target title="Your account" className="nv-acct">
      <SkinHead skin={me?.skin ?? null} name={name} size={28} className="!rounded-full" />
      <span className="max-w-[8rem] truncate">{name}</span>
    </Link>
  ) : (
    <Link href="/login" className={`nv-signin ${name === undefined ? "opacity-0" : ""}`}>Sign in</Link>
  );

  return (
    <>
      <header className={`v-nav nv ${scrolled ? "is-scrolled" : ""} ${hidden && !open ? "is-hidden" : ""} ${open ? "is-open" : ""}`}>
        <div className="nv-bar">
          <nav aria-label="Main" className="nv-inner">
            <Link href="/" className="nv-brand" aria-label={`${site.name} home`}>
              <img src="/brand/icon.png" alt="" width={28} height={28} className="logo-img h-7 w-7" aria-hidden />
              <span>NATIVE</span>
            </Link>

            <ul className="nv-links">
              {NAV.map((entry) => isGroup(entry) ? (
                <NavGroup key={entry.label} label={entry.label} items={entry.items} active={entry.items.some((i) => isOn(i.href))} />
              ) : (
                <li key={entry.href}>
                  <Link href={entry.href} className={`nv-link ${isOn(entry.href) ? "is-on" : ""}`} aria-current={isOn(entry.href) ? "page" : undefined}>
                    {entry.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/plus" className={`nv-link nv-plus ${isOn("/plus") ? "is-on" : ""}`}>
                  <Crown className="h-[15px] w-[15px]" aria-hidden />
                  Native+
                </Link>
              </li>
            </ul>

            <div className="nv-right">
              {!theme?.halloween && <span className="nv-theme hidden xl:inline-flex" data-theme-control><ThemeToggle /></span>}
              <span className="hidden sm:inline-flex">{account}</span>
              <span className="hidden md:inline-flex">
                {gift ? (
                  <Link href={giftCta.href} className="nv-cta">
                    <Gift className="h-4 w-4" aria-hidden />
                    <span className="whitespace-nowrap">{giftCta.label}</span>
                  </Link>
                ) : (
                  <DownloadMenu />
                )}
              </span>
              <button data-claim-target onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="nv-burger">
                <span className="nv-burger-lines" aria-hidden><i /><i /></span>
              </button>
            </div>
          </nav>
          <HalloweenSpiders hidden={hidden && !open} menuOpen={open} />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div className="nv-sheet" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
              <div className="nv-sheet-groups">
                {MENU_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="nv-sheet-label">{group.label}</p>
                    <ul>
                      {group.items.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} onClick={() => setOpen(false)} className={`nv-sheet-link ${isOn(l.href) ? "is-on" : ""}`}>
                            <span className="nv-pop-icon"><l.Icon className="h-[17px] w-[17px]" aria-hidden /></span>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="nv-sheet-foot">
                <Link href={gift ? giftCta.href : "/download"} onClick={() => setOpen(false)} className="nv-cta">
                  {gift ? giftCta.label : "Download"}
                </Link>
                <Link href={name ? "/account" : "/login"} onClick={() => setOpen(false)} className="nv-ghost">
                  {name ? "Your account" : "Sign in"}
                </Link>
                <div className="ml-auto flex items-center gap-2">
                  <a href={site.discord} target="_blank" rel="noreferrer" aria-label="Discord" className="nv-round"><Discord className="h-[17px] w-[17px]" /></a>
                  {!theme?.halloween && <span data-theme-control><ThemeToggle /></span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="v-nav-spacer" aria-hidden />
      {/* Ctrl+K / "/" still open search; it just has no button in the bar. */}
      <CommandSearch trigger={false} />
    </>
  );
}
