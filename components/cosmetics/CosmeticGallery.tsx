"use client";

import { motion } from "motion/react";
import { ArrowRight, CircleDot, Clock, Crown, Hand, Feather, Flame, Footprints, Glasses, LayoutGrid, Search, Sparkles, Star, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import WornShot from "./WornShot";
import ItemCard, { priceOf } from "../store/ItemCard";
import SortSeg from "../store/SortSeg";
import StoreHero from "../store/StoreHero";
import { PxLink } from "../ui/Px";
import { COSMETIC_SLOTS, SLOT_NAMES, sortBy, sortItems, type CosmeticSlot, type Owned, type SortKey, type StoreItem, type Wearing } from "@/lib/store";

type Tab = "featured" | "all" | CosmeticSlot;
type Props = { items: StoreItem[]; signedIn: boolean; owned: Owned[]; wearing: Wearing; banner?: ReactNode; skin?: string | null; model?: "default" | "slim" };

export const SLOT_COLOR: Record<CosmeticSlot, string> = { hats: "#ff8a7a", glasses: "#7fb2ff", back: "#9fe0ff", shoes: "#ffb45c", hand: "#d7a6ff", balloon: "#ff9ec7" };
const SLOT_LABEL: Record<CosmeticSlot, string> = { hats: "Headwear", glasses: "Glasses", back: "Wings", shoes: "Shoes", hand: "In hand", balloon: "Balloons" };
const SLOT_BLURB: Record<CosmeticSlot, string> = { hats: "Crowns, caps and halos", glasses: "Shades, visors and specs", back: "Wings, packs and jetpacks", shoes: "Sneakers and rocket boots", hand: "Swords, lanterns and gadgets", balloon: "Floating companions" };
const SLOT_ICON: Record<CosmeticSlot, ReactNode> = { hats: <Crown />, glasses: <Glasses />, back: <Feather />, shoes: <Footprints />, hand: <Hand />, balloon: <CircleDot /> };

/** The cosmetics shop: category tabs, then rows (featured, discover, new, trending, spotlight) or a plain grid when you search or pick a slot. */
export default function CosmeticGallery({ items, signedIn, owned, wearing, banner, skin = null, model = "default" }: Props) {
  const shot = (it: StoreItem, className: string, alt = "") => <WornShot item={it} skin={skin} model={model} className={className} alt={alt} />;
  const [tab, setTab] = useState<Tab>("featured");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const mine = useMemo(() => new Set(owned.map((o) => o.id)), [owned]);
  const worn = useMemo(() => new Set(Object.values(wearing)), [wearing]);

  const counts = useMemo(() => {
    const c = { featured: items.length, all: items.length } as Record<Tab, number>;
    for (const s of COSMETIC_SLOTS) c[s] = items.filter((i) => i.slot === s).length;
    return c;
  }, [items]);

  const needle = q.trim().toLowerCase();
  const grid = tab !== "featured" || !!needle;
  const list = useMemo(() => {
    const f = items.filter((it) => (tab === "featured" || tab === "all" || it.slot === tab) && (!needle || [it.name, it.description, it.author, it.slot ? SLOT_NAMES[it.slot] : "", ...it.tags].some((v) => String(v ?? "").toLowerCase().includes(needle))));
    return sortBy(f, sort);
  }, [items, tab, needle, sort]);

  const featured = useMemo(() => { const f = sortItems(items); const x = f.filter((i) => i.featured); return (x.length ? x : f).slice(0, 10); }, [items]);
  const fresh = useMemo(() => sortBy(items, "new").slice(0, 10), [items]);
  const trending = useMemo(() => sortBy(items, "popular").slice(0, 10), [items]);
  const pick = useMemo(() => featured.find((i) => i.motion) ?? featured[0] ?? null, [featured]);
  const spot = useMemo(() => {
    const seen = new Set<string>();
    return sortItems(items).filter((i) => (i.slot && !seen.has(i.slot) ? (seen.add(i.slot), true) : false)).slice(0, 4);
  }, [items]);

  const card = (it: StoreItem, wide = false) => (
    <div key={it.id} className={wide ? "w-[236px] sm:w-[250px]" : ""}>
      <ItemCard
        item={it}
        href={`/cosmetics/${it.id}`}
        own={mine.has(it.id)}
        worn={worn.has(it.id)}
        wish={{ signedIn }}
        art={shot(it, "cutout-sm h-[190px] w-[190px] max-w-[78%] object-contain", `${it.name} ${it.slot ? SLOT_NAMES[it.slot].toLowerCase() : ""}`)}
        left={<>{it.isNew && <span className="st-tag is-inv">New</span>}{it.motion && <span className="st-tag">Moves</span>}</>}
        right={it.exclusive ? <span className="st-tag">Event</span> : null}
        bottom={it.slot && <span className="st-tag is-slot" style={{ "--tint": SLOT_COLOR[it.slot] } as React.CSSProperties}>{SLOT_LABEL[it.slot]}</span>}
      />
    </div>
  );
  const row = (title: string, rows: StoreItem[], more: () => void, extra?: ReactNode) =>
    rows.length > 0 && (
      <section className="mt-12" aria-label={title}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="st-h2 flex items-center gap-3">{title}{extra}</h2>
          <button onClick={more} className="pxb is-ghost is-sm"><span className="pxb-face">View all <ArrowRight /></span></button>
        </div>
        <div className="st-rowscroll">{rows.map((it) => card(it, true))}</div>
      </section>
    );
  const open = (t: Tab, sortKey: SortKey = "featured") => { setTab(t); setSort(sortKey); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div>
      <StoreHero
        title="Native Cosmetics"
        blurb={<>Hats, glasses, wings, backpacks, shoes, hand items and balloons in real 3D.<br />Preview any piece on your own skin and wear it in the launcher and in game.<br />Native+ members get every cosmetic free.</>}
        cta={{ text: "Looking for a cloak?", label: "Go to Cloaks", href: "/cloaks" }}
        aside={
          items.length > 0 && (
            <label className="st-input w-[min(100%,340px)]">
              <Search className="h-4 w-4 shrink-0" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cosmetics…" aria-label="Search cosmetics" />
              {q && <button onClick={() => setQ("")} aria-label="Clear search" className="text-dim hover:text-fg"><X className="h-4 w-4" /></button>}
            </label>
          )
        }
      />
      {banner}

      <div className="st-tabs" role="tablist" aria-label="Cosmetic categories">
        {([["featured", "Featured", <Star key="s" />], ["all", "All", <LayoutGrid key="l" />], ...COSMETIC_SLOTS.map((s) => [s, SLOT_LABEL[s], SLOT_ICON[s]])] as [Tab, string, ReactNode][]).map(([id, label, icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`st-tab ${tab === id ? "is-on" : ""}`} onClick={() => setTab(id)}>
            {icon}{label}{id !== "featured" && <span className="n">{counts[id]}</span>}
          </button>
        ))}
      </div>

      {!items.length ? (
        <div className="st-panel mt-6 flex flex-col items-center px-6 py-16 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {COSMETIC_SLOTS.map((s) => <span key={s} className="slot-well flex h-14 w-14 items-center justify-center text-dim [&>svg]:h-6 [&>svg]:w-6">{SLOT_ICON[s]}</span>)}
          </div>
          <p className="mt-6 text-[22px] font-extrabold tracking-tight">New cosmetics are on the way.</p>
          <p className="mt-2 max-w-[440px] text-mute">Native hats, glasses, wings and shoes are being made right now. They’ll show up here, in the launcher store and in your locker the moment they drop.</p>
          <PxLink href="/cloaks" variant="ghost" className="mt-6">Browse cloaks</PxLink>
        </div>
      ) : grid ? (
        <section className="mt-6" aria-label="Cosmetics">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-mute"><b className="text-fg">{list.length}</b> {list.length === 1 ? "piece" : "pieces"}{tab !== "all" && tab !== "featured" ? ` in ${SLOT_NAMES[tab]}` : ""}{needle ? ` for “${q.trim()}”` : ""}</p>
            <SortSeg value={sort} onChange={setSort} />
          </div>
          {list.length ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {list.map((it, i) => (
                <motion.li key={it.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.03, ease: [0.16, 1, 0.3, 1] }}>{card(it)}</motion.li>
              ))}
            </ul>
          ) : (
            <div className="st-panel flex flex-col items-center px-6 py-14 text-center">
              <p className="text-[22px] font-extrabold tracking-tight">Nothing matches that.</p>
              <p className="mt-2 text-mute">Try another slot or search.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {row("Featured", featured, () => open("all"))}

          <section className="mt-12" aria-label="Discover">
            <h2 className="st-h2 mb-4">Discover</h2>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
              {pick && (
                <div className="st-card flex min-h-[260px] flex-col justify-between p-7" style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${SLOT_COLOR[pick.slot as CosmeticSlot]} 16%, var(--bg)), var(--bg) 80%)` }}>
                  <span className="st-tag is-inv w-fit">Pick of the week</span>
                  {shot(pick, "cutout-sm pointer-events-none absolute right-6 top-1/2 h-[170px] w-[170px] -translate-y-1/2 object-contain max-sm:opacity-30")}
                  <div className="relative">
                    <h3 className="text-[26px] font-extrabold tracking-tight">{pick.name}</h3>
                    <p className="mt-1 max-w-[300px] text-[14px] text-mute">{pick.description || "Fresh from the Native workshop."}</p>
                    <PxLink href={`/cosmetics/${pick.id}`} variant="ghost" className="mt-5">Discover now <Sparkles /></PxLink>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {COSMETIC_SLOTS.map((s) => {
                  const lead = sortItems(items.filter((i) => i.slot === s))[0];
                  return (
                    <button key={s} onClick={() => open(s)} className="st-card flex min-h-[122px] flex-col justify-end p-4 text-left" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${SLOT_COLOR[s]} 20%, var(--bg)), var(--bg) 85%)` }}>
                      {lead && shot(lead, "pointer-events-none absolute -right-1 top-2 h-[84px] w-[84px] object-contain opacity-90")}
                      <span className="relative text-[16px] font-bold tracking-tight">{SLOT_LABEL[s]}</span>
                      <span className="relative text-[12.5px] text-mute">{counts[s] ? `${counts[s]} ${counts[s] === 1 ? "piece" : "pieces"}` : "Coming soon"} · {SLOT_BLURB[s]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Link href="/cloaks" className="st-card mt-4 flex flex-row items-center justify-between gap-4 p-6 sm:p-7">
              <span>
                <span className="block text-[20px] font-extrabold tracking-tight">Complete your look with a cloak</span>
                <span className="mt-1 block text-[14px] text-mute">Animated and classic cloaks that sit right behind your new gear.</span>
              </span>
              <span className="pxb is-light is-sm shrink-0"><span className="pxb-face">Browse cloaks <ArrowRight /></span></span>
            </Link>
          </section>

          {row("New cosmetics", fresh, () => open("all", "new"), <Clock className="h-4 w-4 text-dim" />)}
          {row("Trending", trending, () => open("all", "popular"), <Flame className="h-4 w-4 text-dim" />)}

          {spot.length > 0 && (
            <section className="mt-12" aria-label="Spotlight">
              <h2 className="st-h2 mb-4">Spotlight</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {spot.map((it) => (
                  <li key={it.id}>
                    <Link href={`/cosmetics/${it.id}`} className="st-card flex flex-row items-center gap-5 p-5" style={{ background: `linear-gradient(110deg, color-mix(in srgb, ${SLOT_COLOR[it.slot as CosmeticSlot]} 24%, var(--bg)), color-mix(in srgb, ${SLOT_COLOR[it.slot as CosmeticSlot]} 8%, var(--bg)) 70%)` }}>
                      <span className="flex h-[88px] w-[88px] shrink-0 items-center justify-center">{shot(it, "cutout-sm h-full w-full object-contain")}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">{SLOT_LABEL[it.slot as CosmeticSlot]}</span>
                        <span className="mt-0.5 block truncate text-[20px] font-extrabold tracking-tight">{it.name}</span>
                        <span className="mt-0.5 line-clamp-1 block text-[13px] text-mute">{it.description}</span>
                        <span className="mt-2 flex items-center justify-between gap-3">
                          <span className="font-mono text-[14px] font-bold">{priceOf(it)}</span>
                          <span className="pxb is-ghost is-sm"><span className="pxb-face">View <ArrowRight /></span></span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
