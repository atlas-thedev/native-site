"use client";

import { motion } from "motion/react";
import { Film, Gift, Image as ImageIcon, LayoutGrid, Search, Sparkles, Tag, User, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import CapeStrip from "../CapeStrip";
import ItemCard from "../store/ItemCard";
import SortSeg from "../store/SortSeg";
import StoreHero from "../store/StoreHero";
import { PixelCape } from "../icons";
import { isPaid, sortBy, type Owned, type SortKey, type StoreItem } from "@/lib/store";

type Filter = "all" | "animated" | "static" | "free" | "paid" | "new" | "mine";
type Props = { items: StoreItem[]; signedIn: boolean; owned: Owned[]; equipped: string | null; banner?: ReactNode };

/** The cloak wall: sky header, search, sort switch, filter tabs and a dense grid of cloak cards. */
export default function CapeGallery({ items, signedIn, owned, equipped, banner }: Props) {
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

  const filters: [Filter, string, ReactNode][] = [
    ["all", "All", <LayoutGrid key="a" />],
    ["animated", "Animated", <Film key="b" />],
    ["static", "Static", <ImageIcon key="c" />],
    ...(counts.paid ? ([["free", "Free", <Gift key="d" />], ["paid", "Paid", <Tag key="e" />]] as [Filter, string, ReactNode][]) : []),
    ["new", "New", <Sparkles key="f" />],
    ...(signedIn ? ([["mine", "My locker", <User key="g" />]] as [Filter, string, ReactNode][]) : []),
  ];

  return (
    <div>
      <StoreHero
        title="Native Cloaks"
        blurb={<>Discover animated and classic cloaks you can only get from Native.<br />Preview them in 3D, add one to your locker and wear it in the launcher and in game.</>}
        cta={{ text: "Want hats, wings or shoes too?", label: "Go to Cosmetics", href: "/cosmetics" }}
      />
      {banner}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="st-input min-w-[240px] flex-1 sm:max-w-[420px]">
          <Search className="h-4 w-4 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cloaks, tags or authors…" aria-label="Search cloaks" />
          {q && <button onClick={() => setQ("")} aria-label="Clear search" className="text-dim hover:text-fg"><X className="h-4 w-4" /></button>}
        </label>
        <SortSeg value={sort} onChange={setSort} />
      </div>
      <div className="st-tabs mt-3" role="tablist" aria-label="Filter cloaks">
        {filters.map(([id, label, icon]) => (
          <button key={id} role="tab" aria-selected={filter === id} className={`st-tab ${filter === id ? "is-on" : ""}`} onClick={() => setFilter(id)}>
            {icon}{label}<span className="n">{counts[id]}</span>
          </button>
        ))}
      </div>

      {list.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((it, i) => (
            <motion.li key={it.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: Math.min(i, 12) * 0.03, ease: [0.16, 1, 0.3, 1] }}>
              <ItemCard
                item={it}
                href={`/cloaks/${it.id}`}
                aspect="aspect-[4/5]"
                players
                own={mine.has(it.id)}
                worn={equipped === it.id}
                art={<CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={84} label={`${it.name} cloak`} className="cutout-sm" />}
                left={<>{it.animated && <span className="st-tag is-inv">Animated</span>}{it.isNew && <span className="st-tag">New</span>}</>}
                right={it.featured ? <span className="st-tag">Featured</span> : null}
              />
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="st-panel mt-6 flex flex-col items-center px-6 py-16 text-center">
          <span className="slot-well flex h-14 w-14 items-center justify-center"><PixelCape className="h-7 w-7" /></span>
          <p className="mt-5 text-[22px] font-extrabold tracking-tight">{items.length ? "No cloaks match that." : "New cloaks are on the way."}</p>
          <p className="mt-2 max-w-[440px] text-mute">{items.length ? "Try another search or filter." : "The first Native cloaks are being made right now. They’ll show up here and in your locker the moment they drop."}</p>
        </div>
      )}
    </div>
  );
}
