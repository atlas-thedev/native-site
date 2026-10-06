"use client";

import { motion } from "motion/react";
import { Check, Search, Users, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import SortMenu from "../capes/SortMenu";
import { ownerLabel } from "../capes/actions";
import { PixelStar } from "../icons";
import { COSMETIC_SLOTS, SLOT_NAMES, isPaid, money, priceNow, sortBy, type CosmeticSlot, type Owned, type SortKey, type StoreItem, type Wearing } from "@/lib/store";

type Filter = "all" | CosmeticSlot | "moves" | "free" | "paid" | "new" | "mine";
type Props = { items: StoreItem[]; signedIn: boolean; owned: Owned[]; wearing: Wearing };

const SLOT_LABEL: Record<CosmeticSlot, string> = { hats: "Hats", glasses: "Glasses", back: "Wings", shoes: "Shoes" };
const chip = (on: boolean) => `inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13.5px] font-medium transition ${on ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`;

/** Same wall as the cloaks page: search, filter, sort and a grid of cards. Each card opens its own 3D page. */
export default function CosmeticGallery({ items, signedIn, owned, wearing }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const mine = useMemo(() => new Set(owned.map((o) => o.id)), [owned]);
  const worn = useMemo(() => new Set(Object.values(wearing)), [wearing]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, moves: items.filter((i) => i.motion).length, free: items.filter((i) => !i.exclusive && !isPaid(i)).length, paid: items.filter(isPaid).length, new: items.filter((i) => i.isNew).length, mine: items.filter((i) => mine.has(i.id)).length };
    for (const s of COSMETIC_SLOTS) c[s] = items.filter((i) => i.slot === s).length;
    return c;
  }, [items, mine]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = items.filter((it) => {
      if ((COSMETIC_SLOTS as readonly string[]).includes(filter) && it.slot !== filter) return false;
      if (filter === "moves" && !it.motion) return false;
      if (filter === "free" && (it.exclusive || isPaid(it))) return false;
      if (filter === "paid" && !isPaid(it)) return false;
      if (filter === "new" && !it.isNew) return false;
      if (filter === "mine" && !mine.has(it.id)) return false;
      if (!needle) return true;
      return [it.name, it.description, it.author, it.slot ? SLOT_NAMES[it.slot] : "", ...it.tags].some((v) => String(v ?? "").toLowerCase().includes(needle));
    });
    return sortBy(filtered, sort);
  }, [items, q, filter, sort, mine]);

  const filters: [Filter, string][] = [
    ["all", "All"],
    ...COSMETIC_SLOTS.map((s) => [s, SLOT_LABEL[s]] as [Filter, string]),
    ["moves", "Moving"],
    ...(counts.paid ? ([["free", "Free"], ["paid", "Paid"]] as [Filter, string][]) : []),
    ["new", "New"],
    ...(signedIn ? ([["mine", "In my locker"]] as [Filter, string][]) : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-11 min-w-[240px] flex-1 items-center gap-2.5 rounded-full border border-line bg-surface px-4 text-mute focus-within:border-fg sm:max-w-[380px]">
          <Search className="h-4 w-4 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cosmetics, tags or authors" aria-label="Search cosmetics" className="min-w-0 flex-1 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-dim" />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="text-dim hover:text-fg">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter cosmetics">
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
            const on = worn.has(it.id);
            return (
              <motion.li key={it.id} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: Math.min(i, 10) * 0.035, ease: [0.16, 1, 0.3, 1] }}>
                <Link href={`/cosmetics/${it.id}`} className={`group relative flex h-full flex-col rounded-[22px] border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-fg/40 hover:bg-surface-2 ${on ? "border-fg/70" : "border-line"}`}>
                  <div className="dots relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl">
                    <img src={it.stillUrl} alt={`${it.name} ${it.slot ? SLOT_NAMES[it.slot].toLowerCase() : "cosmetic"}`} loading="lazy" className="cutout-sm h-[62%] w-[62%] object-contain transition duration-500 [image-rendering:pixelated] group-hover:scale-[1.08]" />
                    <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                      {it.motion && <span className="rounded-full bg-inv px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-inv-fg">Moves</span>}
                      {it.isNew && <span className="rounded-full border border-line bg-bg/80 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider backdrop-blur">New</span>}
                    </div>
                    {it.featured && <PixelStar className="absolute right-3 top-3 h-3.5 w-3.5 text-mute" aria-label="Featured" />}
                    {it.slot && <span className="absolute bottom-2.5 left-2.5 rounded-full border border-line bg-bg/80 px-2 py-0.5 text-[10.5px] font-semibold text-mute backdrop-blur">{SLOT_LABEL[it.slot]}</span>}
                    {own && (
                      <span title={on ? "You’re wearing this" : "In your locker"} aria-label={on ? "You’re wearing this" : "In your locker"} className={`absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-bg ${on ? "bg-inv text-inv-fg" : "bg-surface-2 text-fg"}`}>
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
          <div className="flex flex-wrap justify-center gap-2">
            {COSMETIC_SLOTS.map((s) => <span key={s} className="rounded-full border border-dashed border-line px-3 py-1.5 text-[13px] font-semibold text-dim">{SLOT_LABEL[s]}</span>)}
          </div>
          <p className="mt-6 text-[22px] font-extrabold tracking-tight">{items.length ? "No cosmetics match that." : "New cosmetics are on the way."}</p>
          <p className="mt-2 max-w-[440px] text-mute">{items.length ? "Try another search or filter." : "Native hats, glasses, wings and shoes are being made right now. They’ll show up here, in the launcher store and in your locker the moment they drop."}</p>
        </div>
      )}
    </div>
  );
}
