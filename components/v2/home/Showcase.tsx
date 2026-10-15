"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import Lightroom, { type Shot as ViewerShot } from "./Lightroom";
import SectionHead from "../SectionHead";

const ease = [0.16, 1, 0.3, 1] as const;

type Shot = { src: string; w: number; h: number; t: string; d: string };

/** Every launcher screen, as it really looks. */
const SCREENS: (Shot & { id: string })[] = [
  { id: "home", t: "Home", d: "Your last instance front and centre, your skin in 3D, and the servers you play on one click away.", src: "/ui/win-home.webp", w: 1366, h: 728 },
  { id: "instances", t: "Instances", d: "Every setup kept apart: its own version, loader, mods and worlds. See what is running and how long you played.", src: "/ui/win-instances.webp", w: 1366, h: 728 },
  { id: "mods", t: "Mods", d: "Every mod in an instance in one list. Toggle, update or remove it, or drop in your own files.", src: "/ui/manager-mods.webp", w: 1366, h: 728 },
  { id: "screenshots", t: "Screenshots", d: "Everything you capture in game, in a gallery that belongs to the instance.", src: "/ui/manager-screenshots.webp", w: 1366, h: 728 },
  { id: "discover", t: "Discover", d: "Search Modrinth and CurseForge for mods, modpacks, shaders and resource packs. Install in one click.", src: "/ui/win-discover.webp", w: 1366, h: 728 },
  { id: "locker", t: "Locker", d: "Your skins, cloaks and cosmetics on your own 3D model. Try things on before you wear them.", src: "/ui/win-locker.webp", w: 1366, h: 728 },
  { id: "relay", t: "Relay chat", d: "Message friends with images and GIFs, see what server they are on and join them.", src: "/ui/win-relay.webp", w: 1366, h: 728 },
  { id: "friends", t: "Friends", d: "Who is online, what they are playing, requests and blocks, all in one place.", src: "/ui/win-friends.webp", w: 1366, h: 728 },
];

/** In-game screens from the Native mod. */
const INGAME: (Shot & { k: string; span: string; pos?: string })[] = [
  { k: "Multiplayer", t: "Everyone sees your look", d: "Capes and cosmetics show on every Native player, on any server.", src: "/ui/ingame-multiplayer.webp", w: 1600, h: 900, span: "lg:col-span-2 lg:row-span-2" },
  { k: "Mods menu", t: "20+ built-in modules", d: "FPS, CPS, keystrokes, coordinates and more. Switch each on in a click.", src: "/ui/ingame-mods.webp", w: 1600, h: 900, span: "" },
  { k: "Wardrobe", t: "Change your look in game", d: "Put on capes, hats and wings without leaving your world.", src: "/ui/ingame-cosmetics.webp", w: 1600, h: 900, span: "" },
  { k: "HUD editor", t: "Place every module", d: "Drag your HUD where you want it, then get back to playing.", src: "/ui/ingame-hud.webp", w: 1600, h: 900, span: "", pos: "object-[0%_45%]" },
  { k: "Native settings", t: "Everything one key away", d: "Mods, cosmetics, Relay chat and settings from a single menu.", src: "/ui/ingame-settings.webp", w: 1600, h: 900, span: "" },
];

const ROTATE_MS = 5500;

/** Every screenshot on the page, in one gallery (launcher first, then in game). */
const ALL: ViewerShot[] = [
  ...SCREENS.map(({ src, w, h, t, d }) => ({ src, w, h, t, d, group: "Launcher" })),
  ...INGAME.map(({ src, w, h, t, d }) => ({ src, w, h, t, d, group: "In game" })),
];
const indexOf = (src: string) => Math.max(0, ALL.findIndex((x) => x.src === src));

/** "Take the tour": every launcher screen behind tabs, playing on its own until you pick one. */
export function ScreenTour() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [from, setFrom] = useState<DOMRect | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const playing = inView && !paused && open === null;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setI((n) => (n + 1) % SCREENS.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [i, playing]);
  const s = SCREENS[i];
  return (
    <section id="tour" className="v-section v-wrap">
      <SectionHead index="(02)" label="Take the tour" title="See every screen." sub="No mockups. This is the Native launcher exactly as it looks on your desktop." />
      <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Launcher screens">
          {SCREENS.map((x, n) => (
            <button
              key={x.id} type="button" role="tab" aria-selected={n === i} onClick={() => setI(n)}
              className={`relative shrink-0 overflow-hidden rounded-full border px-4 py-2 text-[13.5px] font-semibold transition ${n === i ? "border-fg bg-fg text-bg" : "border-line bg-surface text-mute hover:text-fg"}`}
            >
              {x.t}
              {n === i && playing && (
                <motion.span key={`p${i}`} className="absolute bottom-0 left-0 h-[2px] bg-bg/60" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: ROTATE_MS / 1000, ease: "linear" }} />
              )}
            </button>
          ))}
        </div>
        <div className="grid items-start gap-[clamp(20px,3vw,44px)] lg:grid-cols-[minmax(0,1fr)_300px]">
          <button type="button" onClick={(e) => { setFrom(e.currentTarget.getBoundingClientRect()); setOpen(indexOf(s.src)); }} className="group relative block w-full cursor-zoom-in text-left" aria-label={`Open ${s.t} full size`}>
            <div className="v-shot relative aspect-[1366/728] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={s.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.015 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }}>
                  <Image src={s.src} alt={`Native launcher: ${s.t}`} fill sizes="(min-width:1024px) 900px, 94vw" className="object-cover object-top" priority={i === 0} />
                </motion.div>
              </AnimatePresence>
              <span className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Expand className="h-4 w-4" /></span>
            </div>
          </button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease }}>
              <p className="v-label">{String(i + 1).padStart(2, "0")} / {String(SCREENS.length).padStart(2, "0")}</p>
              <h3 className="v-display mt-4 text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.02] tracking-[-0.04em]">{s.t}</h3>
              <p className="mt-4 text-[16px] leading-relaxed text-mute">{s.d}</p>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {SCREENS.map((x, n) => (
                  <button key={x.id} type="button" onClick={() => setI(n)} aria-label={x.t} className={`relative aspect-[1366/728] overflow-hidden rounded-[6px] border transition ${n === i ? "border-fg" : "border-line opacity-55 hover:opacity-100"}`}>
                    <Image src={x.src} alt="" fill sizes="70px" className="object-cover object-top" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Lightroom shots={ALL} index={open} from={from} onIndex={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "In game", label: "In game" },
  { id: "Launcher", label: "Launcher" },
] as const;

/**
 * "Gallery": a swipeable cover-flow of every screenshot. The middle shot is full size and the others
 * shrink, tilt and dim with their distance from the centre. Drag it, scroll it, use the arrows or the
 * keyboard; filter by where the shot is from; click the middle one to open it in Lightroom.
 */
export function ShotGallery() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("In game");
  const shots = useMemo(() => (filter === "all" ? ALL : ALL.filter((x) => x.group === filter)), [filter]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [from, setFrom] = useState<DOMRect | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: number } | null>(null);
  const frame = useRef(0);
  const dragged = useRef(false);

  // every card's size / tilt / dim from its distance to the centre of the track
  const paint = useCallback(() => {
    frame.current = 0;
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bestD = Infinity;
    el.querySelectorAll<HTMLElement>("[data-card]").forEach((card, i) => {
      const c = card.offsetLeft + card.offsetWidth / 2;
      const d = (c - mid) / card.offsetWidth;
      const a = Math.min(Math.abs(d), 1.4);
      card.style.setProperty("--s", String(1 - a * 0.14));
      card.style.setProperty("--r", `${Math.max(-1, Math.min(1, d)) * -10}deg`);
      card.style.setProperty("--o", String(1 - Math.min(a, 1) * 0.55));
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
    });
    setActive(best);
  }, []);
  const schedule = () => { if (!frame.current) frame.current = requestAnimationFrame(paint); };
  useEffect(() => {
    paint();
    window.addEventListener("resize", schedule);
    return () => window.removeEventListener("resize", schedule);
  }, [paint, shots]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTo = (i: number, smooth = true) => {
    const el = track.current;
    const card = el?.querySelectorAll<HTMLElement>("[data-card]")[i];
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2, behavior: smooth ? "smooth" : "auto" });
  };
  // a new filter starts at its first shot
  useEffect(() => { scrollTo(0, false); requestAnimationFrame(paint); }, [shots]); // eslint-disable-line react-hooks/exhaustive-deps

  const s = shots[active] ?? shots[0];
  return (
    <section id="gallery" className="v-section overflow-hidden">
      <div className="v-wrap">
        <SectionHead index="(03)" label="Gallery" title="Native comes into the game with you." sub="A mods menu, a HUD editor, your wardrobe and Relay chat inside Minecraft, plus every launcher screen. Drag through it, then open any shot full screen." />
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? ALL.length : ALL.filter((x) => x.group === f.id).length;
            return (
              <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition ${filter === f.id ? "border-fg bg-fg text-bg" : "border-line bg-surface text-mute hover:text-fg"}`}>
                {f.label}<span className={`font-mono text-[11px] ${filter === f.id ? "text-bg/60" : "text-dim"}`}>{count}</span>
              </button>
            );
          })}
          <span className="ml-auto hidden items-center gap-2 sm:flex">
            <button type="button" onClick={() => scrollTo(Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous shot" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface transition hover:bg-fg hover:text-bg disabled:opacity-30 disabled:hover:bg-surface disabled:hover:text-fg"><ArrowLeft className="h-[18px] w-[18px]" /></button>
            <button type="button" onClick={() => scrollTo(Math.min(shots.length - 1, active + 1))} disabled={active === shots.length - 1} aria-label="Next shot" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface transition hover:bg-fg hover:text-bg disabled:opacity-30 disabled:hover:bg-surface disabled:hover:text-fg"><ArrowRight className="h-[18px] w-[18px]" /></button>
          </span>
        </div>
      </div>

      <div
        ref={track}
        tabIndex={0}
        aria-label="Screenshots"
        onScroll={schedule}
        onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); scrollTo(Math.min(shots.length - 1, active + 1)); } if (e.key === "ArrowLeft") { e.preventDefault(); scrollTo(Math.max(0, active - 1)); } }}
        onPointerDown={(e) => { if (e.pointerType !== "mouse") return; drag.current = { x: e.clientX, left: track.current!.scrollLeft, moved: 0 }; track.current!.classList.add("is-dragging"); }}
        onPointerMove={(e) => { const d = drag.current; if (!d) return; d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x)); track.current!.scrollLeft = d.left - (e.clientX - d.x); }}
        onPointerUp={() => { const d = drag.current; drag.current = null; track.current?.classList.remove("is-dragging"); dragged.current = Boolean(d && d.moved > 6); if (dragged.current) scrollTo(active); }}
        onPointerLeave={() => { if (drag.current) { drag.current = null; track.current?.classList.remove("is-dragging"); scrollTo(active); } }}
        className="v-coverflow flex snap-x snap-mandatory gap-[clamp(10px,2vw,28px)] overflow-x-auto py-8 outline-none [scrollbar-width:none] [&.is-dragging]:cursor-grabbing [&.is-dragging]:snap-none"
        style={{ paddingInline: "calc(50% - min(38vw, 470px))", perspective: 1600 }}
      >
        {shots.map((x, i) => (
          <button
            key={`${filter}-${x.src}`}
            data-card
            type="button"
            onClick={(e) => {
              if (dragged.current) { dragged.current = false; return; } // the end of a drag is not a click
              if (i !== active) { scrollTo(i); return; }
              setFrom(e.currentTarget.getBoundingClientRect());
              setOpen(i);
            }}
            aria-label={i === active ? `Open ${x.t} full screen` : `Show ${x.t}`}
            className={`group relative aspect-video w-[min(76vw,940px)] shrink-0 snap-center overflow-hidden rounded-[clamp(14px,1.6vw,22px)] bg-surface ring-1 ring-line transition-[box-shadow] duration-500 ${i === active ? "cursor-zoom-in shadow-[0_40px_100px_-30px_rgb(0_0_0/0.7)]" : "cursor-pointer"}`}
            style={{ transform: "rotateY(var(--r, 0deg)) scale(var(--s, 1))", opacity: "var(--o, 1)", transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s" } as React.CSSProperties}
          >
            <Image src={x.src} alt={x.t} fill draggable={false} sizes="(min-width:1240px) 940px, 76vw" className="select-none object-cover object-top" />
            <span className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-[clamp(14px,2vw,26px)] pt-16 text-left text-white transition duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}>
              <span className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">{x.group}</span>
                <span className="mt-1 block text-[clamp(1.1rem,2vw,1.7rem)] font-bold leading-tight tracking-tight">{x.t}</span>
                <span className="mt-1 hidden max-w-[560px] text-[14px] leading-snug text-white/70 sm:block">{x.d}</span>
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition group-hover:scale-110"><Expand className="h-[18px] w-[18px]" /></span>
            </span>
          </button>
        ))}
      </div>

      <div className="v-wrap mt-2 flex items-center justify-center gap-1.5" aria-hidden="true">
        {shots.map((x, i) => (
          <button key={x.src} type="button" tabIndex={-1} onClick={() => scrollTo(i)} className="group py-2">
            <span className={`block h-[5px] rounded-full transition-all duration-500 ${i === active ? "w-8 bg-fg" : "w-[5px] bg-line group-hover:bg-mute"}`} />
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{s ? `${active + 1} of ${shots.length}: ${s.t}` : ""}</p>

      <Lightroom shots={shots} index={open} from={from} onIndex={(i) => { setOpen(i); scrollTo(i, false); }} onClose={() => setOpen(null)} />
    </section>
  );
}
