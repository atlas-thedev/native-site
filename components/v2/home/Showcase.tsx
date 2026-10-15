"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";
import GalleryViewer, { type Shot as ViewerShot } from "./GalleryViewer";
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
          <button type="button" onClick={() => setOpen(indexOf(s.src))} className="group relative block w-full cursor-zoom-in text-left" aria-label={`Open ${s.t} full size`}>
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
      <GalleryViewer shots={ALL} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}

/** "In game": the Native mod's screens in a bento grid. */
export function InGame() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="in-game" className="v-section v-wrap">
      <SectionHead index="(03)" label="In game" title="Native comes into the game with you." sub="The Native mod adds a mods menu, a HUD editor, your wardrobe and Relay chat inside Minecraft, and shows everyone's capes and cosmetics." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {INGAME.map((x, n) => (
          <motion.button
            key={x.src} type="button" onClick={() => setOpen(indexOf(x.src))}
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
      <GalleryViewer shots={ALL} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}
