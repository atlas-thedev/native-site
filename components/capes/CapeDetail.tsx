"use client";

import { Crown, Loader2, Lock, Minus, Plus, RotateCcw, ShoppingBag, Sparkles, X } from "lucide-react";
import BuyPanel from "../store/BuyPanel";
import { PxButton, PxLink } from "../ui/Px";
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
  account: string | null;
};


/** One cape: big 3D preview + add to locker / wear / take off. */
export default function CapeDetail({ item, signedIn, owned: initialOwned, equipped: initialEquipped, skin, model, account }: Props) {
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
  const isFounder = launch.prelaunch && launch.founderPick && launch.founderCapes.includes(item.id);
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

  // Stay honest if the cloak changes in the launcher meanwhile.
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
          : off ? "Cloak taken off."
          : `${item.name} is on. Friends see it in the launcher and in game.`,
      });
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  const spin_ = (k: string, icon: React.ReactNode) => (busy === k ? <Loader2 className="animate-spin" /> : icon);
  const next = `/cloaks/${item.id}`;
  const kind = item.exclusive ? "Event" : "Lifetime";

  let actions: React.ReactNode;
  if (item.id === "super-beta-tester" && !own) actions = <PxLink href="/beta" variant="light" size="xl"><Sparkles /> Super Beta Testers only · Apply</PxLink>;
  else if (item.exclusive && !own) actions = <PxButton variant="locked" size="xl" disabled><Lock /> Event cloak · given by the Native team</PxButton>;
  else if (!signedIn && paid) actions = <><PxLink href={`/login?next=${next}`} variant="gold" size="xl"><ShoppingBag /> Sign in to buy · {priceLabel}</PxLink><PxLink href="/plus" variant="ghost"><Crown /> Included with Native+</PxLink></>;
  else if (!signedIn) actions = <><PxLink href={`/login?next=${next}`} variant="green" size="xl"><Plus /> Sign in to add</PxLink><PxLink href={`/register?next=${next}`} variant="ghost">Create a free account</PxLink></>;
  else if (worn) actions = <PxButton variant="ghost" size="xl" onClick={() => run("equip", true)} disabled={!!busy}>{spin_("off", <X />)} Take off</PxButton>;
  else if (own) actions = <PxButton variant="green" size="xl" onClick={() => run("equip")} disabled={!!busy}>{spin_("equip", <Sparkles />)} Wear {item.name}</PxButton>;
  else if (paid && member) actions = <PxButton variant="gold" size="xl" onClick={() => run("claim")} disabled={!!busy}>{spin_("claim", <Crown />)} Add with Native+</PxButton>;
  else if (paid) actions = <><PxButton variant="gold" size="xl" onClick={buy} disabled={buying || !sellable} title={sellable || !bill ? undefined : "Payments are switched on soon."}>{buying ? <Loader2 className="animate-spin" /> : <ShoppingBag />} {sellable || !bill ? <>Buy · {priceLabel}</> : `${money(price)} · soon`}</PxButton><PxLink href="/plus" variant="ghost"><Crown /> Get it with Native+</PxLink></>;
  else actions = <><PxButton variant="green" size="xl" onClick={() => run("claim")} disabled={!!busy}>{spin_("claim", <Plus />)} Add to locker · Free</PxButton><PxButton variant="ghost" onClick={() => run("equip")} disabled={!!busy}>{spin_("equip", <Sparkles />)} Wear now</PxButton></>;
  const remove = signedIn && own && !item.exclusive && !paid && (
    <PxButton variant="ghost" size="sm" onClick={() => run("unclaim")} disabled={!!busy}>{spin_("unclaim", <Minus />)} Remove from locker</PxButton>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="st-panel min-w-0 self-start overflow-hidden">
        <div className="st-art relative h-[440px] sm:h-[600px]" style={{ boxShadow: "none" }}>
          <div className="absolute inset-0">
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
          </div>
          <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between">
            <div className="flex gap-1.5">
              {item.animated && <span className="st-tag is-inv">Animated</span>}
              {item.exclusive && <span className="st-tag">Exclusive</span>}
              {item.isNew && !item.exclusive && <span className="st-tag">New</span>}
              {item.featured && <span className="st-tag">Featured</span>}
            </div>
            <PxButton variant="ghost" size="sm" icon className="pointer-events-auto" onClick={() => viewer.current?.reset()} aria-label="Reset camera"><RotateCcw /></PxButton>
          </div>
          <div aria-hidden className="stage-floor pointer-events-none absolute inset-x-0 bottom-0 h-[16%]" />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t-2 border-line p-3.5">
          <PxButton variant="ghost" size="sm" on={walk} onClick={() => setWalk(!walk)} aria-pressed={walk}>Walk</PxButton>
          <PxButton variant="ghost" size="sm" on={spin} onClick={() => setSpin(!spin)} aria-pressed={spin}>Spin</PxButton>
          <PxButton variant="ghost" size="sm" on={elytra} onClick={() => setElytra(!elytra)} aria-pressed={elytra}>Elytra</PxButton>
          <span className="ml-auto text-[12px] text-dim max-sm:hidden">Drag to turn</span>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <BuyPanel
          color="#f2f2f4"
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
              <p className="mt-1 text-[14px] text-mute">{isFounder ? "Join before launch and this cloak can be your free founder pick." : `On launch day it’s ${money(item.price)}, or free with Native+.`}</p>
              <Countdown at={launch.at} size="sm" className="mt-4 justify-start!" />
              <div className="mt-5 flex flex-wrap gap-3">
                {isFounder && <PxLink href={signedIn ? "/founder" : "/register?next=/founder"} variant="light"><Plus /> {signedIn ? "Pick it as your free cape" : "Join early · get it free"}</PxLink>}
                {!signedIn && !isFounder && <PxLink href="/register?next=/founder" variant="light">Create a free account</PxLink>}
              </div>
            </div>
          ) : undefined}
        >
          {actions}
          {remove}
        </BuyPanel>

        <div className="st-panel p-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-dim">About</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-mute">{item.description || `${item.animated ? "An animated" : "A classic"} Native cloak.`}</p>
          {item.offer && !storeLocked && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-[6px] border-2 border-line px-3 py-1 text-[13px] font-semibold">
              {item.offer.title} · {item.offer.percent}% off{item.offer.endsAt ? ` until ${new Date(item.offer.endsAt).toLocaleDateString()}` : ""}
            </p>
          )}
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border-2 border-line bg-line text-[14px]">
            {[["In lockers", ownerLabel(owners)], ["Type", item.animated ? "Animated" : "Classic"], ["Price", item.exclusive ? "Event only" : paid ? `${money(price)} or Native+` : "Free"], ["Made by", item.author || "Native"]].map(([k, v]) => (
              <div key={k} className="bg-bg p-4"><dt className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">{k}</dt><dd className="mt-1 font-semibold">{v}</dd></div>
            ))}
          </dl>
          {item.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{item.tags.map((t) => <span key={t} className="st-tag">#{t}</span>)}</div>}
          <p className="mt-4 text-[12.5px] text-dim">Native cloaks show on your account everywhere: the launcher, the website and in game with the Native mod.</p>
        </div>
      </div>
    </div>
  );
}
