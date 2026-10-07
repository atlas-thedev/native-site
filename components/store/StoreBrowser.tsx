"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, ChevronRight, CircleDot, Crown, Feather, Film, Footprints, Gift, Glasses, Hand, Heart, LayoutGrid, Loader2, Lock, Pause, Play, RotateCcw, RotateCw, Search, Shirt, ShoppingBag, Sparkles, Star, Tag, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./store.css";
import CapeStrip from "../CapeStrip";
import LockerViewer from "../LockerViewer";
import WornShot from "../cosmetics/WornShot";
import WishHeart from "./WishHeart";
import SortMenu from "../capes/SortMenu";
import { PixelCape } from "../icons";
import { PxButton, PxLink, Toast, type ToastMsg } from "../ui/Px";
import { storeAction } from "../capes/actions";
import { useWishlist } from "./wishlist";
import { useLaunch } from "../launch/LaunchContext";
import type { Worn } from "../cosmetics/CosmeticViewer";
import { COSMETIC_SLOTS, SIDED_SLOTS, isCosmetic, isPaid, money, priceNow, sortBy, sortItems, type CosmeticSlot, type Owned, type Sides, type SortKey, type StoreItem, type Wearing } from "@/lib/store";

/** A store category: cloaks or one cosmetic slot. */
export type Cat = "capes" | CosmeticSlot;
export type CatOrAll = "all" | Cat;
export const CATS: Cat[] = ["capes", ...COSMETIC_SLOTS];
export const CAT: Record<Cat, { label: string; one: string; tint: string; icon: ReactNode; blurb: string }> = {
  capes: { label: "Cloaks", one: "Cloak", tint: "#b48cff", icon: <PixelCape />, blurb: "Animated and classic cloaks" },
  hats: { label: "Headwear", one: "Headwear", tint: "#ff8a7a", icon: <Crown />, blurb: "Crowns, caps, halos and helmets" },
  glasses: { label: "Glasses", one: "Glasses", tint: "#7fb2ff", icon: <Glasses />, blurb: "Shades, visors and specs" },
  back: { label: "Wings & Backpacks", one: "Back item", tint: "#9fe0ff", icon: <Feather />, blurb: "Wings, jetpacks and packs" },
  shoes: { label: "Shoes", one: "Shoes", tint: "#ffb45c", icon: <Footprints />, blurb: "Sneakers and rocket boots" },
  hand: { label: "In hand", one: "Hand item", tint: "#d7a6ff", icon: <Hand />, blurb: "Swords, lanterns and gadgets" },
  balloon: { label: "Balloons", one: "Balloon", tint: "#ff9ec7", icon: <CircleDot />, blurb: "Floating companions" },
};
export const catOf = (it: StoreItem): Cat => (isCosmetic(it) ? (it.slot as CosmeticSlot) : "capes");
export const hrefOf = (it: StoreItem) => `/${isCosmetic(it) ? "cosmetics" : "cloaks"}/${it.id}`;
const moves = (it: StoreItem) => (isCosmetic(it) ? !!it.motion : it.animated);
const onSale = (it: StoreItem) => isPaid(it) && typeof it.salePrice === "number" && it.salePrice < it.price;
const tint = (c: Cat) => ({ "--tint": CAT[c].tint }) as CSSProperties;

type Filter = "all" | "free" | "paid" | "sale" | "moving" | "new" | "owned" | "wish";
type Props = {
  items: StoreItem[];
  signedIn: boolean;
  owned: Owned[];
  equipped: string | null;
  wearing: Wearing;
  sides: Sides;
  skin: string | null;
  model: "default" | "slim";
  initialCat?: CatOrAll;
  banner?: ReactNode;
};

/** What a slot shows in the fitting room: an item id, or null for nothing. `undefined` = keep what the account wears. */
type TryOn = Partial<Record<Cat, string | null>>;

const useWide = () => {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1280px)");
    const on = () => setWide(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
};

/** The price line of a card / panel. */
export function Price({ it, big = false }: { it: StoreItem; big?: boolean }) {
  const cls = `sx-price ${big ? "!text-[17px]" : ""}`;
  if (it.exclusive) return <span className={cls}>Event only</span>;
  if (!isPaid(it)) return <span className={`${cls} is-free`}>Free</span>;
  return <span className={cls}>{money(priceNow(it))}{onSale(it) && <s>{money(it.price)}</s>}</span>;
}

/** The art of an item: the front of a cloak, or a cosmetic worn on your skin. */
function Art({ it, skin, model, size }: { it: StoreItem; skin: string | null; model: "default" | "slim"; size: number }) {
  if (!isCosmetic(it)) return <CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={Math.round(size * 0.42)} label={`${it.name} cloak`} className="cutout-sm drop-shadow-[0_10px_14px_rgb(0_0_0/0.45)]" />;
  return <ShotOrSkeleton it={it} skin={skin} model={model} size={size} />;
}

/** A worn shot; until it is drawn, a shimmer instead of the raw texture atlas (which is what most imports use as a thumbnail). */
function ShotOrSkeleton({ it, skin, model, size }: { it: StoreItem; skin: string | null; model: "default" | "slim"; size: number }) {
  const flat = !it.stillUrl || it.stillUrl === it.textureUrl;
  return (
    <span className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {flat && <span className="sx-skel absolute" aria-hidden />}
      <WornShot item={it} skin={skin} model={model} className="relative h-full w-full object-contain" hideFallback={flat} alt={`${it.name}`} />
    </span>
  );
}

export default function StoreBrowser({ items, signedIn, owned: ownedIn, equipped: equippedIn, wearing: wearingIn, sides, skin, model, initialCat = "all", banner }: Props) {
  const wide = useWide();
  const { launch } = useLaunch();
  const [cat, setCat] = useState<CatOrAll>(initialCat);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [q, setQ] = useState("");
  const [owned, setOwned] = useState<Set<string>>(() => new Set(ownedIn.map((o) => o.id)));
  const [equipped, setEquipped] = useState<string | null>(equippedIn);
  const [wearing, setWearing] = useState<Wearing>(wearingIn);
  const [tryOn, setTryOn] = useState<TryOn>({});
  const [focus, setFocus] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<ToastMsg>(null);
  const wish = useWishlist(signedIn);
  const byId = useMemo(() => new Map(items.map((it) => [it.id, it])), [items]);

  // keep ?c= in the address bar so a category can be linked to
  useEffect(() => {
    const url = new URL(window.location.href);
    if (cat === "all") url.searchParams.delete("c"); else url.searchParams.set("c", cat);
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [cat]);

  const counts = useMemo(() => {
    const c = { all: items.length } as Record<CatOrAll, number>;
    for (const k of CATS) c[k] = items.filter((it) => catOf(it) === k).length;
    return c;
  }, [items]);
  // when (almost) everything is new the badge is noise: only show it when it means something
  const newMeans = useMemo(() => items.filter((it) => it.isNew).length <= items.length * 0.4, [items]);
  const movesMeans = useMemo(() => items.filter(moves).length <= items.length * 0.4, [items]);
  const inCat = useMemo(() => items.filter((it) => cat === "all" || catOf(it) === cat), [items, cat]);
  const pass = useCallback((it: StoreItem, f: Filter) => {
    if (f === "free") return !it.exclusive && !isPaid(it);
    if (f === "paid") return isPaid(it);
    if (f === "sale") return onSale(it);
    if (f === "moving") return moves(it);
    if (f === "new") return !!it.isNew;
    if (f === "owned") return owned.has(it.id);
    if (f === "wish") return wish.has(it.id);
    return true;
  }, [owned, wish]);
  const needle = q.trim().toLowerCase();
  const list = useMemo(() => {
    const f = inCat.filter((it) => pass(it, filter) && (!needle || [it.name, it.description, it.author, CAT[catOf(it)].label, ...it.tags].some((v) => String(v ?? "").toLowerCase().includes(needle))));
    return sortBy(f, sort);
  }, [inCat, pass, filter, needle, sort]);
  const filters: { id: Filter; label: string; icon: ReactNode; show: boolean }[] = [
    { id: "all", label: "Everything", icon: <LayoutGrid />, show: true },
    { id: "free", label: "Free", icon: <Gift />, show: true },
    { id: "paid", label: "Paid", icon: <Tag />, show: inCat.some(isPaid) },
    { id: "sale", label: "On sale", icon: <Sparkles />, show: inCat.some(onSale) },
    { id: "moving", label: "Animated", icon: <Film />, show: inCat.some(moves) },
    { id: "new", label: "New", icon: <Star />, show: inCat.some((it) => it.isNew) },
    { id: "owned", label: "Owned", icon: <Check />, show: signedIn },
    { id: "wish", label: "Wishlist", icon: <Heart />, show: signedIn },
  ];
  const shelves = cat === "all" && filter === "all" && !needle && sort === "featured";

  // ---------- the fitting room ----------
  const realOf = (c: Cat): string | null => (c === "capes" ? equipped : wearing[c] ?? null);
  const outfitOf = (c: Cat): string | null => (tryOn[c] !== undefined ? tryOn[c]! : realOf(c));
  const tryItem = (it: StoreItem) => {
    const c = catOf(it);
    const on = outfitOf(c) === it.id && focus === it.id;
    setTryOn((t) => ({ ...t, [c]: on ? (realOf(c) === it.id ? null : realOf(c)) : it.id }));
    setFocus(on ? null : it.id);
  };
  const clearSlot = (c: Cat) => {
    setTryOn((t) => ({ ...t, [c]: null }));
    if (focus && byId.get(focus) && catOf(byId.get(focus)!) === c) setFocus(null);
  };
  const reset = () => { setTryOn({}); setFocus(null); };
  const trying = (Object.keys(tryOn) as Cat[]).filter((c) => tryOn[c] !== realOf(c));
  const focusItem = focus ? byId.get(focus) ?? null : null;

  const capeItem = (() => { const id = outfitOf("capes"); return id ? byId.get(id) ?? null : null; })();
  const worn: Worn[] = COSMETIC_SLOTS.map((s) => { const id = outfitOf(s); return id ? byId.get(id) : undefined; })
    .filter((it): it is StoreItem => !!it && !!it.modelUrl && !!it.textureUrl)
    .map((it) => ({ id: it.id, modelUrl: it.modelUrl!, textureUrl: it.textureUrl!, slot: it.slot, side: it.slot && SIDED_SLOTS.includes(it.slot) ? sides[it.slot] ?? null : null }));

  // ---------- actions ----------
  const storeLocked = launch.lockStore && launch.prelaunch;
  const run = async (key: string, fn: () => Promise<string>) => {
    if (busy) return;
    setBusy(key);
    try { setMsg({ t: "ok", s: await fn() }); } catch (e) { setMsg({ t: "err", s: e instanceof Error ? e.message : "Something went wrong. Try again." }); } finally { setBusy(null); }
  };
  const applyResult = (r: { equipped: string | null; wearing: Wearing; owned?: Owned[] }) => {
    setEquipped(r.equipped);
    setWearing(r.wearing);
    if (r.owned) setOwned(new Set(r.owned.map((o) => o.id)));
  };
  const wearIt = async (it: StoreItem) => {
    if (!owned.has(it.id)) {
      const c = await storeAction("claim", it.id);
      setOwned((o) => new Set([...o, it.id, ...(c.owned ?? []).map((x) => x.id)]));
    }
    const r = await storeAction("equip", it.id, isCosmetic(it) ? (it.slot as CosmeticSlot) : undefined);
    applyResult(r);
    setTryOn((t) => { const n = { ...t }; delete n[catOf(it)]; return n; });
  };
  const takeOff = async (c: Cat) => {
    const r = await storeAction("equip", null, c === "capes" ? undefined : c);
    applyResult(r);
    setTryOn((t) => { const n = { ...t }; delete n[c]; return n; });
  };
  /** Free or owned: can go straight on. Paid and not owned: needs the item page (checkout). */
  const wearable = (it: StoreItem) => owned.has(it.id) || (!it.exclusive && !isPaid(it) && !storeLocked);
  const outfitReady = signedIn && trying.length > 0 && trying.every((c) => { const id = tryOn[c]; const it = id ? byId.get(id) : null; return id === null || (!!it && wearable(it)); });
  const wearOutfit = () => run("outfit", async () => {
    for (const c of trying) {
      const id = tryOn[c];
      if (id === null || id === undefined) await takeOff(c);
      else { const it = byId.get(id); if (it) await wearIt(it); }
    }
    setFocus(null);
    return "Outfit saved. You’re wearing it in the launcher and in game.";
  });

  const actionFor = (it: StoreItem) => {
    const c = catOf(it);
    const isOn = realOf(c) === it.id;
    const spin = <Loader2 className="animate-spin" />;
    if (!signedIn) return <PxLink href="/login?next=/store" variant="light" className="w-full"><Lock /> Sign in to wear</PxLink>;
    if (isOn) return <PxButton variant="ghost" className="w-full" disabled={!!busy} onClick={() => run(`off:${c}`, async () => { await takeOff(c); return `${it.name} taken off.`; })}>{busy === `off:${c}` ? spin : <X />} Take off</PxButton>;
    if (owned.has(it.id)) return <PxButton variant="light" className="w-full" disabled={!!busy} onClick={() => run(`wear:${it.id}`, async () => { await wearIt(it); return `You’re wearing ${it.name}.`; })}>{busy === `wear:${it.id}` ? spin : <Shirt />} Wear</PxButton>;
    if (it.exclusive) return <PxButton variant="locked" className="w-full" disabled><Star /> Events & codes only</PxButton>;
    if (isPaid(it)) return <PxLink href={hrefOf(it)} variant="gold" className="w-full"><ShoppingBag /> Get it · {money(priceNow(it))}</PxLink>;
    if (storeLocked) return <PxButton variant="locked" className="w-full" disabled><Lock /> Opens at launch</PxButton>;
    return <PxButton variant="green" className="w-full" disabled={!!busy} onClick={() => run(`wear:${it.id}`, async () => { await wearIt(it); return `${it.name} is in your locker and you’re wearing it.`; })}>{busy === `wear:${it.id}` ? spin : <Gift />} Get free & wear</PxButton>;
  };

  // ---------- cards ----------
  const card = (it: StoreItem, i: number) => {
    const c = catOf(it);
    const isTry = focus === it.id || (tryOn[c] === it.id && tryOn[c] !== realOf(c));
    const isWorn = realOf(c) === it.id;
    return (
      <motion.li key={it.id} layout="position" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i, 10) * 0.025, ease: [0.16, 1, 0.3, 1] }}>
        <div className={`sx-card group ${isTry ? "is-try" : ""} ${isWorn ? "is-worn" : ""}`}>
          <button type="button" onClick={() => (wide ? tryItem(it) : (tryItem(it), setSheet(true)))} className="sx-art w-full" aria-pressed={isTry} aria-label={`Try on ${it.name}`}>
            <span className="sx-pic"><Art it={it} skin={skin} model={model} size={190} /></span>
            <span className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
              {onSale(it) && <span className="sx-badge is-sale">−{Math.round((1 - priceNow(it) / it.price) * 100)}%</span>}
              {it.isNew && newMeans && <span className="sx-badge is-new">New</span>}
              {it.exclusive && <span className="sx-badge is-gold">Event</span>}
            </span>
            <span className="absolute bottom-2.5 left-2.5 flex gap-1.5 group-hover:opacity-0">
              {owned.has(it.id) ? <span className="sx-badge is-own">{isWorn ? "Wearing" : "Owned"}</span> : moves(it) && movesMeans ? <span className="sx-badge">Animated</span> : null}
            </span>
            <span className="sx-try">{isTry ? <><Check /> Trying on</> : <><Shirt /> Try on</>}</span>
          </button>
          <span className="absolute right-2.5 top-2.5"><WishHeart itemId={it.id} signedIn={signedIn} /></span>
          <Link href={hrefOf(it)} className="sx-foot group/foot">
            <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold group-hover/foot:underline">{it.name}</span>
            <span className="sx-div" aria-hidden />
            <Price it={it} />
          </Link>
        </div>
      </motion.li>
    );
  };
  const grid = (rows: StoreItem[]) => <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">{rows.map(card)}</ul>;

  const pickCat = (c: CatOrAll) => { setCat(c); setFilter("all"); };

  // ---------- fitting room panel ----------
  const room = (
    <div className="sx-room">
      <Room skin={skin} model={model} cape={capeItem} worn={worn} />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-dim">Fitting room</p>
          {trying.length > 0 && <button onClick={reset} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-mute hover:text-fg"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>}
        </div>
        {focusItem ? (
          <div className="mt-3">
            <span className="sx-kind">{CAT[catOf(focusItem)].one}</span>
            <div className="mt-1 flex items-start justify-between gap-3">
              <h3 className="text-[20px] font-extrabold leading-tight tracking-tight">{focusItem.name}</h3>
              <Price it={focusItem} big />
            </div>
            {focusItem.description && <p className="mt-1.5 line-clamp-2 text-[13.5px] text-mute">{focusItem.description}</p>}
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              {actionFor(focusItem)}
              <PxLink href={hrefOf(focusItem)} variant="ghost" title="Open the item page">Details <ChevronRight /></PxLink>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[13.5px] leading-relaxed text-mute">Tap anything in the store to try it on. Mix cloaks with hats, wings and more, then wear the whole look in one go.</p>
        )}
        <ul className="mt-4 border-t-2 border-line pt-3">
          {CATS.map((c) => {
            const id = outfitOf(c);
            const it = id ? byId.get(id) : null;
            if (!it) return null;
            const changed = tryOn[c] !== undefined && tryOn[c] !== realOf(c);
            return (
              <li key={c} className="sx-room-row">
                <span className="sx-ico">{CAT[c].icon}</span>
                <button onClick={() => setFocus(it.id)} className="min-w-0 flex-1 truncate text-left font-semibold">{it.name}</button>
                <span className={`sx-badge ${changed ? "is-inv" : "is-own"}`}>{changed ? "Trying" : "Wearing"}</span>
                <button onClick={() => clearSlot(c)} className="sx-iconbtn" aria-label={`Take off ${it.name}`} title="Take off"><X /></button>
              </li>
            );
          })}
          {CATS.every((c) => !outfitOf(c)) && <li className="px-2.5 py-2 text-[13px] text-dim">Nothing on yet.</li>}
        </ul>
        {trying.length > 0 && signedIn && (
          <PxButton variant={outfitReady ? "light" : "locked"} className="mt-3 w-full" disabled={!outfitReady || !!busy} onClick={wearOutfit} title={outfitReady ? undefined : "Some pieces are paid: get them on their item page first."}>
            {busy === "outfit" ? <Loader2 className="animate-spin" /> : <Shirt />} Wear this outfit
          </PxButton>
        )}
      </div>
    </div>
  );

  // ---------- hero ----------
  const spotlight = useMemo(() => { const f = sortItems(items).filter((it) => it.featured); return (f.length ? f : sortItems(items)).slice(0, 6); }, [items]);

  return (
    <div>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[40px] font-extrabold leading-none tracking-tight sm:text-[48px]">Store</h1>
          <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-mute">Cloaks and 3D cosmetics for Minecraft. Try anything on your own skin, then wear it in the launcher and in game.</p>
        </div>
        <label className="sx-search sm:w-[340px]">
          <Search className="h-4 w-4 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the store…" aria-label="Search the store" />
          {q && <button onClick={() => setQ("")} aria-label="Clear search" className="text-dim hover:text-fg"><X className="h-4 w-4" /></button>}
        </label>
      </header>
      {banner}
      <div className="sx-bar mt-6">
        <div className="sx-cats" role="tablist" aria-label="Store categories">
          <button role="tab" aria-selected={cat === "all"} onClick={() => pickCat("all")} className={`sx-cat ${cat === "all" ? "is-on" : ""}`}>
            <LayoutGrid />All
          </button>
          <span className="sx-sep" aria-hidden />
          {CATS.filter((c) => counts[c] > 0).map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => pickCat(c)} className={`sx-cat ${cat === c ? "is-on" : ""}`}>
              {CAT[c].icon}{CAT[c].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="sx-cats -mx-1 min-w-0 flex-1 px-1 sm:flex-wrap" role="group" aria-label="Filters">
              {filters.filter((f) => f.show).map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={`sx-chip ${filter === f.id ? "is-on" : ""}`}>
                  {f.icon}{f.label}{f.id !== "all" && <span className="n">{inCat.filter((it) => pass(it, f.id)).length}</span>}
                </button>
              ))}
            </div>
            <SortMenu value={sort} onChange={setSort} />
          </div>

          {!items.length ? (
            <Empty title="The store is getting stocked." text="Cloaks and 3D cosmetics show up here, in the launcher and in your locker the moment they drop." />
          ) : shelves ? (
            <>
            {spotlight.length > 0 && (
              <section className="mt-6" aria-label="Featured">
                <div className="mb-3.5 flex items-center justify-between gap-3">
                  <h2 className="text-[24px] font-extrabold tracking-tight">Featured</h2>
                </div>
                {grid(spotlight.slice(0, 4))}
              </section>
            )}
            {CATS.filter((c) => counts[c] > 0).map((c) => {
              const rows = sortItems(items.filter((it) => catOf(it) === c));
              return (
                <section key={c} className="mt-12" aria-label={CAT[c].label}>
                  <div className="mb-3.5 flex items-center justify-between gap-3">
                    <h2 className="text-[24px] font-extrabold tracking-tight">{CAT[c].label}</h2>
                    {rows.length > 4 && <button onClick={() => { pickCat(c); document.querySelector(".sx-bar")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="sx-more">View all <ArrowRight /></button>}
                  </div>
                  {grid(rows.slice(0, wide ? 8 : 6))}
                </section>
              );
            })}
            </>
          ) : (
            <section className="mt-5" aria-label="Results">
              <p className="mb-3.5 text-[13.5px] text-mute"><b className="text-fg">{list.length}</b> {list.length === 1 ? "item" : "items"}{cat !== "all" ? ` in ${CAT[cat].label}` : ""}{needle ? ` for “${q.trim()}”` : ""}</p>
              {list.length ? grid(list) : <Empty title="Nothing matches that." text="Try another category, filter or search." action={<PxButton variant="ghost" onClick={() => { setQ(""); setFilter("all"); setCat("all"); }}>Show everything</PxButton>} />}
            </section>
          )}
        </div>

        {wide && <aside className="hidden xl:block"><div className="sticky top-[140px]">{room}</div></aside>}
      </div>

      {!wide && (
        <>
          <AnimatePresence>
            {!sheet && (trying.length > 0 || focusItem) && (
              <motion.div key="dock" className="sx-dock" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
                <Shirt className="h-4 w-4 shrink-0 text-mute" />
                <span className="min-w-0 truncate text-[13.5px] font-semibold">{focusItem ? focusItem.name : `${trying.length} trying on`}</span>
                <PxButton size="sm" variant="light" onClick={() => setSheet(true)}>Fitting room</PxButton>
                <button onClick={reset} className="sx-iconbtn" aria-label="Reset the fitting room"><X /></button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {sheet && <motion.div key="scrim" className="fixed inset-0 z-[65] bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />}
            {sheet && (
                <motion.div key="sheet" className="sx-sheet" role="dialog" aria-modal="true" aria-label="Fitting room" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
                  <div className="flex items-center justify-between px-4 pb-2 pt-3">
                    <span className="mx-auto h-1.5 w-12 rounded-full bg-line" aria-hidden />
                  </div>
                  <button onClick={() => setSheet(false)} className="sx-iconbtn absolute right-3 top-3 z-10" aria-label="Close"><X /></button>
                  <div className="px-3 pb-6">{room}</div>
                </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}

/** The 3D player in the fitting room: your skin with the cloak and every cosmetic you're trying on. */
function Room({ skin, model, cape, worn }: { skin: string | null; model: "default" | "slim"; cape: StoreItem | null; worn: Worn[] }) {
  const [walk, setWalk] = useState(true);
  const [spin, setSpin] = useState(false);
  const skinUrl = skin ?? (model === "slim" ? "/skins/alex.png" : "/skins/steve.png");
  return (
    <div className="sx-room-stage">
      <LockerViewer
        skin={skinUrl}
        model={model}
        cape={cape?.stillUrl ?? null}
        capeAnim={cape?.animated && cape.stripUrl ? { url: cape.stripUrl, frames: cape.frames, fps: cape.fps } : null}
        worn={worn}
        walk={walk}
        spin={spin}
        showCape
        layers
      />
      <div className="absolute bottom-2.5 left-2.5 flex gap-1 rounded-[10px] border-2 border-line bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] p-1 backdrop-blur">
        <button onClick={() => setWalk((w) => !w)} className={`sx-iconbtn ${walk ? "is-on" : ""}`} aria-pressed={walk} title={walk ? "Stand still" : "Walk"} aria-label="Walk">{walk ? <Pause /> : <Play />}</button>
        <button onClick={() => setSpin((s) => !s)} className={`sx-iconbtn ${spin ? "is-on" : ""}`} aria-pressed={spin} title="Spin" aria-label="Spin"><RotateCw /></button>
      </div>
      <span className="pointer-events-none absolute bottom-4 right-3 text-[11.5px] font-semibold text-dim">Drag to turn</span>
    </div>
  );
}


function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="st-panel mt-6 flex flex-col items-center px-6 py-16 text-center">
      <ShoppingBag className="h-8 w-8 text-dim" />
      <p className="mt-5 text-[22px] font-extrabold tracking-tight">{title}</p>
      <p className="mt-2 max-w-[440px] text-mute">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

