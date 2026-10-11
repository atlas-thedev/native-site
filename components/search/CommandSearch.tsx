"use client";

import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Package, Search, Shirt, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SkinHead from "../SkinHead";
import CapeStrip from "../CapeStrip";
import WornShot from "../cosmetics/WornShot";
import type { StoreItem } from "@/lib/store";
import type { SearchHit } from "@/lib/profiles";

type Row = { key: string; href: string; label: string; sub: string; icon: React.ReactNode };
const MC_NAME = /^[A-Za-z0-9_]{3,16}$/;

/** Ctrl+K / ⌘K / "/" search over players (Native + Minecraft), skins and the store. */
export default function CommandSearch({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit>({ players: [], items: [] });
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const [mac, setMac] = useState(false);

  useEffect(() => { setMac(/Mac|iPhone|iPad/.test(navigator.platform)); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === "/" && !typing) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (open) { setTimeout(() => input.current?.focus(), 10); document.documentElement.style.overflow = "hidden"; }
    else { document.documentElement.style.overflow = ""; setQ(""); setHits({ players: [], items: [] }); }
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const term = q.trim();
    setActive(0);
    if (!term) { setHits({ players: [], items: [] }); return; }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctl.signal }).then((r) => r.json()).then((d) => setHits({ players: d.players ?? [], items: d.items ?? [] })).catch(() => {});
    }, 140);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  const rows = useMemo<Row[]>(() => {
    const term = q.trim();
    const out: Row[] = hits.players.map((p) => ({ key: `p:${p.name}`, href: `/u/${encodeURIComponent(p.name)}`, label: p.name, sub: p.native ? "Native player" : "Minecraft player", icon: <SkinHead skin={p.skin ?? null} name={p.name} size={32} className="rounded-[5px] shadow-[0_2px_0_rgb(0_0_0/0.35)]" /> }));
    if (term && MC_NAME.test(term) && !hits.players.some((p) => p.name.toLowerCase() === term.toLowerCase())) {
      out.push({ key: "lookup", href: `/u/${encodeURIComponent(term)}`, label: `Look up “${term}”`, sub: "Any Minecraft Java player", icon: <User className="h-5 w-5" /> });
    }
    for (const it of hits.items) out.push({ key: `i:${it.id}`, href: it.kind === "cosmetic" ? `/cosmetics/${encodeURIComponent(it.id)}` : `/cloaks/${encodeURIComponent(it.id)}`, label: it.name, sub: it.kind === "cosmetic" ? `Cosmetic${it.slot ? ` · ${it.slot}` : ""}` : "Cloak", icon: it.kind === "cosmetic" && it.modelUrl && it.textureUrl
        ? <WornShot item={it as unknown as StoreItem} skin={null} model="default" className="h-11 w-11 object-contain" alt="" hideFallback={!it.stillUrl} />
        : it.stillUrl ? <CapeStrip strip={it.animated ? it.stripUrl ?? null : null} still={it.stillUrl} frames={it.frames ?? 1} fps={it.fps ?? 1} width={24} label={it.name} />
        : <Package className="h-5 w-5" /> });
    if (term) out.push({ key: "skins", href: `/skins?q=${encodeURIComponent(term)}`, label: `Skins worn by “${term}”`, sub: "Skin library", icon: <Shirt className="h-5 w-5" /> });
    return out;
  }, [hits, q]);

  const go = useCallback((r?: Row) => { if (!r) return; setOpen(false); router.push(r.href); }, [router]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(rows.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); go(rows[active]); }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Search" className={`nx-box inline-flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[10px] border border-line bg-surface px-3 text-[13px] font-bold text-dim transition hover:bg-surface-2 hover:text-fg ${className}`}>
        <Search className="h-4 w-4" />
        <span className="hidden 2xl:inline">Search</span>
        <kbd className="hidden whitespace-nowrap rounded-[6px] border border-line bg-bg px-1.5 py-0.5 font-mono text-[11px] leading-none lg:inline-flex">{mac ? "⌘" : "Ctrl"} K</kbd>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
            <motion.div role="dialog" aria-modal="true" aria-label="Search" className="st-panel w-full max-w-[620px] overflow-hidden !p-0 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]" initial={{ y: -10, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, scale: 0.98 }} transition={{ duration: 0.14 }}>
              <div className="flex items-center gap-3 border-b-2 border-line px-4">
                <Search className="h-5 w-5 shrink-0 text-dim" />
                <input ref={input} value={q} onChange={(e) => setQ(e.target.value.slice(0, 32))} onKeyDown={onKeyDown} placeholder="Search players, skins, cloaks and cosmetics…" aria-label="Search" spellCheck={false} autoComplete="off" className="h-14 w-full bg-transparent text-[16px] font-semibold !outline-none !shadow-none !border-0 placeholder:text-dim" />
                <kbd className="shrink-0 rounded-[5px] border border-line px-1.5 py-0.5 font-mono text-[11px] text-dim">Esc</kbd>
              </div>
              <ul className="max-h-[56vh] overflow-y-auto p-2" role="listbox">
                {rows.length ? rows.map((r, i) => (
                  <li key={r.key} role="option" aria-selected={i === active}>
                    <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(r)} className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left transition ${i === active ? "bg-inv text-inv-fg" : "hover:bg-surface-2"}`}>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-black/25">{r.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-bold">{r.label}</span>
                        <span className={`block truncate text-[12px] ${i === active ? "opacity-70" : "text-dim"}`}>{r.sub}</span>
                      </span>
                      {i === active && <CornerDownLeft className="h-4 w-4 shrink-0 opacity-70" />}
                    </button>
                  </li>
                )) : (
                  <li className="px-3 py-8 text-center text-[14px] text-dim">{q.trim() ? "Searching…" : "Type a player name, a skin owner or a store item."}</li>
                )}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
