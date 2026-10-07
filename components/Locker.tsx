"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Download, Loader2, LogOut, Plus, RotateCcw, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { COSMETIC_SLOTS, SIDED_SLOTS, type CapeAnim, type CosmeticSlot, type Sides, type StoreItem, type Wearing } from "@/lib/store";
import CapeStrip from "./CapeStrip";
import { storeAction } from "./capes/actions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LockerViewer, { type ViewerHandle } from "./LockerViewer";
import WornShot from "./cosmetics/WornShot";

type Model = "default" | "slim";
type Initial = { name: string; email: string; premium?: boolean; skin: string | null; cape: string | null; model: Model; capeAnim?: CapeAnim | null; capeStore?: string | null; nativeCapes?: StoreItem[]; capeId?: string; cosmetics?: StoreItem[]; ownedIds?: string[]; wearing?: Wearing; sides?: Sides };

const COS_TABS = [
  { id: "cloaks", label: "Cloaks", noun: "cloaks" },
  { id: "hats", label: "Hats", noun: "hats" },
  { id: "glasses", label: "Glasses", noun: "glasses" },
  { id: "back", label: "Wings", noun: "wings or backpacks" },
  { id: "shoes", label: "Shoes", noun: "shoes" },
  { id: "hand", label: "Hand", noun: "hand items" },
  { id: "balloon", label: "Balloons", noun: "balloons" },
] as const;
type CosTab = (typeof COS_TABS)[number]["id"];
const priceOf = (it: StoreItem) => (it.exclusive ? "Event" : it.paid ? `$${Number(it.price).toFixed(2)}` : "Free");

const PRESET_SKINS = [
  { id: "steve", name: "Steve", src: "/skins/steve.png", model: "default" as Model },
  { id: "alex", name: "Alex", src: "/skins/alex.png", model: "slim" as Model },
  { id: "steve1", name: "Steve II", src: "/skins/steve1.png", model: "default" as Model },
  { id: "alex1", name: "Alex II", src: "/skins/alex1.png", model: "slim" as Model },
  { id: "steve3", name: "Scout", src: "/skins/steve3.png", model: "default" as Model },
];
const CAPES = [
  { id: "founders", name: "Founders", src: "/capes/founders.png" },
  { id: "followers", name: "Followers", src: "/capes/followers.png" },
  { id: "migrator", name: "Migrator", src: "/capes/migrator.png" },
  { id: "anniversary", name: "15th Anniversary", src: "/capes/anniversary-15.png" },
  { id: "cherry", name: "Cherry Blossom", src: "/capes/cherry-blossom.png" },
  { id: "heart", name: "Purple Heart", src: "/capes/purple-heart.png" },
  { id: "vanilla", name: "Vanilla", src: "/capes/vanilla.png" },
];

type Saved = { id: string; name: string; data: string; model: Model };
const LS = "native.locker.saved.v1";

const toDataUrl = (blob: Blob) =>
  new Promise<string>((res, rej) => {
    const f = new FileReader();
    f.onload = () => res(String(f.result));
    f.onerror = rej;
    f.readAsDataURL(blob);
  });
const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

/** Slim (Alex) skins leave the right-arm columns at x=54..55 transparent. */
function detectModel(img: HTMLImageElement): Model {
  if (img.width !== 64 || img.height !== 64) return "default";
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.drawImage(img, 0, 0);
  const d = x.getImageData(55, 20, 1, 12).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return "default";
  return "slim";
}

function Head({ src, size = 44 }: { src: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let dead = false;
    loadImg(src).then((img) => {
      const c = ref.current;
      if (dead || !c) return;
      const x = c.getContext("2d")!;
      x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, c.width, c.height);
      x.drawImage(img, 8, 8, 8, 8, 0, 0, c.width, c.height);
      if (img.height >= 64 || img.width >= 64) x.drawImage(img, 40, 8, 8, 8, 0, 0, c.width, c.height);
    }).catch(() => {});
    return () => { dead = true; };
  }, [src]);
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size, imageRendering: "pixelated" }} className="rounded-md" aria-hidden />;
}

function CapeThumb({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let dead = false;
    loadImg(src).then((img) => {
      const c = ref.current;
      if (dead || !c) return;
      const k = img.width / 64;
      const x = c.getContext("2d")!;
      x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, c.width, c.height);
      x.drawImage(img, 1 * k, 1 * k, 10 * k, 16 * k, 0, 0, c.width, c.height);
    }).catch(() => {});
    return () => { dead = true; };
  }, [src]);
  return <canvas ref={ref} width={40} height={64} style={{ width: 30, height: 48, imageRendering: "pixelated" }} aria-hidden />;
}

const chip = (on: boolean) => `rounded-full border px-4 py-1.5 text-[13.5px] font-medium transition ${on ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`;

export default function Locker({ initial }: { initial: Initial }) {
  const baseSkin = initial.skin ?? PRESET_SKINS[0].src;
  const [skin, setSkin] = useState(baseSkin);
  const [skinChanged, setSkinChanged] = useState(false);
  const [model, setModel] = useState<Model>(initial.skin ? initial.model : "default");
  // Which card the worn cape is: a classic cape ("founders"…), a Native cape ("store"), or none.
  const startCape = initial.capeId ?? (initial.cape ? "current" : "none");
  const [capeId, setCapeId] = useState<string>(startCape);
  const [capeUrl, setCapeUrl] = useState<string | null>(initial.cape);
  const [capeData, setCapeData] = useState<string | null | undefined>(undefined);
  const base = useRef({ capeId: startCape, model: initial.skin ? initial.model : ("default" as Model), skin: baseSkin, capeUrl: initial.cape, capeAnim: (initial.cape && initial.capeAnim) || null });

  const [walk, setWalk] = useState(true);
  const [spin, setSpin] = useState(true);
  const [showCape, setShowCape] = useState(true);
  const [layers, setLayers] = useState(true);
  const [elytra, setElytra] = useState(false);

  const [saved, setSaved] = useState<Saved[]>([]);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; s: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const viewer = useRef<ViewerHandle>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(LS) || "[]")); } catch {}
  }, []);
  const persist = (list: Saved[]) => {
    setSaved(list);
    try { localStorage.setItem(LS, JSON.stringify(list)); } catch { setMsg({ t: "err", s: "Your browser has no room left to save more skins." }); }
  };

  const dirty = skinChanged || capeId !== base.current.capeId || model !== base.current.model;

  // The skin's name goes to the account too, so the launcher shows the same name.
  const [skinName, setSkinName] = useState<string | null>(null);
  const pickSkin = useCallback(async (src: string, opts: { model?: Model; detect?: boolean; name?: string } = {}) => {
    try {
      const blob = src.startsWith("data:") ? null : await (await fetch(src)).blob();
      const data = blob ? await toDataUrl(blob) : src;
      const img = await loadImg(data);
      if (img.width !== 64 || (img.height !== 64 && img.height !== 32)) throw new Error("Skins must be 64×64 (or legacy 64×32) PNG images.");
      setSkin(data);
      setSkinChanged(true);
      setSkinName(opts.name?.trim().slice(0, 32) || null);
      setModel(opts.model ?? (opts.detect ? detectModel(img) : "default"));
      setMsg(null);
      return data;
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "That image couldn’t be read." });
      return null;
    }
  }, []);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "image/png" && !f.name.toLowerCase().endsWith(".png")) return setMsg({ t: "err", s: "Please choose a PNG file." });
    if (f.size > 512 * 1024) return setMsg({ t: "err", s: "That file is too large (max 512 KB)." });
    await pickSkin(await toDataUrl(f), { detect: true, name: f.name.replace(/\.png$/i, "").replace(/[-_]+/g, " ") });
  };

  // Native cloaks are worn straight away (they live on the server, not in the unsaved draft).
  const [wearing, setWearing] = useState<string | null>(initial.capeStore ?? null);

  // Locker sections, like the launcher: Skin, or Cosmetics with a tab per kind.
  const [section, setSection] = useState<"skin" | "cosmetics">("skin");
  const [cosTab, setCosTab] = useState<CosTab>("cloaks");
  const [dir, setDir] = useState(1);
  const goSection = (next: "skin" | "cosmetics") => { if (next === section) return; setDir(next === "cosmetics" ? 1 : -1); setSection(next); setTryOn(null); };
  const goCosTab = (next: CosTab) => {
    if (next === cosTab) return;
    setDir(COS_TABS.findIndex((t) => t.id === next) > COS_TABS.findIndex((t) => t.id === cosTab) ? 1 : -1);
    setCosTab(next);
    setTryOn(null);
  };
  const allCos = useMemo(() => initial.cosmetics ?? [], [initial.cosmetics]);
  const cosById = useMemo(() => new Map(allCos.map((it) => [it.id, it])), [allCos]);
  const [owned, setOwned] = useState<Set<string>>(() => new Set(initial.ownedIds ?? []));
  const [outfit, setOutfit] = useState<Wearing>(initial.wearing ?? {});
  // the side each worn hand item / balloon sits on, so the preview matches the game
  const [outfitSides, setOutfitSides] = useState<Sides>(initial.sides ?? {});
  const [tryOn, setTryOn] = useState<StoreItem | null>(null);
  const [cosBusy, setCosBusy] = useState<string | null>(null);
  const worn = useMemo(() => {
    const slots: Wearing = { ...outfit };
    if (tryOn?.slot) slots[tryOn.slot as CosmeticSlot] = tryOn.id;
    return COSMETIC_SLOTS.map((s) => (slots[s] ? cosById.get(slots[s]!) : undefined))
      .filter((it): it is StoreItem => !!it && !!it.modelUrl && !!it.textureUrl)
      .map((it) => ({ id: it.id, modelUrl: it.modelUrl!, textureUrl: it.textureUrl!, slot: it.slot, side: it.slot && SIDED_SLOTS.includes(it.slot) && tryOn?.id !== it.id ? outfitSides[it.slot] ?? null : null }));
  }, [outfit, outfitSides, tryOn, cosById]);
  const wearCos = async (slot: CosmeticSlot, id: string | null) => {
    if (cosBusy) return;
    setCosBusy(id ?? `off:${slot}`);
    try {
      const r = await storeAction("equip", id, slot);
      setOutfit(r.wearing);
      if (r.sides) setOutfitSides(r.sides as Sides);
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Couldn’t change that." });
    } finally {
      setCosBusy(null);
    }
  };
  const addTryOn = async () => {
    const it = tryOn;
    if (!it?.slot || cosBusy) return;
    setCosBusy(`add:${it.id}`);
    try {
      const c = await storeAction("claim", it.id);
      setOwned((o) => new Set([...o, ...(c.owned ?? []).map((x) => x.id), it.id]));
      const r = await storeAction("equip", it.id, it.slot as CosmeticSlot);
      setOutfit(r.wearing);
      if (r.sides) setOutfitSides(r.sides as Sides);
      setTryOn(null);
      setMsg({ t: "ok", s: `${it.name} is in your locker and you’re wearing it, in the launcher and in game.` });
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Couldn’t add that." });
    } finally {
      setCosBusy(null);
    }
  };
  const [wearBusy, setWearBusy] = useState<string | null>(null);
  const wearNative = async (id: string | null) => {
    setWearBusy(id ?? wearing ?? "off");
    try {
      const r = await storeAction("equip", id);
      setWearing(r.equipped);
      window.location.reload();
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Couldn’t change your cloak." });
      setWearBusy(null);
    }
  };

  const pickCape = async (id: string, src: string | null) => {
    setCapeId(id);
    setMsg(null);
    if (id === "none") { setCapeUrl(null); setCapeData(null); return; }
    if (id === "current") { setCapeUrl(base.current.capeUrl); setCapeData(undefined); return; }
    try {
      const data = await toDataUrl(await (await fetch(src!)).blob());
      setCapeUrl(data);
      setCapeData(data);
    } catch { setMsg({ t: "err", s: "Couldn’t load that cape." }); }
  };

  const revert = () => {
    setSkin(base.current.skin); setSkinChanged(false); setModel(base.current.model);
    setCapeId(base.current.capeId); setCapeUrl(base.current.capeUrl); setCapeData(undefined); setMsg(null);
  };

  const publish = async () => {
    setBusy(true); setMsg(null);
    const body: Record<string, unknown> = { model };
    if (skinChanged) { body.skin = skin; if (skinName) body.skinName = skinName; }
    if (capeId !== base.current.capeId) body.cape = capeData ?? null;
    try {
      const r = await fetch("/api/locker", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (r.status === 401) { window.location.assign("/login"); return; }
      if (!d.ok) throw new Error(d.error || "Couldn’t save.");
      const keepsAnim = capeId === base.current.capeId && (capeId === "current" || capeId === "store");
      if (capeId !== base.current.capeId) setWearing(null);
      base.current = { skin, model, capeId, capeUrl: capeId === "none" ? null : capeUrl, capeAnim: keepsAnim ? base.current.capeAnim : null };
      setSkinChanged(false);
      setCapeData(undefined);
      setMsg({ t: "ok", s: "Saved to your account. Your skin and cape update in the launcher on its next sync." });
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Couldn’t save." });
    }
    setBusy(false);
  };

  const saveToLibrary = async () => {
    const data = skin.startsWith("data:") ? skin : await toDataUrl(await (await fetch(skin)).blob()).catch(() => "");
    if (!data) return setMsg({ t: "err", s: "Couldn’t save this skin to your library." });
    if (saved.some((s) => s.data === data)) return setMsg({ t: "ok", s: "Already in your library." });
    persist([{ id: String(Date.now()), name: `Skin ${saved.length + 1}`, data, model }, ...saved].slice(0, 24));
    setMsg({ t: "ok", s: "Saved to this browser’s library." });
  };

  const download = async () => {
    const data = skin.startsWith("data:") ? skin : await toDataUrl(await (await fetch(skin)).blob()).catch(() => "");
    if (!data) return;
    const a = document.createElement("a");
    a.href = data;
    a.download = `${initial.name}-skin.png`;
    a.click();
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  };

  const tile = (on: boolean) => `group relative flex flex-col items-center gap-2 rounded-[10px] border p-2.5 text-center transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:opacity-60 ${on ? "border-fg bg-surface-2" : "border-line hover:border-fg/40"}`;
  const renderSlot = (slot: CosmeticSlot) => {
    const tab = COS_TABS.find((t) => t.id === slot)!;
    const mine = allCos.filter((it) => it.slot === slot && owned.has(it.id));
    const more = allCos.filter((it) => it.slot === slot && !owned.has(it.id));
    const pop = (i: number) => ({ initial: { opacity: 0, y: 14, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { type: "spring" as const, stiffness: 460, damping: 24, delay: 0.05 + i * 0.035 } });
    return (
      <div>
        <p className="eyebrow">Yours</p>
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          <motion.button {...pop(0)} onClick={() => wearCos(slot, null)} disabled={!!cosBusy} aria-pressed={!outfit[slot]} className={tile(!outfit[slot])}>
            <span className="slot-well flex h-16 w-16 items-center justify-center text-dim">{cosBusy === `off:${slot}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-5 w-5" />}</span>
            <span className="text-[13px] font-semibold">Nothing</span>
          </motion.button>
          {mine.map((it, i) => {
            const on = outfit[slot] === it.id;
            return (
              <motion.button key={it.id} {...pop(i + 1)} onClick={() => wearCos(slot, on ? null : it.id)} disabled={!!cosBusy} aria-pressed={on} title={on ? `Take off ${it.name}` : `Wear ${it.name}`} className={tile(on)}>
                <span className="slot-well flex h-16 w-16 items-center justify-center"><CosThumb it={it} skin={skin} model={model} className="h-14 w-14 object-contain transition group-hover:scale-110" /></span>
                <span className="w-full truncate text-[13px] font-semibold">{it.name}</span>
                {cosBusy === it.id ? <Loader2 className="absolute right-2 top-2 h-3.5 w-3.5 animate-spin" /> : on && <Check className="absolute right-2 top-2 h-3.5 w-3.5" strokeWidth={3} />}
              </motion.button>
            );
          })}
        </div>
        {!mine.length && <p className="mt-3 text-[14px] text-dim">No {tab.noun} yet.{more.length ? " Pick one below to try it on." : ""}</p>}
        {more.length > 0 && (
          <>
            <div className="mt-8 flex items-center justify-between gap-3">
              <p className="eyebrow">More in the Native Store</p>
              <Link href="/store" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mute transition hover:text-fg">Fitting room <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {more.map((it, i) => {
                const on = tryOn?.id === it.id;
                return (
                  <motion.button key={it.id} {...pop(mine.length + i + 1)} onClick={() => setTryOn(on ? null : it)} aria-pressed={on} title={on ? "Stop trying on" : `Try on ${it.name}`} className={`${tile(on)} ${on ? "" : "border-dashed"}`}>
                    <span className={`slot-well flex h-16 w-16 items-center justify-center ${on ? "" : "opacity-80"}`}><CosThumb it={it} skin={skin} model={model} className="h-14 w-14 object-contain transition group-hover:scale-110" /></span>
                    <span className="w-full truncate text-[13px] font-semibold">{it.name}</span>
                    <span className={`absolute right-1.5 top-1.5 rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] font-bold ${it.exclusive ? "bg-surface-2 text-mute" : it.paid ? "bg-inv text-inv-fg" : "border border-line text-mute"}`}>{priceOf(it)}</span>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-12 sm:pt-16">
      <header className="mb-10 flex flex-wrap items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface"><Head src={skin} size={44} /></div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Your locker</p>
          <h1 className="truncate text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-tight tracking-[-0.04em]">{initial.name}</h1>
          <p className="truncate text-[14px] text-dim">{initial.email || (initial.premium ? "Signed in with Microsoft" : "")}</p>
        </div>
        <button onClick={signOut} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[14.5px] font-semibold transition hover:bg-surface-2">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card">
            <div className="dots relative h-[420px] sm:h-[520px]">
              <LockerViewer ref={viewer} worn={worn} skin={skin} cape={capeUrl} capeAnim={capeId === base.current.capeId && (capeId === "current" || capeId === "store") ? base.current.capeAnim : null} model={model} walk={walk} spin={spin} showCape={showCape} layers={layers} elytra={elytra} onError={() => setMsg({ t: "err", s: "That skin couldn’t be displayed." })} />
              <button onClick={() => viewer.current?.reset()} aria-label="Reset camera" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg/70 text-mute backdrop-blur transition hover:text-fg">
                <RotateCcw className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {tryOn && (
                  <motion.div key={tryOn.id} initial={{ opacity: 0, y: 16, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={{ type: "spring", stiffness: 460, damping: 26 }}
                    className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-[10px] border border-line bg-bg p-2 pl-4" role="status">
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Trying on</span>
                      <span className="block truncate text-[14px] font-semibold">{tryOn.name}</span>
                    </span>
                    {tryOn.exclusive ? (
                      <span className="rounded-full border border-line px-3.5 py-2 text-[13px] font-semibold text-dim">Event only</span>
                    ) : tryOn.paid ? (
                      <Link href={tryOn ? `/cosmetics/${tryOn.id}` : "/store"} className="rounded-full bg-inv px-4 py-2 text-[13px] font-semibold text-inv-fg">Get it · {priceOf(tryOn)}</Link>
                    ) : (
                      <button onClick={addTryOn} disabled={!!cosBusy} className="inline-flex items-center gap-1.5 rounded-full bg-inv px-4 py-2 text-[13px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-60">
                        {cosBusy === `add:${tryOn.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" strokeWidth={3} />} Add &amp; wear
                      </button>
                    )}
                    <button onClick={() => setTryOn(null)} aria-label="Stop trying on" className="flex h-8 w-8 items-center justify-center rounded-full text-mute transition hover:bg-surface-2 hover:text-fg"><X className="h-4 w-4" /></button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line p-4">
              <button className={chip(walk)} onClick={() => setWalk(!walk)} aria-pressed={walk}>Walk</button>
              <button className={chip(spin)} onClick={() => setSpin(!spin)} aria-pressed={spin}>Spin</button>
              <button className={chip(showCape)} onClick={() => setShowCape(!showCape)} aria-pressed={showCape}>Cape</button>
              <button className={chip(elytra)} onClick={() => setElytra(!elytra)} aria-pressed={elytra}>Elytra</button>
              <button className={chip(layers)} onClick={() => setLayers(!layers)} aria-pressed={layers}>Outer layer</button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div role="tablist" aria-label="Locker sections" className="grid grid-cols-2 gap-1 rounded-[14px] border border-line bg-surface p-1">
            {(["skin", "cosmetics"] as const).map((id) => (
              <button key={id} role="tab" aria-selected={section === id} onClick={() => goSection(id)} className={`relative rounded-[10px] px-4 py-2.5 text-[15px] font-bold transition ${section === id ? "text-inv-fg" : "text-mute hover:text-fg"}`}>
                {section === id && <motion.span layoutId="locker-slab" className="absolute inset-0 rounded-[10px] bg-inv" transition={{ type: "spring", stiffness: 520, damping: 30 }} />}
                <span className="relative">{id === "skin" ? "Skin" : "Cosmetics"}</span>
                {id === "cosmetics" && <span className={`relative ml-2 text-[12px] ${section === id ? "opacity-60" : "text-dim"}`}>{(initial.nativeCapes?.length ?? 0) + allCos.filter((it) => owned.has(it.id)).length}</span>}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div key={section} custom={dir} initial={{ opacity: 0, x: dir * 36, rotate: dir * 0.6 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -dir * 36 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}>
              {section === "skin" ? (
          <section className="card p-6 sm:p-8" aria-labelledby="sk">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="sk" className="text-[22px] font-extrabold tracking-tight">Skin</h2>
              {!initial.premium && <div role="group" aria-label="Arm model" className="flex gap-2">
                <button className={chip(model === "default")} onClick={() => setModel("default")} aria-pressed={model === "default"}>Classic</button>
                <button className={chip(model === "slim")} onClick={() => setModel("slim")} aria-pressed={model === "slim"}>Slim</button>
              </div>}
            </div>
            {initial.premium ? (
              <p className="mt-4 text-[14.5px] text-mute">Your skin comes from your Minecraft profile. Change it in the Native launcher&apos;s Locker, it updates everywhere.</p>
            ) : (<>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
              onClick={() => file.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && file.current?.click()}
              role="button"
              tabIndex={0}
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center transition ${drag ? "border-fg bg-surface-2" : "border-dim hover:bg-surface"}`}
            >
              <Upload className="h-6 w-6" />
              <p className="text-[15px] font-semibold">Drop a skin here, or click to upload</p>
              <p className="text-[13px] text-dim">64×64 PNG · up to 512 KB · slim arms are detected automatically</p>
              <input ref={file} type="file" accept="image/png" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            </div>

            <p className="eyebrow mt-7">Presets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESET_SKINS.map((s) => (
                <button key={s.id} onClick={() => pickSkin(s.src, { model: s.model, name: s.name })} className="flex items-center gap-2.5 rounded-2xl border border-line py-1.5 pl-1.5 pr-4 text-[14px] font-medium text-mute transition hover:bg-surface-2 hover:text-fg">
                  <Head src={s.src} size={32} /> {s.name}
                </button>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between">
              <p className="eyebrow">Saved in this browser</p>
              <div className="flex gap-2">
                <button onClick={saveToLibrary} className="rounded-full border border-line px-3.5 py-1 text-[13px] font-semibold text-mute transition hover:bg-surface-2 hover:text-fg">Save current</button>
                <button onClick={download} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1 text-[13px] font-semibold text-mute transition hover:bg-surface-2 hover:text-fg"><Download className="h-3.5 w-3.5" /> PNG</button>
              </div>
            </div>
            {saved.length === 0 ? (
              <p className="mt-3 text-[14px] text-dim">Skins you save stay on this device. Nothing is uploaded until you press Save to account.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {saved.map((s) => (
                  <li key={s.id} className="group relative">
                    <button onClick={() => pickSkin(s.data, { model: s.model, name: s.name })} aria-label={`Use ${s.name}`} className="rounded-xl border border-line p-1.5 transition hover:bg-surface-2"><Head src={s.data} size={44} /></button>
                    <button onClick={() => persist(saved.filter((x) => x.id !== s.id))} aria-label={`Delete ${s.name}`} className="absolute -right-1.5 -top-1.5 hidden h-6 w-6 items-center justify-center rounded-full border border-line bg-bg text-mute hover:text-fg group-hover:flex group-focus-within:flex">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            </>)}
          </section>
              ) : (
                <section className="card p-6 sm:p-8" aria-label="Cosmetics">
                  <div role="tablist" aria-label="Cosmetic types" className="flex gap-1 overflow-x-auto rounded-[12px] border border-line p-1">
                    {COS_TABS.map((t) => {
                      const n = t.id === "cloaks" ? initial.nativeCapes?.length ?? 0 : allCos.filter((it) => it.slot === t.id && owned.has(it.id)).length;
                      const on = cosTab === t.id;
                      return (
                        <button key={t.id} role="tab" aria-selected={on} onClick={() => goCosTab(t.id)} className={`relative flex-1 whitespace-nowrap rounded-[8px] px-3 py-2 text-[13.5px] font-semibold transition ${on ? "text-fg" : "text-mute hover:text-fg"}`}>
                          {on && <motion.span layoutId="cos-slab" className="absolute inset-0 rounded-[8px] bg-surface-2 ring-1 ring-line" transition={{ type: "spring", stiffness: 520, damping: 32 }} />}
                          <span className="relative">{t.label}</span>{n > 0 && <span className="relative ml-1.5 text-[11.5px] text-dim">{n}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence mode="wait" initial={false} custom={dir}>
                    <motion.div key={cosTab} custom={dir} initial={{ opacity: 0, x: dir * 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * 28 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="mt-6">
                      {cosTab === "cloaks" ? (
<div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] text-dim">{initial.premium ? "Wear a Native cloak over your Minecraft cape, or go without. Your Minecraft capes are in the launcher's Locker." : "Pick a Native cloak or a classic cape, or go without."}</p>
              <Link href="/store?c=capes" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold transition hover:bg-surface-2">Browse Native cloaks <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {(initial.nativeCapes?.length ?? 0) > 0 && (
              <>
                <p className="eyebrow mt-6">Your Native cloaks</p>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {initial.nativeCapes!.map((c) => {
                    const on = wearing === c.id;
                    return (
                      <button key={c.id} onClick={() => wearNative(on ? null : c.id)} disabled={!!wearBusy} aria-pressed={on} title={on ? "Take off" : `Wear ${c.name}`} className={`flex items-center gap-3 rounded-2xl border p-3 text-left text-[14px] font-medium transition disabled:opacity-60 ${on ? "border-fg bg-surface-2 text-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`}>
                        <span className="flex h-12 w-[30px] shrink-0 items-center justify-center"><CapeStrip strip={c.animated ? c.stripUrl : null} still={c.stillUrl} frames={c.frames} fps={c.fps} width={30} label={`${c.name} cloak`} /></span>
                        <span className="min-w-0 leading-tight"><span className="block truncate">{c.name}</span>{c.animated && <span className="text-[11.5px] text-dim">Animated</span>}</span>
                        {wearBusy === c.id ? <Loader2 className="ml-auto h-4 w-4 shrink-0 animate-spin" /> : on && <Check className="ml-auto h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {!initial.premium && <p className="eyebrow mt-6">Classic capes</p>}
              </>
            )}
            {!initial.premium && <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {[{ id: "none", name: "No cape", src: null as string | null }, ...(base.current.capeId === "current" && base.current.capeUrl ? [{ id: "current", name: "Current cape", src: base.current.capeUrl }] : []), ...CAPES].map((c) => {
                const on = capeId === c.id;
                return (
                  <button key={c.id} onClick={() => pickCape(c.id, c.src)} aria-pressed={on} className={`flex items-center gap-3 rounded-2xl border p-3 text-left text-[14px] font-medium transition ${on ? "border-fg bg-surface-2 text-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`}>
                    <span className="flex h-12 w-[30px] shrink-0 items-center justify-center">{c.src ? <CapeThumb src={c.src} /> : <span className="h-12 w-[30px] rounded border border-dashed border-dim" />}</span>
                    <span className="leading-tight">{c.name}</span>
                    {on && <Check className="ml-auto h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>}
          {outfit.back && <p className="mt-5 rounded-xl border border-line px-4 py-3 text-[13.5px] text-mute">Your {cosById.get(outfit.back)?.name ?? "back item"} takes the cloak&apos;s place, in game too. <button className="font-semibold text-fg underline underline-offset-2" onClick={() => wearCos("back", null)}>Take it off</button> to show your cloak.</p>}
</div>
                      ) : renderSlot(cosTab)}
                    </motion.div>
                  </AnimatePresence>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="sticky bottom-4 z-30 mt-8">
        <div className="mx-auto flex max-w-[760px] flex-wrap items-center gap-3 rounded-full border border-line bg-bg/90 p-2.5 pl-6 shadow-[0_20px_60px_-20px_var(--shadow)] backdrop-blur-xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={msg?.s ?? (dirty ? "d" : "c")} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} role={msg?.t === "err" ? "alert" : "status"} className={`min-w-0 flex-1 text-[14px] ${msg?.t === "err" ? "font-semibold text-fg" : "text-mute"}`}>
              {msg ? msg.s : dirty ? "You have unsaved changes." : "Your locker is up to date."}
            </motion.p>
          </AnimatePresence>
          {dirty && <button onClick={revert} disabled={busy} className="h-11 rounded-full px-4 text-[14.5px] font-semibold text-mute transition hover:text-fg">Revert</button>}
          <button onClick={publish} disabled={!dirty || busy} className="inline-flex h-11 items-center gap-2 rounded-full bg-inv px-6 text-[14.5px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-40">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save to account
          </button>
        </div>
      </div>
    </div>
  );
}

/** A cosmetic worn on your skin. Items without their own thumbnail only have a texture sheet (a thin stripe), so that is never shown. */
function CosThumb({ it, skin, model, className }: { it: StoreItem; skin: string; model: Model; className: string }) {
  if (!it.modelUrl || !it.textureUrl) return it.stillUrl ? <img src={it.stillUrl} alt="" className={className} /> : null; // eslint-disable-line @next/next/no-img-element
  return <WornShot item={it} skin={skin} model={model} className={className} hideFallback={!it.stillUrl || it.stillUrl === it.textureUrl} />;
}
