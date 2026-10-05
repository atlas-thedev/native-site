"use client";

import { AnimatePresence, motion } from "motion/react";
import { Crown, Loader2, Lock, Minus, Plus, RotateCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LockerViewer, { type ViewerHandle } from "../LockerViewer";
import { ownerLabel, storeAction, type StoreAction } from "./actions";
import { getBilling, startCheckout, type BillingState } from "./billing";
import { isPaid, money, priceNow, type Owned, type StoreItem } from "@/lib/store";
import { useLaunch } from "../launch/LaunchContext";
import Countdown from "../launch/Countdown";

type Props = {
  item: StoreItem;
  signedIn: boolean;
  owned: Owned[];
  equipped: string | null;
  skin: string | null;
  model: "default" | "slim";
};

const chip = (on: boolean) => `rounded-full border px-4 py-1.5 text-[13.5px] font-medium transition ${on ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`;
const primary = "inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-60";
const ghost = "inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-[15px] font-semibold transition hover:bg-surface-2 disabled:opacity-60";

/** One cape: big 3D preview + add to locker / wear / take off. */
export default function CapeDetail({ item, signedIn, owned: initialOwned, equipped: initialEquipped, skin, model }: Props) {
  const [owned, setOwned] = useState(initialOwned);
  const [equipped, setEquipped] = useState(initialEquipped);
  const [owners, setOwners] = useState(item.owners ?? 0);
  const [busy, setBusy] = useState<StoreAction | "off" | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; s: string } | null>(null);
  const [walk, setWalk] = useState(true);
  const [spin, setSpin] = useState(true);
  const [elytra, setElytra] = useState(false);
  const viewer = useRef<ViewerHandle>(null);
  const [bill, setBill] = useState<BillingState | null>(null);
  const [buying, setBuying] = useState(false);
  const paid = isPaid(item);
  const member = !!bill?.plus?.active;
  const sellable = !!bill?.config?.enabled;
  const own = owned.some((o) => o.id === item.id);
  const { launch } = useLaunch();
  const storeLocked = launch.lockStore && !own;
  const isFounder = launch.founderPick && launch.founderCapes.includes(item.id);
  const price = priceNow(item);
  const priceLabel = item.salePrice != null ? <>{money(price)} <s className="opacity-60">{money(item.price)}</s></> : money(item.price);

  useEffect(() => {
    if (paid) getBilling().then(setBill).catch(() => {});
  }, [paid]);

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
  const worn = equipped === item.id;

  // Stay honest if the cape changes in the launcher meanwhile.
  useEffect(() => {
    if (!signedIn) return;
    const sync = () =>
      fetch("/api/store", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!d?.signedIn) return;
          setEquipped(d.equipped ?? null);
          if (Array.isArray(d.owned)) setOwned(d.owned);
        })
        .catch(() => {});
    const onVis = () => !document.hidden && sync();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [signedIn]);

  const run = async (action: StoreAction, off = false) => {
    setBusy(off ? "off" : action);
    setMsg(null);
    try {
      const r = await storeAction(action, off ? null : item.id);
      setEquipped(r.equipped);
      if (r.owned) setOwned(r.owned);
      if (action === "claim" || (action === "equip" && !off && !own)) {
        if (!own) setOwners((n) => n + 1);
        if (!r.owned) setOwned((o) => [{ id: item.id, acquiredAt: Date.now() }, ...o]);
      }
      if (action === "unclaim") setOwners((n) => Math.max(0, n - 1));
      setMsg({
        t: "ok",
        s:
          action === "claim" ? `${item.name} is in your locker. Wear it here or from the launcher.`
          : action === "unclaim" ? `${item.name} was removed from your locker.`
          : off ? "Cape taken off."
          : `${item.name} is on — friends see it in the launcher and in game.`,
      });
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  const spinner = (k: string) => busy === k && <Loader2 className="h-4 w-4 animate-spin" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="card overflow-hidden">
        <div className="dots relative h-[440px] sm:h-[600px]">
          <LockerViewer
            ref={viewer}
            skin={skin ?? (model === "slim" ? "/skins/alex.png" : "/skins/steve.png")}
            model={model}
            cape={item.stillUrl}
            capeAnim={item.animated && item.stripUrl ? { url: item.stripUrl, frames: item.frames, fps: item.fps } : null}
            walk={walk}
            spin={spin}
            showCape
            layers
            elytra={elytra}
          />
          <button onClick={() => viewer.current?.reset()} aria-label="Reset camera" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg/70 text-mute backdrop-blur transition hover:text-fg">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line p-4">
          <button className={chip(walk)} onClick={() => setWalk(!walk)} aria-pressed={walk}>Walk</button>
          <button className={chip(spin)} onClick={() => setSpin(!spin)} aria-pressed={spin}>Spin</button>
          <button className={chip(elytra)} onClick={() => setElytra(!elytra)} aria-pressed={elytra}>Elytra</button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-7">
          <div className="flex flex-wrap gap-2">
            {item.animated && <span className="rounded-full bg-inv px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-inv-fg">Animated</span>}
            {item.exclusive && <span className="rounded-full bg-gradient-to-r from-[#d9a6da] to-[#ffd68c] px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-[#160f2a]">Exclusive</span>}
            {item.isNew && !item.exclusive && <span className="rounded-full border border-line px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider">New</span>}
            {item.featured && <span className="rounded-full border border-line px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider">Featured</span>}
          </div>
          <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold leading-[1] tracking-[-0.04em]">{item.name}</h1>
          {item.description && <p className="mt-3 text-[16px] text-mute">{item.description}</p>}

          {item.offer && !storeLocked && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[13px] font-semibold">
              {item.offer.title} · {item.offer.percent}% off{item.offer.endsAt ? ` until ${new Date(item.offer.endsAt).toLocaleDateString()}` : ""}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {storeLocked && !item.exclusive ? (
              <div className="w-full rounded-[20px] border border-dashed border-line p-5">
                <p className="flex items-center gap-2 text-[15px] font-bold"><Lock className="h-4 w-4" /> The store opens at launch</p>
                <p className="mt-1 text-[14px] text-mute">{isFounder ? "Join before launch and this cape can be your free founder pick." : `On launch day it’s ${money(item.price)} — or included with Native+.`}</p>
                <Countdown at={launch.at} size="sm" className="mt-4 !justify-start" />
                <div className="mt-5 flex flex-wrap gap-3">
                  {isFounder && <Link href={signedIn ? "/founder" : "/register?next=/founder"} className={primary}><Plus className="h-4 w-4" /> {signedIn ? "Pick it as your free cape" : "Join early · get it free"}</Link>}
                  {!signedIn && !isFounder && <Link href="/register?next=/founder" className={primary}>Create a free account</Link>}
                </div>
              </div>
            ) : item.exclusive && !own ? (
              <span className="inline-flex h-12 items-center gap-2 rounded-full border border-dashed border-line px-5 text-[14px] font-semibold text-mute" title="Not sold. The Native team gives event capes out, or with a redeem code.">
                <Lock className="h-4 w-4" /> Event cape · given by the Native team or with a code
              </span>
            ) : !signedIn && paid ? (
              <>
                <Link href="/login" className={primary}><ShoppingBag className="h-4 w-4" /> Sign in to buy · {priceLabel}</Link>
                <Link href="/plus" className={ghost}><Crown className="h-4 w-4" /> Included with Native+</Link>
              </>
            ) : !signedIn ? (
              <>
                <Link href="/login" className={primary}>Sign in to add</Link>
                <Link href="/register" className={ghost}>Create a free account</Link>
              </>
            ) : worn ? (
              <button onClick={() => run("equip", true)} disabled={!!busy} className={ghost}>
                {spinner("off")} Take off
              </button>
            ) : own ? (
              <button onClick={() => run("equip")} disabled={!!busy} className={primary}>
                {spinner("equip")} Wear {item.name}
              </button>
            ) : paid && member ? (
              <button onClick={() => run("claim")} disabled={!!busy} className={primary}>
                {spinner("claim") || <Crown className="h-4 w-4" />} Add with Native+
              </button>
            ) : paid ? (
              <>
                <button onClick={buy} disabled={buying || !sellable} className={primary} title={sellable || !bill ? undefined : "Payments are switched on soon."}>
                  {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />} {sellable || !bill ? <>Buy · {priceLabel}</> : `${money(price)} · soon`}
                </button>
                <Link href="/plus" className={ghost}><Crown className="h-4 w-4" /> Get it with Native+</Link>
              </>
            ) : (
              <>
                <button onClick={() => run("claim")} disabled={!!busy} className={primary}>
                  {spinner("claim") || <Plus className="h-4 w-4" />} Add to locker · Free
                </button>
                <button onClick={() => run("equip")} disabled={!!busy} className={ghost}>
                  {spinner("equip")} Wear now
                </button>
              </>
            )}
            {signedIn && own && !item.exclusive && !paid && (
              <button onClick={() => run("unclaim")} disabled={!!busy} className="inline-flex h-12 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold text-mute transition hover:text-fg disabled:opacity-60">
                {spinner("unclaim") || <Minus className="h-4 w-4" />} Remove from locker
              </button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {msg && (
              <motion.p key={msg.s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role={msg.t === "err" ? "alert" : "status"} className={`mt-4 text-[14px] ${msg.t === "err" ? "font-semibold text-fg" : "text-mute"}`}>
                {msg.s}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <dl className="card grid grid-cols-2 gap-px overflow-hidden bg-line p-0 text-[14px]">
          {[
            ["Price", item.exclusive ? "Event only" : paid ? `${money(price)} or Native+` : "Free"],
            ["In lockers", ownerLabel(owners)],
            ["Type", item.animated ? "Animated" : "Classic"],
            ["Made by", item.author || "Native"],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface p-5">
              <dt className="text-[12.5px] font-semibold uppercase tracking-wider text-dim">{k}</dt>
              <dd className="mt-1.5 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-3 py-1 text-[13px] text-mute">#{t}</span>
            ))}
          </div>
        )}
        <p className="text-[13.5px] text-dim">Native capes show on your account everywhere: the launcher, the website and in game with the Native mod. You can only wear Native capes and the classic presets — custom cape uploads aren’t allowed.</p>
      </div>
    </div>
  );
}
