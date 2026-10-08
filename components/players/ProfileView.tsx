"use client";

import { Check, Copy, Crown, EyeOff, Heart, Lock, Package, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import CapeStrip from "../CapeStrip";
import LockerViewer, { type ViewerHandle } from "../LockerViewer";
import type { Worn } from "../cosmetics/CosmeticViewer";
import ItemCard from "../store/ItemCard";
import WornShot from "../cosmetics/WornShot";
import { COSMETIC_SLOTS, SLOT_COLOR, SLOT_NAMES, isCosmetic, type PlayerProfile, type StoreItem } from "@/lib/store";
import { storeActionRaw } from "../capes/actions";
import PlusMark from "../plus/PlusMark";

type Tab = "locker" | "wishlist";
type Filter = "all" | "capes" | (typeof COSMETIC_SLOTS)[number];

const TAG = (it: StoreItem) => (it.exclusive ? <span className="st-tag" style={{ background: "#9b6bff", color: "#fff" }}>Event</span> : null);

type Props = {
  profile: PlayerProfile;
  /** every item the player owns or wishes for, from the catalog */
  items: StoreItem[];
  skin: string;
  model: "default" | "slim";
  own: boolean;
  initialPrefs: { hideLocker: boolean; hideWishlist: boolean };
  joined: string;
};

/** A player's page: 3D look, stats, their locker and their wishlist. */
export default function ProfileView({ profile, items, skin, model, own, initialPrefs, joined }: Props) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const [tab, setTab] = useState<Tab>("locker");
  const [filter, setFilter] = useState<Filter>("all");
  const [prefs, setPrefs] = useState(initialPrefs);
  const [copied, setCopied] = useState(false);
  const [prefsError, setPrefsError] = useState("");
  const viewer = useRef<ViewerHandle>(null);
  const [zoomState, setZoomState] = useState({ in: true, out: true });
  const [paused, setPaused] = useState(false);
  const zoomBy = (f: number) => { const r = viewer.current?.zoom(f); if (r) setZoomState(r); };

  const wornIds = useMemo(() => new Set([profile.equipped, ...Object.values(profile.wearing)].filter(Boolean) as string[]), [profile]);
  const ownedItems = useMemo(() => profile.owned.map((o) => byId.get(o.id)).filter((i): i is StoreItem => !!i), [profile.owned, byId]);
  const wishItems = useMemo(() => profile.wishlist.map((o) => byId.get(o.id)).filter((i): i is StoreItem => !!i), [profile.wishlist, byId]);
  const source = tab === "locker" ? ownedItems : wishItems;
  const matches = (it: StoreItem, f: Filter) => f === "all" || (f === "capes" ? !isCosmetic(it) : it.slot === f);
  const list = source.filter((it) => matches(it, filter));
  const cape = profile.equipped ? byId.get(profile.equipped) : undefined;
  const worn: Worn[] = COSMETIC_SLOTS.map((s) => profile.wearing[s]).map((id) => (id ? byId.get(id) : undefined))
    .filter((it): it is StoreItem => !!it && !!it.modelUrl && !!it.textureUrl).map((it) => ({ id: it.id, modelUrl: it.modelUrl!, textureUrl: it.textureUrl!, side: (it.slot && profile.sides?.[it.slot]) || null, slot: it.slot }));

  // Owners always see their own items; the toggles only hide them from other players.
  const hiddenLocker = own ? false : profile.hidden.locker;
  const hiddenWish = own ? false : profile.hidden.wishlist;
  const hidden = tab === "locker" ? hiddenLocker : hiddenWish;
  const privateNow = own && (tab === "locker" ? prefs.hideLocker : prefs.hideWishlist);
  const filters = ([
    ["all", "All", source.length],
    ["capes", "Cloaks", source.filter((i) => matches(i, "capes")).length],
    ...COSMETIC_SLOTS.map((s) => [s, SLOT_NAMES[s], source.filter((i) => i.slot === s).length]),
  ] as [Filter, string, number][]).filter(([id, , n]) => id === "all" || n > 0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/u/${encodeURIComponent(profile.name)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };
  // Optimistic: flip at once, save in the background, roll back only if the save fails.
  const toggle = (key: "hideLocker" | "hideWishlist") => {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    setPrefsError("");
    storeActionRaw({ action: "prefs", [key]: next })
      .then((r) => {
        if (!r.ok) throw new Error();
      })
      .catch(() => {
        setPrefs((p) => ({ ...p, [key]: !next }));
        setPrefsError("Couldn't save that, try again.");
      });
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className={`st-panel relative flex flex-col overflow-hidden !bg-black${profile.plus ? " !border-[#e9b53a]/60 shadow-[0_0_40px_-12px_rgb(255_190_60/0.45)]" : ""}`}>
          {profile.plus && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-[7px] border border-[#ffd76a]/50 bg-black/70 py-1 pl-1.5 pr-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#ffd76a] backdrop-blur">
              <PlusMark size={18} /> Native+ member
            </span>
          )}
          <div className="relative min-h-[500px] flex-1 bg-black pb-14 pt-12">
            <LockerViewer ref={viewer} zoom={0.56} skin={skin} model={model} cape={cape?.stillUrl ?? null} capeAnim={cape?.animated && cape.stripUrl ? { url: cape.stripUrl, frames: cape.frames, fps: cape.fps } : null} walk spin showCape layers worn={worn} />
            <div className="viewer-actions">
              <div>
                <button type="button" onClick={() => { viewer.current?.reset(); setZoomState({ in: true, out: true }); }} title="Reset view" aria-label="Reset view"><RotateCcw /></button>
                <button type="button" onClick={() => zoomBy(1 / 1.25)} disabled={!zoomState.out} title="Zoom out" aria-label="Zoom out"><ZoomOut /></button>
                <button type="button" onClick={() => zoomBy(1.25)} disabled={!zoomState.in} title="Zoom in" aria-label="Zoom in"><ZoomIn /></button>
              </div>
              <div>
                <button type="button" onClick={() => { const p = !paused; setPaused(p); viewer.current?.pause(p); }} title={paused ? "Play preview" : "Pause preview"} aria-label={paused ? "Play preview" : "Pause preview"}>{paused ? <Play /> : <Pause />}</button>
              </div>
            </div>
          </div>
        </div>
        <div className="st-panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-[clamp(2rem,4vw,2.9rem)] font-extrabold leading-none tracking-[-0.035em]">{profile.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {profile.plus && (
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-gradient-to-b from-[#ffe08a] to-[#e9a91c] px-2 py-[3px] text-[11px] font-black uppercase tracking-[0.08em] text-black shadow-[inset_0_-2px_0_rgb(0_0_0/0.18),0_0_18px_-4px_rgb(255_190_60/0.6)]">
                    <Crown className="h-3.5 w-3.5" /> Native+
                  </span>
                )}
                {profile.admin && <span className="st-tag">Team</span>}
                {profile.badges.filter((b) => !(profile.plus && /^(native)?\s*\+?\s*plus$|^native\+$/i.test(b))).map((b) => <span key={b} className="st-tag">{b}</span>)}
                <span className="text-[13px] text-dim">Joined {joined}</span>
              </div>
            </div>
            <button onClick={copy} className="pxb is-ghost"><span className="pxb-face">{copied ? <><Check /> Copied</> : <><Copy /> Share profile</>}</span></button>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["In locker", hiddenLocker ? "Hidden" : profile.counts.owned.toLocaleString()],
              ["Wishlist", hiddenWish ? "Hidden" : profile.counts.wishlist.toLocaleString()],
              ["Wearing", String(wornIds.size)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[8px] border-2 border-line bg-black/20 p-3 shadow-[inset_0_2px_0_rgb(0_0_0/0.3)]">
                <dt className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">{k}</dt>
                <dd className="mt-1 text-[24px] font-extrabold leading-none tracking-tight">{v}</dd>
              </div>
            ))}
          </dl>
          {profile.plus && (
            <div className="mt-4 flex items-center gap-3 rounded-[10px] border-2 border-[#e9b53a]/40 bg-gradient-to-r from-[#e9a91c]/15 to-transparent p-3">
              <PlusMark size={34} />
              <div className="min-w-0">
                <p className="text-[14px] font-extrabold">Native+ member</p>
                <p className="text-[12.5px] text-dim">Has every paid cloak and cosmetic, and the Native+ badge in game.</p>
              </div>
              {!own && <Link href="/plus" className="pxb is-ghost ml-auto shrink-0"><span className="pxb-face">Get Native+</span></Link>}
            </div>
          )}
          {wornIds.size > 0 && (
            <div className="mt-6">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-dim">Wearing now</p>
              <ul className="mt-2 flex flex-wrap gap-2.5">
                {[...wornIds].map((id) => byId.get(id)).filter((i): i is StoreItem => !!i).map((it) => (
                  <li key={it.id}>
                    <Link href="/store" className="inline-flex items-center gap-2.5 rounded-[8px] border-2 border-line bg-surface px-2.5 py-2 transition hover:border-fg/40" style={it.slot ? ({ borderLeftColor: SLOT_COLOR[it.slot], borderLeftWidth: 4 } as React.CSSProperties) : undefined}>
                      <span className="flex h-9 w-9 items-center justify-center">
                        {isCosmetic(it) ? <Shot it={it} skin={skin} model={model} className="h-9 w-9 object-contain" /> : <CapeStrip strip={null} still={it.stillUrl} frames={1} fps={1} width={22} label={it.name} />}
                      </span>
                      <span className="text-[13.5px] font-bold">{it.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {own && (
            <div className="st-sep mt-6 pt-5">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-dim">Privacy · only you see this</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => toggle("hideLocker")} className={`pxb is-ghost is-sm ${prefs.hideLocker ? "is-on" : ""}`} aria-pressed={prefs.hideLocker}><span className="pxb-face"><EyeOff /> Hide my locker</span></button>
                <button type="button" onClick={() => toggle("hideWishlist")} className={`pxb is-ghost is-sm ${prefs.hideWishlist ? "is-on" : ""}`} aria-pressed={prefs.hideWishlist}><span className="pxb-face"><EyeOff /> Hide my wishlist</span></button>
              </div>
              <p className="mt-2 text-[12.5px] text-dim">{prefsError || (prefs.hideLocker || prefs.hideWishlist ? `Other players can't see your ${prefs.hideLocker && prefs.hideWishlist ? "locker or wishlist" : prefs.hideLocker ? "locker" : "wishlist"}. You still can.` : "Everyone can see your locker and wishlist.")}</p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="st-seg" role="tablist" aria-label="Profile sections">
          <button role="tab" aria-selected={tab === "locker"} className={tab === "locker" ? "is-on" : ""} onClick={() => { setTab("locker"); setFilter("all"); }}><Package /> Locker</button>
          <button role="tab" aria-selected={tab === "wishlist"} className={tab === "wishlist" ? "is-on" : ""} onClick={() => { setTab("wishlist"); setFilter("all"); }}><Heart /> Wishlist</button>
        </div>
      </div>
      {privateNow && (
        <p className="mt-3 inline-flex items-center gap-2 text-[13px] text-dim"><EyeOff className="h-4 w-4" /> Hidden from other players. Only you can see this.</p>
      )}
      {!hidden && filters.length > 1 && (
        <div className="st-tabs mt-3" role="tablist" aria-label="Filter items">
          {filters.map(([id, label, n]) => (
            <button key={id} role="tab" aria-selected={filter === id} className={`st-tab ${filter === id ? "is-on" : ""}`} onClick={() => setFilter(id)}>{label}<span className="n">{n}</span></button>
          ))}
        </div>
      )}

      {hidden ? (
        <div className="st-panel mt-6 flex flex-col items-center gap-2 p-12 text-center">
          <Lock className="h-6 w-6 text-dim" />
          <p className="text-[16px] font-bold">{profile.name} keeps their {tab === "locker" ? "locker" : "wishlist"} private</p>
        </div>
      ) : list.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((it) => (
            <li key={it.id}>
              <ItemCard
                item={it}
                href="/store"
                aspect="aspect-[4/5]"
                worn={wornIds.has(it.id)}
                own={wornIds.has(it.id)}
                art={isCosmetic(it)
                  ? <Shot it={it} skin={skin} model={model} alt={it.name} className="cutout-sm h-[150px] w-[150px] max-w-[78%] object-contain" />
                  : <CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={72} label={`${it.name} cloak`} className="cutout-sm" />}
                left={<>{it.animated || it.motion ? <span className="st-tag is-inv">{isCosmetic(it) ? "Moves" : "Animated"}</span> : null}{TAG(it)}</>}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="st-panel mt-6 p-12 text-center text-[15px] text-mute">{tab === "locker" ? "Nothing in this locker yet." : "Nothing on this wishlist yet."}</div>
      )}
    </>
  );
}

/** A cosmetic drawn worn on this player's skin; never the flat texture sheet of imported pieces. */
function Shot({ it, skin, model, className, alt = "" }: { it: StoreItem; skin: string; model: "default" | "slim"; className: string; alt?: string }) {
  if (!it.modelUrl || !it.textureUrl) return it.stillUrl ? <img src={it.stillUrl} alt={alt} className={className} /> : null; // eslint-disable-line @next/next/no-img-element
  return <WornShot item={it} skin={skin} model={model} className={className} alt={alt} hideFallback={!it.stillUrl || it.stillUrl === it.textureUrl} />;
}
