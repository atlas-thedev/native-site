"use client";

import { Crown, Loader2, Lock, Minus, Plus, RotateCcw, ShoppingBag, Sparkles, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CosmeticViewer, { type CosmeticViewerHandle, type Worn } from "./CosmeticViewer";
import { SLOT_COLOR } from "./CosmeticGallery";
import BuyPanel from "../store/BuyPanel";
import { PxButton, PxLink } from "../ui/Px";
import { ownerLabel, storeAction, type StoreAction } from "../capes/actions";
import { getBilling, startCheckout, type BillingState } from "../capes/billing";
import { useLaunch } from "../launch/LaunchContext";
import Countdown from "../launch/Countdown";
import { COSMETIC_SLOTS, SIDED_SLOTS, SLOT_NAMES, type Side, isPaid, money, priceNow, type CosmeticSlot, type Owned, type StoreItem, type Wearing } from "@/lib/store";

type Props = {
  item: StoreItem;
  /** every cosmetic, to try other pieces on next to this one */
  all: StoreItem[];
  signedIn: boolean;
  account: string | null;
  owned: Owned[];
  wearing: Wearing;
  skin: string | null;
  model: "default" | "slim";
  /** the cloak the account wears (still) */
  cape: string | null;
};

/** One cosmetic: the 3D stage on your skin, a "complete the look" try-on list and the buy box. */
export default function CosmeticDetail({ item, all, signedIn, account, owned: initialOwned, wearing: initialWearing, skin, model, cape }: Props) {
  const slot = item.slot as CosmeticSlot;
  const [owned, setOwned] = useState(initialOwned);
  const [wearing, setWearing] = useState(initialWearing);
  const [owners, setOwners] = useState(item.owners ?? 0);
  const [busy, setBusy] = useState<StoreAction | "off" | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; s: string } | null>(null);
  const [walk, setWalk] = useState(false);
  const [spin, setSpin] = useState(true);
  const [withCape, setWithCape] = useState(false);
  // what's tried on next to this piece, one id per slot; starts with what the account wears
  const [extra, setExtra] = useState<Partial<Record<CosmeticSlot, string | null>>>({});
  const viewer = useRef<CosmeticViewerHandle>(null);
  // hand items and balloons: which side they sit on (null = the item's own default)
  const [sides, setSides] = useState<Record<string, string>>({});
  const [mySide, setMySide] = useState<Side | null>(null);
  const sided = SIDED_SLOTS.includes(slot);
  const [bill, setBill] = useState<BillingState | null>(null);
  const [buying, setBuying] = useState(false);
  const paid = isPaid(item);
  const member = !!bill?.plus?.active;
  const sellable = !!bill?.config?.enabled;
  const own = owned.some((o) => o.id === item.id);
  const { launch } = useLaunch();
  const storeLocked = launch.lockStore && !own;
  const on = wearing[slot] === item.id;
  const price = priceNow(item);
  const priceLabel = item.salePrice != null ? <>{money(price)} <s className="opacity-60">{money(item.price)}</s></> : money(item.price);
  const byId = useMemo(() => new Map(all.map((i) => [i.id, i])), [all]);

  useEffect(() => {
    if (paid && signedIn) getBilling().then(setBill).catch(() => {});
  }, [paid, signedIn]);

  // stay honest if the look changes in the launcher meanwhile
  useEffect(() => {
    if (!signedIn) return;
    const sync = () =>
      fetch("/api/store", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!d?.signedIn) return;
          if (d.wearing) setWearing(d.wearing);
          if (d.sides) { setSides(d.sides); setMySide((cur) => cur ?? ((d.sides[slot] as Side | undefined) ?? null)); }
          if (Array.isArray(d.owned)) setOwned(d.owned);
        })
        .catch(() => {});
    const onVis = () => !document.hidden && sync();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [signedIn]);

  // "Complete the look": the other slots, each with a few pieces; the one on the model is checked
  const others = COSMETIC_SLOTS.filter((s) => s !== slot);
  const chosen = (s: CosmeticSlot) => (s in extra ? extra[s] ?? null : wearing[s] ?? null);
  const worn = useMemo<Worn[]>(() => {
    const ids = COSMETIC_SLOTS.map((s) => (s === slot ? item.id : (s in extra ? extra[s] : wearing[s]) ?? null));
    return ids.map((id) => (id ? byId.get(id) : undefined))
      .filter((it): it is StoreItem => !!it && !!it.modelUrl && !!it.textureUrl)
      .map((it) => ({ id: it.id, modelUrl: it.modelUrl!, textureUrl: it.textureUrl!, slot: it.slot, side: it.slot === slot ? mySide : ((sides[it.slot ?? ""] as Side | undefined) ?? null) }));
  }, [byId, item.id, slot, extra, wearing, mySide, sides]);

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

  const run = async (action: StoreAction, off = false) => {
    setBusy(off ? "off" : action);
    setMsg(null);
    try {
      const r = await storeAction(action, off ? null : item.id, off ? slot : undefined, !off && sided && mySide ? mySide : undefined);
      setWearing(r.wearing);
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
          : off ? `${item.name} is off.`
          : `${item.name} is on. Friends see it in the launcher and in game.`,
      });
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  const pickSide = async (next: Side) => {
    setMySide(next);
    if (!on || !signedIn) return;
    try {
      const r = await storeAction("equip", null, slot, next);
      if (r.sides) setSides(r.sides);
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Couldn’t change that." });
    }
  };
  const spin_ = (k: string, icon: React.ReactNode) => (busy === k ? <Loader2 className="animate-spin" /> : icon);
  const next = `/cosmetics/${item.id}`;
  const color = SLOT_COLOR[slot];
  const kind = item.exclusive ? "Event" : "Lifetime";

  let actions: React.ReactNode;
  if (item.exclusive && !own) actions = <PxButton variant="locked" size="xl" disabled><Lock /> Event cosmetic · given by the Native team</PxButton>;
  else if (!signedIn && paid) actions = <><PxLink href={`/login?next=${next}`} variant="gold" size="xl"><ShoppingBag /> Sign in to buy · {priceLabel}</PxLink><PxLink href="/plus" variant="ghost"><Crown /> Included with Native+</PxLink></>;
  else if (!signedIn) actions = <><PxLink href={`/login?next=${next}`} variant="green" size="xl"><Plus /> Sign in to add</PxLink><PxLink href={`/register?next=${next}`} variant="ghost">Create a free account</PxLink></>;
  else if (on) actions = <PxButton variant="ghost" size="xl" onClick={() => run("equip", true)} disabled={!!busy}>{spin_("off", <X />)} Take off</PxButton>;
  else if (own) actions = <PxButton variant="green" size="xl" onClick={() => run("equip")} disabled={!!busy}>{spin_("equip", <Sparkles />)} Wear {item.name}</PxButton>;
  else if (paid && member) actions = <PxButton variant="gold" size="xl" onClick={() => run("claim")} disabled={!!busy}>{spin_("claim", <Crown />)} Add with Native+</PxButton>;
  else if (paid) actions = <><PxButton variant="gold" size="xl" onClick={buy} disabled={buying || !sellable} title={sellable || !bill ? undefined : "Payments are switched on soon."}>{buying ? <Loader2 className="animate-spin" /> : <ShoppingBag />} {sellable || !bill ? <>Buy · {priceLabel}</> : `${money(price)} · soon`}</PxButton><PxLink href="/plus" variant="ghost"><Crown /> Get it with Native+</PxLink></>;
  else actions = <><PxButton variant="green" size="xl" onClick={() => run("claim")} disabled={!!busy}>{spin_("claim", <Plus />)} Add to locker · Free</PxButton><PxButton variant="ghost" onClick={() => run("equip")} disabled={!!busy}>{spin_("equip", <Sparkles />)} Wear now</PxButton></>;
  const remove = signedIn && own && !item.exclusive && !paid && (
    <PxButton variant="ghost" size="sm" onClick={() => run("unclaim")} disabled={!!busy}>{spin_("unclaim", <Minus />)} Remove from locker</PxButton>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="st-panel overflow-hidden">
          <div className="st-art relative h-[440px] sm:h-[580px]" style={{ boxShadow: "none" }}>
            <div className="absolute inset-0">
              <CosmeticViewer ref={viewer} skin={skin ?? (model === "slim" ? "/skins/alex.png" : "/skins/steve.png")} model={model} cape={withCape ? cape : null} worn={worn} walk={walk} spin={spin} focus={slot} />
            </div>
            <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between">
              <div className="flex gap-1.5">
                <span className="st-tag is-slot" style={{ "--tint": color } as React.CSSProperties}>{SLOT_NAMES[slot]}</span>
                {item.motion && <span className="st-tag is-inv">Moves</span>}
                {item.isNew && <span className="st-tag">New</span>}
              </div>
              <div className="pointer-events-auto flex gap-2">
                <PxButton variant="ghost" size="sm" icon onClick={() => viewer.current?.zoom(1 / 1.25)} aria-label="Zoom out"><ZoomOut /></PxButton>
                <PxButton variant="ghost" size="sm" icon onClick={() => viewer.current?.zoom(1.25)} aria-label="Zoom in"><ZoomIn /></PxButton>
                <PxButton variant="ghost" size="sm" icon onClick={() => viewer.current?.reset()} aria-label="Reset camera"><RotateCcw /></PxButton>
              </div>
            </div>
            <div aria-hidden className="stage-floor pointer-events-none absolute inset-x-0 bottom-0 h-[16%]" />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t-2 border-line p-3.5">
            <PxButton variant="ghost" size="sm" on={walk} onClick={() => setWalk(!walk)} aria-pressed={walk}>Walk</PxButton>
            <PxButton variant="ghost" size="sm" on={spin} onClick={() => setSpin(!spin)} aria-pressed={spin}>Spin</PxButton>
            {sided && (["left", "right"] as const).map((sd) => (
              <PxButton key={sd} variant="ghost" size="sm" on={(mySide ?? "") === sd} onClick={() => pickSide(sd)} aria-pressed={(mySide ?? "") === sd}>{slot === "hand" ? (sd === "left" ? "Left hand" : "Right hand") : sd === "left" ? "Left side" : "Right side"}</PxButton>
            ))}
            {cape && <PxButton variant="ghost" size="sm" on={withCape} onClick={() => setWithCape(!withCape)} aria-pressed={withCape}>Cloak</PxButton>}
            <span className="ml-auto text-[12px] text-dim max-sm:hidden">Drag to turn</span>
          </div>
        </div>

        <div className="st-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[15px] font-bold"><Sparkles className="h-4 w-4 text-dim" /> Complete the look</p>
            {Object.keys(extra).length > 0 && <button onClick={() => setExtra({})} className="text-[12.5px] font-semibold text-mute hover:text-fg">Reset</button>}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {others.map((s) => {
              const pool = all.filter((i) => i.slot === s);
              const cur = chosen(s);
              return (
                <div key={s}>
                  <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{SLOT_NAMES[s]}</p>
                  {pool.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {pool.slice(0, 6).map((p) => (
                        <li key={p.id}>
                          <button onClick={() => setExtra((e) => ({ ...e, [s]: cur === p.id ? null : p.id }))} aria-pressed={cur === p.id} title={p.name} aria-label={`Try ${p.name}`}
                            className={`slot-well flex h-12 w-12 items-center justify-center outline outline-2 outline-offset-2 transition ${cur === p.id ? "outline-fg" : "outline-transparent hover:outline-line"}`}>
                            <img src={p.stillUrl} alt="" className="h-[78%] w-[78%] object-contain [image-rendering:pixelated]" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-[12.5px] text-dim">Nothing here yet</p>}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[12px] text-dim">Only a preview. Each piece is added on its own page.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <BuyPanel
          color={color}
          kind={kind}
          price={item.exclusive ? "Not for sale" : paid ? priceLabel : "Free"}
          creator={item.author || "Native"}
          signedIn={signedIn}
          account={account}
          loginHref={`/login?next=${next}`}
          lines={["Visible in Minecraft to all Native users", "Visible on your Native profile"]}
          msg={msg}
          foot={paid ? "Secure checkout · Available instantly" : "Free to wear · Available instantly"}
          locked={storeLocked && !item.exclusive ? (
            <div className="rounded-[8px] border-2 border-dashed border-line p-5">
              <p className="flex items-center gap-2 text-[15px] font-bold"><Lock className="h-4 w-4" /> The store opens at launch</p>
              <p className="mt-1 text-[14px] text-mute">On launch day it’s {paid ? `${money(item.price)}, or free with Native+` : "free"}.</p>
              <Countdown at={launch.at} size="sm" className="mt-4 justify-start!" />
              {!signedIn && <div className="mt-5"><PxLink href="/register?next=/founder" variant="light">Create a free account</PxLink></div>}
            </div>
          ) : undefined}
        >
          {actions}
          {remove}
        </BuyPanel>

        <div className="st-panel p-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-dim">About</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-mute">{item.description || `A Native ${SLOT_NAMES[slot].toLowerCase()} cosmetic.`}</p>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border-2 border-line bg-line text-[14px]">
            {[["In lockers", ownerLabel(owners)], ["Slot", SLOT_NAMES[slot]], ["Type", item.motion ? "Animated" : "Static"], ["Made by", item.author || "Native"]].map(([k, v]) => (
              <div key={k} className="bg-bg p-4"><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">{k}</dt><dd className="mt-1 font-semibold">{v}</dd></div>
            ))}
          </dl>
          {item.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{item.tags.map((t) => <span key={t} className="st-tag">#{t}</span>)}</div>}
          <p className="mt-4 text-[12.5px] text-dim">You can wear one piece per slot. It shows on your account everywhere: the launcher, the website and in game with the Native mod.</p>
        </div>
      </div>
    </div>
  );
}
