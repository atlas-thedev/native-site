"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, Clock, CornerDownLeft, LoaderCircle, Package, Search, Shirt, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import SkinHead from "../SkinHead";
import CapeStrip from "../CapeStrip";
import WornShot from "../cosmetics/WornShot";
import type { StoreItem } from "@/lib/store";
import type { SearchHit } from "@/lib/profiles";
import { PAGES, SEARCH_PAGES } from "@/lib/navLinks";

type Section = "Recent" | "Jump to" | "Pages" | "Players" | "Store" | "More";
type Row = { key: string; href: string; label: string; sub: string; icon: React.ReactNode; section: Section; recent?: string };
const MC_NAME = /^[A-Za-z0-9_]{3,16}$/;
const RECENT_KEY = "native.search.recent";
const OPEN_EVENT = "native:search";
const EMPTY: SearchHit = { players: [], items: [] };
const QUICK = [PAGES.download, PAGES.store, PAGES.plus, PAGES.players, PAGES.skins, PAGES.beta];

/** Opens the search from anywhere (the phone menu uses it). */
export const openSearch = () => window.dispatchEvent(new Event(OPEN_EVENT));

const readRecent = (): string[] => {
  try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 5) : []; } catch { return []; }
};
const saveRecent = (term: string) => {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...readRecent().filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5))); } catch { /* private mode */ }
};

/** The matched part of a label in bold. */
function Mark({ text, term }: { text: string; term: string }) {
  const i = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="cs-mark">{text.slice(i, i + term.length)}</mark>{text.slice(i + term.length)}</>;
}

const pageIcon = (Icon: React.ComponentType<{ className?: string }>) => <Icon className="h-5 w-5" />;

/** Ctrl+K / ⌘K / "/" search over pages, players (Native + Minecraft), skins and the store. */
export default function CommandSearch({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit>(EMPTY);
  const [hitsFor, setHitsFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [mac, setMac] = useState(false);

  useEffect(() => { setMac(/Mac|iPhone|iPad/.test(navigator.platform)); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === "/" && !typing) { e.preventDefault(); setOpen(true); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(OPEN_EVENT, onOpen); };
  }, []);
  useEffect(() => {
    if (open) { setRecent(readRecent()); setTimeout(() => input.current?.focus(), 10); document.documentElement.style.overflow = "hidden"; }
    else { document.documentElement.style.overflow = ""; setQ(""); setHits(EMPTY); setHitsFor(""); setActive(0); }
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const term = q.trim();
    setActive(0);
    setFailed(false);
    if (!term) { setHits(EMPTY); setHitsFor(""); setLoading(false); return; }
    setLoading(true);
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d) => { setHits({ players: d.players ?? [], items: d.items ?? [] }); setHitsFor(term); setFailed(d.ok === false); setLoading(false); })
        .catch((e) => { if (e?.name !== "AbortError") { setFailed(true); setLoading(false); } });
    }, 140);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  const term = q.trim();
  const rows = useMemo<Row[]>(() => {
    if (!term) {
      return [
        ...recent.map((r): Row => ({ key: `r:${r}`, href: "", recent: r, label: r, sub: "Recent search", icon: <Clock className="h-5 w-5" />, section: "Recent" })),
        ...QUICK.map((p): Row => ({ key: `j:${p.href}`, href: p.href, label: p.label, sub: p.desc, icon: pageIcon(p.Icon), section: "Jump to" })),
      ];
    }
    const lower = term.toLowerCase();
    const out: Row[] = SEARCH_PAGES
      .map((p) => ({ p, score: p.label.toLowerCase().startsWith(lower) ? 3 : p.label.toLowerCase().includes(lower) ? 2 : `${p.keywords ?? ""} ${p.desc}`.toLowerCase().includes(lower) ? 1 : 0 }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ p }) => ({ key: `pg:${p.href}`, href: p.href, label: p.label, sub: p.desc, icon: pageIcon(p.Icon), section: "Pages" }));
    // results from an older query stay up while the new one loads, so the list doesn't flicker
    const live = hitsFor ? hits : EMPTY;
    for (const p of live.players) out.push({ key: `p:${p.name}`, href: `/u/${encodeURIComponent(p.name)}`, label: p.name, sub: p.native ? "Native player" : "Minecraft player", section: "Players", icon: <SkinHead skin={p.skin ?? null} name={p.name} size={32} className="rounded-[5px] shadow-[0_2px_0_rgb(0_0_0/0.35)]" /> });
    if (MC_NAME.test(term) && !live.players.some((p) => p.name.toLowerCase() === lower)) {
      out.push({ key: "lookup", href: `/u/${encodeURIComponent(term)}`, label: `Look up “${term}”`, sub: "Any Minecraft Java player", icon: <User className="h-5 w-5" />, section: "Players" });
    }
    for (const it of live.items) out.push({ key: `i:${it.id}`, href: it.kind === "cosmetic" ? `/cosmetics/${encodeURIComponent(it.id)}` : `/cloaks/${encodeURIComponent(it.id)}`, label: it.name, sub: it.kind === "cosmetic" ? `Cosmetic${it.slot ? ` · ${it.slot}` : ""}` : "Cloak", section: "Store", icon: it.kind === "cosmetic" && it.modelUrl && it.textureUrl
        ? <WornShot item={it as unknown as StoreItem} skin={null} model="default" className="h-11 w-11 object-contain" alt="" hideFallback={!it.stillUrl} />
        : it.stillUrl ? <CapeStrip strip={it.animated ? it.stripUrl ?? null : null} still={it.stillUrl} frames={it.frames ?? 1} fps={it.fps ?? 1} width={24} label={it.name} />
        : <Package className="h-5 w-5" /> });
    out.push({ key: "skins", href: `/skins?q=${encodeURIComponent(term)}`, label: `Skins worn by “${term}”`, sub: "Skin library", icon: <Shirt className="h-5 w-5" />, section: "More" });
    return out;
  }, [hits, hitsFor, term, recent]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-row="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = useCallback((r?: Row) => {
    if (!r) return;
    if (r.recent) { setQ(r.recent); input.current?.focus(); return; }
    if (term) saveRecent(term);
    setOpen(false);
    router.push(r.href);
  }, [router, term]);
  const forget = (t: string) => {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(readRecent().filter((x) => x !== t))); } catch { /* private mode */ }
    setRecent(readRecent());
  };
  const move = (d: number) => setActive((a) => (rows.length ? (a + d + rows.length) % rows.length : 0));
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); if (q) setQ(""); else setOpen(false); }
    else if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { e.preventDefault(); go(rows[active]); }
  };
  const nothing = term && !loading && hitsFor === term && !hits.players.length && !hits.items.length;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Search" className={`cs-trigger nx-box inline-flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[10px] border border-line bg-surface px-3 text-[13px] font-bold text-dim transition hover:bg-surface-2 hover:text-fg ${className}`}>
        <Search className="h-4 w-4" />
        <span className="hidden pr-6 xl:inline">Search</span>
        <kbd className="hidden whitespace-nowrap rounded-[6px] border border-line bg-bg px-1.5 py-0.5 font-mono text-[11px] leading-none lg:inline-flex">{mac ? "⌘" : "Ctrl"} K</kbd>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-3 pt-[9vh] backdrop-blur-sm sm:px-4 sm:pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
            <motion.div role="dialog" aria-modal="true" aria-label="Search" className="st-panel cs-panel w-full max-w-[640px] overflow-hidden !p-0 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]" initial={{ y: -10, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, scale: 0.98 }} transition={{ duration: 0.14 }}>
              <div className="flex items-center gap-3 border-b-2 border-line px-4">
                {loading ? <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-dim" /> : <Search className="h-5 w-5 shrink-0 text-dim" />}
                <input ref={input} value={q} onChange={(e) => setQ(e.target.value.slice(0, 32))} onKeyDown={onKeyDown} placeholder="Search players, cloaks, cosmetics and pages…" aria-label="Search"
                  role="combobox" aria-expanded aria-controls="cs-list" aria-activedescendant={rows[active] ? `cs-row-${active}` : undefined}
                  spellCheck={false} autoComplete="off" className="h-14 w-full bg-transparent text-[16px] font-semibold !outline-none !shadow-none !border-0 placeholder:text-dim" />
                {q ? (
                  <button type="button" onClick={() => { setQ(""); input.current?.focus(); }} className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-dim transition hover:bg-surface-2 hover:text-fg" aria-label="Clear search"><X className="h-4 w-4" /></button>
                ) : (
                  <button type="button" onClick={() => setOpen(false)} className="shrink-0 rounded-[5px] border border-line px-1.5 py-0.5 font-mono text-[11px] text-dim transition hover:text-fg" aria-label="Close search">Esc</button>
                )}
              </div>
              <ul ref={list} id="cs-list" className="max-h-[min(56vh,520px)] overflow-y-auto p-2" role="listbox" aria-label="Results">
                {rows.map((r, i) => (
                  <Fragment key={r.key}>
                    {(i === 0 || rows[i - 1].section !== r.section) && (
                      <li role="presentation" className="cs-section">{r.section}</li>
                    )}
                    <li role="option" id={`cs-row-${i}`} aria-selected={i === active} data-row={i}>
                      <div className={`cs-row ${i === active ? "is-active" : ""}`}>
                        <button type="button" onMouseMove={() => active !== i && setActive(i)} onClick={() => go(r)} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left">
                          <span className="cs-icon">{r.icon}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px] font-bold"><Mark text={r.label} term={r.section === "More" || r.section === "Recent" ? "" : term} /></span>
                            <span className="cs-sub block truncate text-[12px]">{r.sub}</span>
                          </span>
                          {i === active && <CornerDownLeft className="h-4 w-4 shrink-0 opacity-70" />}
                        </button>
                        {r.recent && (
                          <button type="button" onClick={() => forget(r.recent!)} className="cs-forget" aria-label={`Remove “${r.recent}” from recent searches`}><X className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    </li>
                  </Fragment>
                ))}
                {nothing && (
                  <li className="px-3 pb-3 pt-2 text-center text-[13px] text-dim">No players or store items match “{term}”.</li>
                )}
                {failed && term && (
                  <li className="px-3 pb-3 pt-2 text-center text-[13px] text-dim">Couldn’t reach Native to search players and items. Pages still work.</li>
                )}
              </ul>
              <div className="cs-foot">
                <span><kbd><ArrowUp className="h-3 w-3" /></kbd><kbd><ArrowDown className="h-3 w-3" /></kbd> move</span>
                <span><kbd><CornerDownLeft className="h-3 w-3" /></kbd> open</span>
                <span><kbd>esc</kbd> {q ? "clear" : "close"}</span>
                <span className="ml-auto hidden sm:inline">Tip: press <kbd>/</kbd> anywhere to search</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
