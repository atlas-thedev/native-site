"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Crown, Footprints, Loader2, Lock, Minus, Plus, RefreshCcw, RotateCcw, Search, ShoppingBag, Sparkles, Undo2, Users, X, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CosmeticViewer, { type CosmeticViewerHandle, type Worn } from "./CosmeticViewer";
import { ownerLabel, storeAction, type StoreAction } from "../capes/actions";
import { getBilling, startCheckout, type BillingState } from "../capes/billing";
import { useLaunch } from "../launch/LaunchContext";
import { COSMETIC_SLOTS, SLOT_NAMES, isPaid, money, priceNow, type CosmeticSlot, type Owned, type StoreItem, type Wearing } from "@/lib/store";

type Props = {
  items: StoreItem[];
  signedIn: boolean;
  owned: Owned[];
  wearing: Wearing;
  skin: string | null;
  model: "default" | "slim";
  /** the cloak the account wears (still), shown with the Cloak toggle */
  cape: string | null;
  initialId?: string | null;
};
type Tab = "all" | CosmeticSlot;
type Outfit = Partial<Record<CosmeticSlot, string>>;

// Each tab has its own slab colour, like the launcher Locker (same style, different colours).
const TAB_COLOR: Record<Tab, string> = { all: "#f2f2f4", hats: "#ff8a7a", glasses: "#7fb2ff", back: "#9fe0ff", shoes: "#ffb45c" };
const SHORT: Record<CosmeticSlot, string> = { hats: "Hat", glasses: "Glasses", back: "Back", shoes: "Shoes" };
const TAB_LABEL: Record<CosmeticSlot, string> = { hats: "Hats", glasses: "Glasses", back: "Wings", shoes: "Shoes" };
const toggle = (on: boolean) => `inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition ${on ? "bg-inv text-inv-fg" : "text-mute hover:bg-surface-2 hover:text-fg"}`;
const primary = "nx-pill nx-pill-accent h-12 px-6 text-[15px] disabled:opacity-60";
const ghost = "nx-pill nx-pill-ghost h-12 px-5 text-[15px] disabled:opacity-60";

const slotOf = (it: StoreItem) => it.slot as CosmeticSlot;
const priceText = (it: StoreItem) => (it.exclusive ? "Event" : isPaid(it) ? money(priceNow(it)) : "Free");

/** The cosmetics fitting room: a 3D try-on stage, slot rail and the full cosmetics wall. */
export default function CosmeticsStudio({ items, signedIn, owned: initialOwned, wearing: initialWearing, skin, model, cape, initialId }: Props) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const clean = (o: Outfit) => Object.fromEntries(Object.entries(o).filter(([s, id]) => id && byId.get(id)?.slot === s)) as Outfit;
  const [owned, setOwned] = useState(initialOwned);
  const [wearing, setWearing] = useState<Wearing>(() => clean(initialWearing));
  const start = initialId ? byId.get(initialId) : undefined;
  const [outfit, setOutfit] = useState<Outfit>(() => {
    const o = clean(initialWearing);
    if (start) o[slotOf(start)] = start.id;
    return o;
  });
  const [selected, setSelected] = useState<string | null>(start?.id ?? items[0]?.id ?? null);
  const [tab, setTab] = useState<Tab>(start ? slotOf(start) : "all");
  const [focus, setFocus] = useState<CosmeticSlot | null>(start ? slotOf(start) : null);
  const [q, setQ] = useState("");
  const [walk, setWalk] = useState(false);
  const [spin, setSpin] = useState(!start);
  const [showCape, setShowCape] = useState(false);
  const [owners, setOwners] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; s: string } | null>(null);
  const [bill, setBill] = useState<BillingState | null>(null);
  const viewer = useRef<CosmeticViewerHandle>(null);
  const { launch } = useLaunch();

  const mine = useMemo(() => new Set(owned.map((o) => o.id)), [owned]);
  const anyPaid = items.some(isPaid);
  const member = !!bill?.plus?.active;
  const sellable = !!bill?.config?.enabled;
  const item = selected ? byId.get(selected) ?? null : null;

  useEffect(() => {
    if (anyPaid && signedIn) getBilling().then(setBill).catch(() => {});
  }, [anyPaid, signedIn]);

  // stay honest if the look changes in the launcher meanwhile
  useEffect(() => {
    if (!signedIn) return;
    const sync = () =>
      fetch("/api/store", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!d?.signedIn) return;
          if (d.wearing) setWearing(clean(d.wearing));
          if (Array.isArray(d.owned)) setOwned(d.owned);
        })
        .catch(() => {});
    const onVis = () => !document.hidden && sync();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: items.length, hats: 0, glasses: 0, back: 0, shoes: 0 };
    for (const it of items) c[slotOf(it)]++;
    return c;
  }, [items]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => (tab === "all" || it.slot === tab) && (!needle || [it.name, it.description, it.author, ...it.tags].some((v) => String(v ?? "").toLowerCase().includes(needle))));
  }, [items, tab, q]);

  const worn: Worn[] = COSMETIC_SLOTS.map((s) => outfit[s] && byId.get(outfit[s]!))
    .filter((it): it is StoreItem => !!it && !!it.modelUrl && !!it.textureUrl)
    .map((it) => ({ id: it.id, modelUrl: it.modelUrl!, textureUrl: it.textureUrl!, slot: it.slot }));

  const pick = (it: StoreItem) => {
    const slot = slotOf(it);
    setSelected(it.id);
    setOutfit((o) => ({ ...o, [slot]: it.id }));
    setFocus(slot);
    setSpin(false);
    setMsg(null);
  };
  const takeOffTry = (slot: CosmeticSlot) => setOutfit((o) => {
    const n = { ...o };
    delete n[slot];
    return n;
  });
  const focusSlot = (slot: CosmeticSlot) => {
    setFocus(slot);
    setTab(slot);
    setSpin(false);
    const id = outfit[slot];
    if (id) setSelected(id);
  };

  const ownersOf = (it: StoreItem) => owners[it.id] ?? it.owners ?? 0;
  const bump = (id: string, d: number) => setOwners((o) => ({ ...o, [id]: Math.max(0, (o[id] ?? byId.get(id)?.owners ?? 0) + d) }));

  const run = async (action: StoreAction, it: StoreItem, off = false) => {
    const slot = slotOf(it);
    const key = `${action}${off ? "-off" : ""}`;
    setBusy(key);
    setMsg(null);
    const had = mine.has(it.id);
    try {
      const r = await storeAction(action, off ? null : it.id, off ? slot : undefined);
      setWearing(clean(r.wearing));
      if (r.owned) setOwned(r.owned);
      else if (!had && (action === "claim" || (action === "equip" && !off))) setOwned((o) => [{ id: it.id, acquiredAt: Date.now() }, ...o]);
      if (!had && (action === "claim" || (action === "equip" && !off))) bump(it.id, 1);
      if (action === "unclaim") bump(it.id, -1);
      if (action === "equip" && !off) setOutfit((o) => ({ ...o, [slot]: it.id }));
      setMsg({
        t: "ok",
        s:
          action === "claim" ? `${it.name} is in your locker. Wear it here or from the launcher.`
          : action === "unclaim" ? `${it.name} was removed from your locker.`
          : off ? `${it.name} is off.`
          : `${it.name} is on. Friends see it in the launcher and in game.`,
      });
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  /** Wears every tried-on piece the account can wear right now (owned or free). */
  const wearLook = async () => {
    setBusy("look");
    setMsg(null);
    let on = 0;
    let skipped = 0;
    try {
      let w = wearing;
      for (const s of COSMETIC_SLOTS) {
        const it = outfit[s] ? byId.get(outfit[s]!) : undefined;
        if (!it || w[s] === it.id) continue;
        const can = mine.has(it.id) || (!it.exclusive && (!isPaid(it) || member) && !(launch.lockStore && !mine.has(it.id)));
        if (!can) {
          skipped++;
          continue;
        }
        const r = await storeAction("equip", it.id);
        w = clean(r.wearing);
        setWearing(w);
        if (r.owned) setOwned(r.owned);
        on++;
      }
      setMsg({ t: "ok", s: on ? `Look saved${skipped ? `. ${skipped} paid or event piece${skipped === 1 ? " wasn’t" : "s weren’t"} added` : ""}. Friends see it in the launcher and in game.` : skipped ? "Those pieces need buying or Native+ first." : "You’re already wearing this look." });
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  const lookDiffers = COSMETIC_SLOTS.some((s) => (outfit[s] ?? null) !== (wearing[s] ?? null));
  const spinner = (k: string) => busy === k && <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:grid-rows-[auto_1fr]">
      <div className="lg:col-start-2 lg:row-start-1">
        <h1 id="cos-title" className="text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-[1] tracking-[-0.04em]">Cosmetics</h1>
        <p className="mt-3 max-w-[520px] text-[15.5px] text-mute">Hats, glasses, wings, backpacks and shoes in real 3D. Try any mix on, then wear it in the launcher and in game.</p>
      </div>

      {/* Stage */}
      <div className="lg:sticky lg:top-24 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
      <section aria-label="Fitting room" className="nx-panel flex h-[560px] flex-col sm:h-[680px] lg:h-[calc(100vh-120px)] lg:max-h-[760px] lg:min-h-[600px]">
        <div aria-hidden className="stage-floor pointer-events-none absolute inset-x-0 bottom-0 h-[24%]" />

        <div className="absolute inset-0">
          <CosmeticViewer ref={viewer} skin={skin ?? (model === "slim" ? "/skins/alex.png" : "/skins/steve.png")} model={model} cape={showCape ? cape : null} worn={worn} walk={walk} spin={spin} focus={focus} />
        </div>

        <div className="pointer-events-none relative flex items-start justify-between p-5 sm:p-6">
          <div>
            <p className="eyebrow">Fitting room</p>
            <p className="mt-2 text-[22px] font-extrabold tracking-tight sm:text-[26px]">{worn.length ? `${worn.length} piece${worn.length === 1 ? "" : "s"} on` : "Try something on"}</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => viewer.current?.zoom(1 / 1.25)} aria-label="Zoom out" title="Zoom out" className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg text-mute transition hover:text-fg"><ZoomOut className="h-4 w-4" /></button>
            <button onClick={() => viewer.current?.zoom(1.25)} aria-label="Zoom in" title="Zoom in" className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg text-mute transition hover:text-fg"><ZoomIn className="h-4 w-4" /></button>
            <button onClick={() => viewer.current?.reset()} aria-label="Reset camera" title="Reset camera" className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg text-mute transition hover:text-fg"><RotateCcw className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Equipment column: one inventory slot per body part */}
        <ul className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-2.5 sm:right-5" aria-label="Your outfit">
          {COSMETIC_SLOTS.map((s) => {
            const it = outfit[s] ? byId.get(outfit[s]!) : undefined;
            const active = focus === s;
            const on = !!it && wearing[s] === it.id;
            return (
              <li key={s} className="group relative">
                <button onClick={() => focusSlot(s)} title={it ? `${SLOT_NAMES[s]}: ${it.name}` : `${SLOT_NAMES[s]}: empty`} aria-label={it ? `${SLOT_NAMES[s]}: ${it.name}` : `${SLOT_NAMES[s]}: empty`} aria-pressed={active}
                  className="flex flex-col items-center gap-1">
                  <span className={`slot-well relative flex h-12 w-12 items-center justify-center outline outline-2 outline-offset-2 transition sm:h-14 sm:w-14 ${active ? "outline-fg" : "outline-transparent hover:outline-line"}`}>
                    {it && <img src={it.stillUrl} alt="" className="h-[80%] w-[80%] object-contain [image-rendering:pixelated]" />}
                    {on && <span className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-fg" aria-hidden />}
                  </span>
                  <span className={`font-mono text-[9.5px] uppercase tracking-[0.12em] ${active ? "text-fg" : "text-dim"}`}>{SHORT[s]}</span>
                </button>
                {it && (
                  <button onClick={() => takeOffTry(s)} aria-label={`Take ${it.name} off the preview`} className="absolute -left-2.5 -top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-line bg-bg text-mute transition hover:text-fg group-hover:flex group-focus-within:flex">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* Dock */}
        <div className="relative mt-auto flex flex-col items-center gap-3 p-4 sm:p-6">
          <p className="pointer-events-none text-[12px] font-medium text-dim">Drag to turn · pick a slot to zoom in</p>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-line bg-bg p-1.5">
            <button className={toggle(walk)} onClick={() => setWalk(!walk)} aria-pressed={walk}><Footprints className="h-4 w-4" /> Walk</button>
            <button className={toggle(spin)} onClick={() => setSpin(!spin)} aria-pressed={spin}><RefreshCcw className="h-4 w-4" /> Spin</button>
            {cape && <button className={toggle(showCape)} onClick={() => setShowCape(!showCape)} aria-pressed={showCape}>Cloak</button>}
            <span aria-hidden className="mx-1 h-5 w-px bg-line" />
            <button className={toggle(false)} onClick={() => { setFocus(null); viewer.current?.reset(); }} aria-label="Whole body view">Whole body</button>
            {signedIn && lookDiffers && <button className={toggle(false)} onClick={() => setOutfit(wearing)}><Undo2 className="h-4 w-4" /> My look</button>}
            {worn.length > 0 && <button className={toggle(false)} onClick={() => setOutfit({})}><X className="h-4 w-4" /> Clear</button>}
          </div>
          {signedIn && lookDiffers && worn.length > 0 && (
            <button onClick={wearLook} disabled={!!busy} className="nx-pill nx-pill-accent h-11 px-6 text-[14.5px] disabled:opacity-60">
              {spinner("look") || <Sparkles className="h-4 w-4" />} Wear this look
            </button>
          )}
        </div>
      </section>
      </div>

      {/* Wall */}
      <section aria-labelledby="cos-title" className="flex min-w-0 flex-col gap-5 lg:col-start-2 lg:row-start-2">
        <div className="grid grid-cols-5 gap-1.5 rounded-[16px] border border-line bg-surface p-1.5" role="tablist" aria-label="Cosmetic slots">
          {(["all", ...COSMETIC_SLOTS] as Tab[]).map((t) => {
            const on = tab === t;
            return (
              <button key={t} role="tab" aria-selected={on} title={t === "all" ? "Everything" : SLOT_NAMES[t]} onClick={() => { setTab(t); if (t !== "all") { setFocus(t); setSpin(false); } }}
                className={`slab-tab ${on ? "is-on" : ""}`} style={{ "--slab": TAB_COLOR[t] } as React.CSSProperties}>
                {on && <motion.span layoutId="slab" className="slab-face" transition={{ type: "spring", stiffness: 520, damping: 30 }} />}
                <span className="relative truncate">{t === "all" ? "All" : TAB_LABEL[t]}</span>
                <span className="slab-count relative">{counts[t]}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {item && (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="card p-6">
              <Detail item={item} own={mine.has(item.id)} isOn={wearing[slotOf(item)] === item.id} owners={ownersOf(item)} signedIn={signedIn} member={member} sellable={sellable} bill={bill} busy={busy} run={run} setMsg={setMsg} storeLocked={launch.lockStore && !mine.has(item.id)} />
              <AnimatePresence mode="wait">
                {msg && (
                  <motion.p key={msg.s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role={msg.t === "err" ? "alert" : "status"} className={`mt-4 text-[14px] ${msg.t === "err" ? "font-semibold text-fg" : "text-mute"}`}>
                    {msg.s}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        {items.length > 0 && (
          <label className="flex h-11 items-center gap-2.5 rounded-full border border-line bg-surface px-4 text-mute focus-within:border-fg">
            <Search className="h-4 w-4 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cosmetics, tags or authors" aria-label="Search cosmetics" className="min-w-0 flex-1 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-dim" />
            {q && <button onClick={() => setQ("")} aria-label="Clear search" className="text-dim hover:text-fg"><X className="h-4 w-4" /></button>}
          </label>
        )}

        {list.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.map((it, i) => {
              const own = mine.has(it.id);
              const isOn = wearing[slotOf(it)] === it.id;
              const trying = outfit[slotOf(it)] === it.id;
              const sel = selected === it.id;
              return (
                <motion.li key={it.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: Math.min(i, 9) * 0.03, ease: [0.16, 1, 0.3, 1] }}>
                  <button onClick={() => pick(it)} aria-pressed={sel}
                    className={`group relative flex h-full w-full flex-col rounded-[20px] border bg-surface p-2.5 text-left transition hover:-translate-y-0.5 hover:bg-surface-2 ${sel ? "border-fg shadow-[0_0_0_3px_color-mix(in_srgb,var(--fg)_12%,transparent)]" : "border-line hover:border-fg/40"}`}>
                    <div className="dots relative flex aspect-square items-center justify-center overflow-hidden rounded-[14px]">
                      <img src={it.stillUrl} alt="" loading="lazy" className="cutout-sm h-[74%] w-[74%] object-contain transition duration-500 [image-rendering:pixelated] group-hover:scale-[1.08]" />
                      <div className="absolute left-2 top-2 flex gap-1">
                        {it.motion && <span className="rounded-full bg-inv px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-inv-fg">Moves</span>}
                        {it.isNew && !it.motion && <span className="rounded-full border border-line bg-bg/80 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider backdrop-blur">New</span>}
                      </div>
                      {trying && !isOn && <span className="absolute bottom-2 left-2 rounded-full border border-line bg-bg/85 px-2 py-0.5 text-[10px] font-semibold text-mute backdrop-blur">Trying on</span>}
                      {own && (
                        <span title={isOn ? "You’re wearing this" : "In your locker"} aria-label={isOn ? "You’re wearing this" : "In your locker"} className={`absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-bg ${isOn ? "bg-inv text-inv-fg" : "bg-surface-2 text-fg"}`}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="truncate px-1 pt-2.5 text-[14px] font-bold tracking-tight">{it.name}</p>
                    <p className="flex items-center justify-between gap-2 px-1 pb-0.5 text-[12px] text-dim">
                      <span>{SLOT_NAMES[slotOf(it)]}</span>
                      <span className="font-semibold text-mute">{priceText(it)}</span>
                    </p>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <div className="flex flex-wrap justify-center gap-2">
              {COSMETIC_SLOTS.map((s) => <span key={s} className="rounded-[8px] border border-dashed border-line px-3 py-1.5 text-[13px] font-semibold text-dim">{TAB_LABEL[s]}</span>)}
            </div>
            <p className="mt-6 text-[22px] font-extrabold tracking-tight">{items.length ? "Nothing matches that." : "The first cosmetics are on the way."}</p>
            <p className="mt-2 max-w-[420px] text-mute">{items.length ? "Try another slot or search." : "Native hats, glasses, wings and shoes are being made right now. They’ll drop here, in the launcher store and in your locker."}</p>
            {!items.length && <Link href="/cloaks" className="nx-pill nx-pill-ghost mt-6 h-11 px-5 text-[14.5px]">Browse cloaks</Link>}
          </div>
        )}

        <p className="text-[13px] text-dim">Native cosmetics show on your account everywhere: the launcher, the website and in game with the Native mod. You can wear one per slot.</p>
      </section>
    </div>
  );
}

type DetailProps = {
  item: StoreItem;
  own: boolean;
  isOn: boolean;
  owners: number;
  signedIn: boolean;
  member: boolean;
  sellable: boolean;
  bill: BillingState | null;
  busy: string | null;
  storeLocked: boolean;
  run: (a: StoreAction, it: StoreItem, off?: boolean) => void;
  setMsg: (m: { t: "ok" | "err"; s: string } | null) => void;
};

function Detail({ item, own, isOn, owners, signedIn, member, sellable, bill, busy, storeLocked, run, setMsg }: DetailProps) {
  const [buying, setBuying] = useState(false);
  const paid = isPaid(item);
  const price = priceNow(item);
  const priceLabel = item.salePrice != null ? <>{money(price)} <s className="opacity-60">{money(item.price)}</s></> : money(item.price);
  const spin = (k: string) => busy === k && <Loader2 className="h-4 w-4 animate-spin" />;
  const buy = async () => {
    setBuying(true);
    setMsg(null);
    try {
      await startCheckout({ kind: "cape", itemId: item.id });
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Couldn’t start the checkout." });
      setBuying(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="dots flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-line">
          <img src={item.stillUrl} alt="" className="h-[80%] w-[80%] object-contain [image-rendering:pixelated]" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-line px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-mute">{SLOT_NAMES[slotOf(item)]}</span>
            {item.motion && <span className="rounded-full bg-inv px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-inv-fg">Moves</span>}
            {item.exclusive && <span className="rounded-full bg-gradient-to-r from-[#d9a6da] to-[#ffd68c] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-[#160f2a]">Exclusive</span>}
            {isOn ? <span className="rounded-full bg-inv px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-inv-fg">Wearing</span> : own && <span className="rounded-full border border-line px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider">In your locker</span>}
          </div>
          <h2 className="mt-2 truncate text-[26px] font-extrabold leading-tight tracking-tight">{item.name}</h2>
          {item.description && <p className="mt-1 text-[14.5px] text-mute">{item.description}</p>}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line text-[13.5px]">
        {[
          ["Price", item.exclusive ? "Event only" : paid ? `${money(price)}${member ? " · Plus" : ""}` : "Free"],
          ["In lockers", <span key="o" className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{ownerLabel(owners)}</span>],
          ["Made by", item.author || "Native"],
        ].map(([k, v]) => (
          <div key={String(k)} className="bg-surface px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-dim">{k}</dt>
            <dd className="mt-1 truncate font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {storeLocked && !item.exclusive ? (
          <span className="inline-flex h-12 items-center gap-2 rounded-full border border-dashed border-line px-5 text-[14px] font-semibold text-mute"><Lock className="h-4 w-4" /> The store opens at launch</span>
        ) : item.exclusive && !own ? (
          <span className="inline-flex h-12 items-center gap-2 rounded-full border border-dashed border-line px-5 text-[14px] font-semibold text-mute"><Lock className="h-4 w-4" /> Event only · given by the Native team or with a code</span>
        ) : !signedIn ? (
          <>
            <Link href="/login?next=/cosmetics" className={primary}>{paid ? <><ShoppingBag className="h-4 w-4" /> Sign in to buy · {priceLabel}</> : "Sign in to add"}</Link>
            <Link href="/register?next=/cosmetics" className={ghost}>Create a free account</Link>
          </>
        ) : isOn ? (
          <button onClick={() => run("equip", item, true)} disabled={!!busy} className={ghost}>{spin("equip-off") || <X className="h-4 w-4" />} Take off</button>
        ) : own ? (
          <button onClick={() => run("equip", item)} disabled={!!busy} className={primary}>{spin("equip") || <Sparkles className="h-4 w-4" />} Wear {item.name}</button>
        ) : paid && member ? (
          <button onClick={() => run("claim", item)} disabled={!!busy} className={primary}>{spin("claim") || <Crown className="h-4 w-4" />} Add with Native+</button>
        ) : paid ? (
          <>
            <button onClick={buy} disabled={buying || !sellable} className={primary} title={sellable || !bill ? undefined : "Payments are switched on soon."}>
              {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />} {sellable || !bill ? <>Buy · {priceLabel}</> : `${money(price)} · soon`}
            </button>
            <Link href="/plus" className={ghost}><Crown className="h-4 w-4" /> Native+</Link>
          </>
        ) : (
          <>
            <button onClick={() => run("claim", item)} disabled={!!busy} className={primary}>{spin("claim") || <Plus className="h-4 w-4" />} Add to locker</button>
            <button onClick={() => run("equip", item)} disabled={!!busy} className={ghost}>{spin("equip")} Wear now</button>
          </>
        )}
        {signedIn && own && !item.exclusive && !paid && (
          <button onClick={() => run("unclaim", item)} disabled={!!busy} className="inline-flex h-12 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-mute transition hover:text-fg disabled:opacity-60">
            {spin("unclaim") || <Minus className="h-4 w-4" />} Remove
          </button>
        )}
      </div>
    </>
  );
}
