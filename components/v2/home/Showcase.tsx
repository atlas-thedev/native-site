"use client";

import { motion } from "motion/react";
import { STAT_FLOORS } from "@/lib/site";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import Lightroom, { type Shot as ViewerShot } from "./Lightroom";
import SectionHead from "../SectionHead";

const ease = [0.16, 1, 0.3, 1] as const;

type Shot = { src: string; w: number; h: number; t: string; d: string };

/** Every launcher screen, as it really looks. */
const SCREENS: (Shot & { id: string })[] = [
  { id: "home", t: "Home", d: "Your last instance front and centre, your skin in 3D, and the servers you play on one click away.", src: "/ui/win-home-v5.webp", w: 1366, h: 728 },
  { id: "instances", t: "Instances", d: "Every setup kept apart: its own version, loader, mods and worlds. See what is running and how long you played.", src: "/ui/win-instances-v5.webp", w: 1366, h: 728 },
  { id: "mods", t: "Mods", d: "Every mod in an instance in one list. Toggle, update or remove it, or drop in your own files.", src: "/ui/manager-mods-v5.webp", w: 1366, h: 728 },
  { id: "screenshots", t: "Screenshots", d: "Everything you capture in game, in a gallery that belongs to the instance.", src: "/ui/manager-screenshots-v5.webp", w: 1366, h: 728 },
  { id: "discover", t: "Discover", d: "Search Modrinth and CurseForge for mods, modpacks, shaders and resource packs. Install in one click.", src: "/ui/win-discover-v5.webp", w: 1366, h: 728 },
  { id: "locker", t: "Locker", d: "Your skins, cloaks and cosmetics on your own 3D model. Try things on before you wear them.", src: "/ui/win-locker-v5.webp", w: 1366, h: 728 },
  { id: "relay", t: "Relay chat", d: "Message friends with images and GIFs, see what server they are on and join them.", src: "/ui/win-relay-v5.webp", w: 1366, h: 728 },
  { id: "friends", t: "Friends", d: "Who is online, what they are playing, requests and blocks, all in one place.", src: "/ui/win-friends-v5.webp", w: 1366, h: 728 },
];

/** In-game screens from the Native mod. */
const INGAME: (Shot & { k: string; span: string; pos?: string })[] = [
  { k: "Multiplayer", t: "Everyone sees your look", d: "Capes and cosmetics show on every Native player, on any server.", src: "/ui/ingame-multiplayer-v5.webp", w: 1600, h: 900, span: "lg:col-span-2 lg:row-span-2" },
  { k: "Mods menu", t: `${STAT_FLOORS.modules}+ built-in modules`, d: "FPS, CPS, keystrokes, coordinates and more. Switch each on in a click.", src: "/ui/ingame-mods-v5.webp", w: 1600, h: 900, span: "" },
  { k: "Wardrobe", t: "Change your look in game", d: "Put on capes, hats and wings without leaving your world.", src: "/ui/ingame-cosmetics-v5.webp", w: 1600, h: 900, span: "" },
  { k: "HUD editor", t: "Place every module", d: "Drag your HUD where you want it, then get back to playing.", src: "/ui/ingame-hud-v5.webp", w: 1600, h: 900, span: "", pos: "object-[0%_45%]" },
  { k: "Native settings", t: "Everything one key away", d: "Mods, cosmetics, Relay chat and settings from a single menu.", src: "/ui/ingame-settings-v5.webp", w: 1600, h: 900, span: "" },
];

const ROTATE_MS = 5500;

/** Every screenshot on the page, in one gallery (launcher first, then in game). */
const ALL: ViewerShot[] = [
  ...SCREENS.map(({ src, w, h, t, d }) => ({ src, w, h, t, d, group: "Launcher" })),
  ...INGAME.map(({ src, w, h, t, d }) => ({ src, w, h, t, d, group: "In game" })),
];
const SCREENS_SHOTS = ALL.filter((x) => x.group === "Launcher");
const INGAME_SHOTS = ALL.filter((x) => x.group === "In game");
const indexOf = (src: string) => Math.max(0, INGAME_SHOTS.findIndex((x) => x.src === src));

/**
 * "See every screen": a cover-flow of every launcher screen. The middle screen is full size, the
 * others shrink, tilt and dim with their distance from the centre. It plays on its own while it is
 * on screen (pauses on hover), and you can drag it, use the screen tabs, the arrows or the keyboard.
 * Click the middle screen to open it in Lightroom.
 */
export function ScreenTour() {
  const shots = SCREENS_SHOTS;
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [from, setFrom] = useState<DOMRect | null>(null);
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(false);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: number } | null>(null);
  const dragged = useRef(false);
  const frame = useRef(0);

  // every card's size / tilt / dim from its distance to the centre of the track
  const paint = useCallback(() => {
    frame.current = 0;
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bestD = Infinity;
    el.querySelectorAll<HTMLElement>("[data-card]").forEach((card, i) => {
      const d = (card.offsetLeft + card.offsetWidth / 2 - mid) / card.offsetWidth;
      const a = Math.min(Math.abs(d), 1.4);
      card.style.setProperty("--s", String(1 - a * 0.14));
      card.style.setProperty("--r", `${Math.max(-1, Math.min(1, d)) * -10}deg`);
      card.style.setProperty("--o", String(1 - Math.min(a, 1) * 0.55));
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
    });
    setActive(best);
  }, []);
  const schedule = () => { if (!frame.current) frame.current = requestAnimationFrame(paint); };
  const scrollTo = useCallback((i: number, smooth = true) => {
    const el = track.current;
    const card = el?.querySelectorAll<HTMLElement>("[data-card]")[i];
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollTo(0, false);
    paint();
    const resize = () => { scrollTo(active, false); schedule(); };
    window.addEventListener("resize", resize);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    if (section.current) io.observe(section.current);
    return () => { window.removeEventListener("resize", resize); io.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // plays on its own while visible and left alone
  const playing = inView && !hover && open === null;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => scrollTo((active + 1) % shots.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [playing, active, shots.length, scrollTo]);

  // the active tab stays in view on small screens
  useEffect(() => {
    const tab = tabs.current?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    const bar = tabs.current;
    if (tab && bar) bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <section ref={section} id="tour" className="v-section overflow-hidden">
      <div className="v-wrap">
        <SectionHead index="(02)" label="Take the tour" title="See every screen." sub="No mockups. This is the Native launcher exactly as it looks on your desktop. Drag through it, then open any screen full size." />
        <div className="mb-2 flex items-center gap-3">
          <div ref={tabs} className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Launcher screens">
            {shots.map((x, i) => (
              <button
                key={x.src} data-i={i} type="button" role="tab" aria-selected={i === active} onClick={() => scrollTo(i)}
                className={`relative shrink-0 overflow-hidden rounded-full border px-4 py-2 text-[13.5px] font-semibold transition ${i === active ? "border-fg bg-fg text-bg" : "border-line bg-surface text-mute hover:text-fg"}`}
              >
                {x.t}
                {i === active && playing && (
                  <motion.span key={`p${active}`} className="absolute bottom-0 left-0 h-[2px] bg-bg/60" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: ROTATE_MS / 1000, ease: "linear" }} />
                )}
              </button>
            ))}
          </div>
          <span className="hidden shrink-0 items-center gap-2 sm:flex">
            <button type="button" onClick={() => scrollTo((active - 1 + shots.length) % shots.length)} aria-label="Previous screen" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface transition hover:bg-fg hover:text-bg"><ArrowLeft className="h-[18px] w-[18px]" /></button>
            <button type="button" onClick={() => scrollTo((active + 1) % shots.length)} aria-label="Next screen" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface transition hover:bg-fg hover:text-bg"><ArrowRight className="h-[18px] w-[18px]" /></button>
          </span>
        </div>
      </div>

      <div
        ref={track}
        tabIndex={0}
        aria-label="Launcher screens"
        onScroll={schedule}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); scrollTo(Math.min(shots.length - 1, active + 1)); } if (e.key === "ArrowLeft") { e.preventDefault(); scrollTo(Math.max(0, active - 1)); } }}
        onPointerDown={(e) => { if (e.pointerType !== "mouse") return; drag.current = { x: e.clientX, left: track.current!.scrollLeft, moved: 0 }; track.current!.classList.add("is-dragging"); }}
        onPointerMove={(e) => { const d = drag.current; if (!d) return; d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x)); track.current!.scrollLeft = d.left - (e.clientX - d.x); }}
        onPointerUp={() => { const d = drag.current; drag.current = null; track.current?.classList.remove("is-dragging"); dragged.current = Boolean(d && d.moved > 6); if (dragged.current) scrollTo(active); }}
        onPointerLeave={() => { if (drag.current) { drag.current = null; track.current?.classList.remove("is-dragging"); scrollTo(active); } }}
        className="flex snap-x snap-mandatory gap-[clamp(10px,2vw,28px)] overflow-x-auto py-8 outline-none [scrollbar-width:none] [&.is-dragging]:cursor-grabbing [&.is-dragging]:snap-none"
        style={{ paddingInline: "calc(50% - min(38vw, 470px))", perspective: 1600 }}
      >
        {shots.map((x, i) => (
          <button
            key={x.src}
            data-card
            type="button"
            onClick={(e) => {
              if (dragged.current) { dragged.current = false; return; } // the end of a drag is not a click
              if (i !== active) { scrollTo(i); return; }
              setFrom(e.currentTarget.getBoundingClientRect());
              setOpen(i);
            }}
            aria-label={i === active ? `Open ${x.t} full size` : `Show ${x.t}`}
            className={`group relative aspect-[1366/728] w-[min(76vw,940px)] shrink-0 snap-center overflow-hidden rounded-[clamp(14px,1.6vw,22px)] bg-surface ring-1 ring-line transition-[box-shadow] duration-500 ${i === active ? "cursor-zoom-in shadow-[0_40px_100px_-30px_rgb(0_0_0/0.7)]" : "cursor-pointer"}`}
            style={{ transform: "rotateY(var(--r, 0deg)) scale(var(--s, 1))", opacity: "var(--o, 1)", transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s" } as React.CSSProperties}
          >
            <Image src={x.src} alt={`Native launcher: ${x.t}`} fill draggable={false} priority={i === 0} sizes="(min-width:1240px) 940px, 76vw" className="select-none object-cover object-top" />
            <span className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-[clamp(14px,2vw,26px)] pt-16 text-left text-white transition duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}>
              <span className="min-w-0">
                <span className="font-mono text-[11px] tracking-[0.14em] text-white/55">{String(i + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}</span>
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
      <p className="sr-only" aria-live="polite">{`${active + 1} of ${shots.length}: ${shots[active]?.t ?? ""}`}</p>

      <Lightroom shots={shots} index={open} from={from} onIndex={(i) => { setOpen(i); scrollTo(i, false); }} onClose={() => setOpen(null)} />
    </section>
  );
}

/** "In game": the Native mod's screens in a bento grid. */
export function InGame() {
  const [open, setOpen] = useState<number | null>(null);
  const [from, setFrom] = useState<DOMRect | null>(null);
  return (
    <section id="in-game" className="v-section v-wrap">
      <SectionHead index="(03)" label="In game" title="Native comes into the game with you." sub="The Native mod adds a mods menu, a HUD editor, your wardrobe and Relay chat inside Minecraft, and shows everyone's capes and cosmetics." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {INGAME.map((x, n) => (
          <motion.button
            key={x.src} type="button" onClick={(e) => { setFrom(e.currentTarget.getBoundingClientRect()); setOpen(indexOf(x.src)); }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.8, delay: n * 0.06, ease }}
            className={`group relative min-h-[220px] cursor-zoom-in overflow-hidden rounded-[18px] border border-line bg-surface text-left ${x.span} ${n === 0 ? "sm:col-span-2 lg:min-h-[460px]" : ""}`}
          >
            <Image src={x.src} alt={x.t} fill sizes={n === 0 ? "(min-width:1024px) 640px, 94vw" : "(min-width:1024px) 320px, 94vw"} className={`object-cover transition duration-700 group-hover:scale-[1.04] ${x.pos ?? ""}`} />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">{x.k}</span>
              <span className={`mt-1.5 block font-bold tracking-tight ${n === 0 ? "text-[clamp(1.4rem,2.4vw,2rem)]" : "text-[17px]"}`}>{x.t}</span>
              <span className={`mt-1 block leading-snug text-white/70 ${n === 0 ? "max-w-[460px] text-[15px]" : "text-[13px]"}`}>{x.d}</span>
            </span>
            <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Expand className="h-3.5 w-3.5" /></span>
          </motion.button>
        ))}
      </div>
      <Lightroom shots={INGAME_SHOTS} index={open} from={from} onIndex={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}
