"use client";

import { motion } from "motion/react";
import { Check, Search, Users, X } from "lucide-react";
import { PixelCape, PixelStar } from "../icons";
import Link from "next/link";
import { useMemo, useState } from "react";
import CapeStrip from "../CapeStrip";
import SortMenu from "./SortMenu";
import { ownerLabel } from "./actions";
import { isPaid, money, priceNow, sortBy, type Owned, type SortKey, type StoreItem } from "@/lib/store";

type Filter = "all" | "animated" | "static" | "free" | "paid" | "new" | "mine";
type Props = { items: StoreItem[]; signedIn: boolean; owned: Owned[]; equipped: string | null };

const chip = (on: boolean) => `inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13.5px] font-medium transition ${on ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`;

/** laby.net-style cloak wall: search, filter, sort, and a grid of live cloak previews. */
export default function CapeGallery({ items, signedIn, owned, equipped }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const mine = useMemo(() => new Set(owned.map((o) => o.id)), [owned]);

  const counts = useMemo(
    () => ({ all: items.length, animated: items.filter((i) => i.animated).length, static: items.filter((i) => !i.animated).length, free: items.filter((i) => !i.exclusive && !isPaid(i)).length, paid: items.filter((i) => isPaid(i)).length, new: items.filter((i) => i.isNew).length, mine: items.filter((i) => mine.has(i.id)).length }),
    [items, mine],
  );

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = items.filter((it) => {
      if (filter === "animated" && !it.animated) return false;
      if (filter === "static" && it.animated) return false;
      if (filter === "free" && (it.exclusive || isPaid(it))) return false;
      if (filter === "paid" && !isPaid(it)) return false;
      if (filter === "new" && !it.isNew) return false;
      if (filter === "mine" && !mine.has(it.id)) return false;
      if (!needle) return true;
      return [it.name, it.description, it.author, ...it.tags].some((v) => String(v ?? "").toLowerCase().includes(needle));
    });
    return sortBy(filtered, sort);
  }, [items, q, filter, sort, mine]);

  const filters: [Filter, string][] = [["all", "All"], ["animated", "Animated"], ["static", "Static"], ...(counts.paid ? ([["free", "Free"], ["paid", "Paid"]] as [Filter, string][]) : []), ["new", "New"], ...(signedIn ? ([["mine", "In my locker"]] as [Filter, string][]) : [])];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2.5 rounded-full border border-line bg-surface px-4 text-mute focus-within:border-fg sm:max-w-[380px]">
          <Search className="h-4 w-4 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cloaks, tags or authors" aria-label="Search cloaks" className="min-w-0 flex-1 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-dim" />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="text-dim hover:text-fg">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter cloaks">
          {filters.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={filter === id} className={chip(filter === id)} onClick={() => setFilter(id)}>
              {label}
              <span className={`text-[12px] ${filter === id ? "opacity-70" : "text-dim"}`}>{counts[id]}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[13.5px] text-mute">
          <span aria-hidden>Sort</span>
          <SortMenu value={sort} onChange={setSort} />
        </div>
      </div>

      {list.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((it, i) => {
            const own = mine.has(it.id);
            const worn = equipped === it.id;
            return (
              <motion.li key={it.id} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: Math.min(i, 10) * 0.035, ease: [0.16, 1, 0.3, 1] }}>
                <Link href={`/cloaks/${it.id}`} className={`group relative flex h-full flex-col rounded-[22px] border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-fg/40 hover:bg-surface-2 ${worn ? "border-fg/70" : "border-line"}`}>
                  <div className="dots relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl">
                    <CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={84} label={`${it.name} cloak`} className="cutout-sm transition duration-500 group-hover:scale-[1.06]" />
                    <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                      {it.animated && <span className="rounded-full bg-inv px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-inv-fg">Animated</span>}
                      {it.isNew && <span className="rounded-full border border-line bg-bg/80 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider backdrop-blur">New</span>}
                    </div>
                    {it.featured && <PixelStar className="absolute right-3 top-3 h-3.5 w-3.5 text-mute" aria-label="Featured" />}
                    {own && (
                      <span title={worn ? "You’re wearing this" : "In your locker"} aria-label={worn ? "You’re wearing this" : "In your locker"} className={`absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-bg ${worn ? "bg-inv text-inv-fg" : "bg-surface-2 text-fg"}`}>
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="px-1.5 pb-1 pt-3">
                    <p className="truncate text-[15px] font-bold tracking-tight">{it.name}</p>
                    <p className="mt-0.5 flex items-center justify-between gap-2 text-[12.5px] text-dim">
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{ownerLabel(it.owners)}</span>
                      <span className="font-semibold text-mute">{it.exclusive ? "Event" : isPaid(it) ? (it.salePrice != null ? <>{money(priceNow(it))} <s className="font-normal opacity-60">{money(it.price)}</s></> : money(it.price)) : "Free"}</span>
                    </p>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <div className="card mt-8 flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2"><PixelCape className="h-6 w-6" /></span>
          <p className="mt-5 text-[22px] font-extrabold tracking-tight">{items.length ? "No cloaks match that." : "New cloaks are on the way."}</p>
          <p className="mt-2 max-w-[440px] text-mute">{items.length ? "Try another search or filter." : "The first Native cloaks are being made right now. They’ll show up here and in your locker the moment they drop."}</p>
        </div>
      )}
    </div>
  );
}
