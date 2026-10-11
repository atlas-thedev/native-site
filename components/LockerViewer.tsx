"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CapeAnim } from "@/lib/store";
import { loadStrip, reducedMotion, stripFrame } from "./capeAnim";
import { fetchModel, type Worn } from "./cosmetics/CosmeticViewer";

type Built = { update: (t: number, walk: number) => void; dispose: () => void };

export type ViewerHandle = { reset: () => void; zoom: (factor: number) => { in: boolean; out: boolean }; pause: (paused: boolean) => void };
const ZMIN = 0.45;
const ZMAX = 1.8;
type Props = {
  skin: string;
  cape: string | null;
  model: "default" | "slim";
  walk: boolean;
  spin: boolean;
  showCape: boolean;
  layers: boolean;
  elytra?: boolean;
  /** Animated cape strip; `cape` stays as the still fallback. */
  capeAnim?: CapeAnim | null;
  /** Native 3D cosmetics to wear (a back item hides the cape, like in game). */
  worn?: Worn[];
  onError?: () => void;
  /** Camera zoom; lower shows more headroom for tall hats. */
  zoom?: number;
  /** A fixed pose instead of walk/idle: "wave" says hi with the right arm. */
  pose?: "wave";
};

/** Responsive, transparent skinview3d canvas used by the account locker. */
const LockerViewer = forwardRef<ViewerHandle, Props>(function LockerViewer({ skin, cape, model, walk, spin, showCape: showCapeIn, layers, elytra, capeAnim, worn = [], onError, zoom = 0.7, pose }, ref) {
  const showCape = showCapeIn && !worn.some((w) => w.slot === "back");
  const built = useRef<Built[]>([]);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const walkRef = useRef(walk);
  walkRef.current = walk;
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const v = useRef<import("skinview3d").SkinViewer | null>(null);
  const lib = useRef<typeof import("skinview3d") | null>(null);
  const props = useRef<Props>({ skin, cape, model, walk, spin, showCape, layers, elytra, capeAnim, pose });
  props.current = { skin, cape, model, walk, spin, showCape, layers, elytra, capeAnim, pose };

  const apply = () => {
    const sv = v.current;
    const l = lib.current;
    if (!sv || !l) return;
    const p = props.current;
    sv.autoRotate = p.spin;
    sv.autoRotateSpeed = 0.9;
    if (p.pose === "wave") {
      if (!(sv.animation instanceof l.FunctionAnimation)) {
        // Friendly hi: right arm up and waving, head tilted, the rest relaxed.
        sv.animation = new l.FunctionAnimation((pl, t) => {
          const s = pl.skin;
          const b = Math.sin(t * 1.6);
          pl.rotation.y = -0.3;
          s.leftArm.rotation.set(0, 0, Math.PI * 0.8 + Math.sin(t * 6) * 0.28);
          s.rightArm.rotation.set(-0.12 + b * 0.04, 0, -Math.PI * 0.04 - b * 0.02);
          s.head.rotation.set(0.05 + b * 0.02, 0.2, -0.12 - Math.sin(t * 3) * 0.04);
          s.leftLeg.rotation.set(-0.08, 0, 0.03);
          s.rightLeg.rotation.set(0.08, 0, -0.03);
        });
      }
    } else if (p.walk) {
      if (!(sv.animation instanceof l.WalkingAnimation)) {
        sv.animation = new l.WalkingAnimation();
        sv.animation.speed = 0.6;
      }
    } else if (!(sv.animation instanceof l.IdleAnimation)) sv.animation = new l.IdleAnimation();
    sv.playerObject.skin.setOuterLayerVisible(p.layers);
    sv.playerObject.backEquipment = (p.cape || p.capeAnim) && p.showCape ? (p.elytra ? "elytra" : "cape") : null;
  };

  useEffect(() => {
    let dead = false;
    let ro: ResizeObserver | undefined;
    let io: IntersectionObserver | undefined;
    (async () => {
      const l = await import("skinview3d");
      if (dead || !canvas.current || !wrap.current) return;
      lib.current = l;
      const r = wrap.current.getBoundingClientRect();
      const sv = new l.SkinViewer({ canvas: canvas.current, width: Math.max(200, r.width), height: Math.max(260, r.height), pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5) });
      sv.zoom = zoomRef.current;
      sv.fov = 38;
      sv.controls.enableZoom = false;
      sv.controls.enablePan = false;
      sv.camera.rotation.x = -0.2;
      const start = performance.now();
      const base = sv.render.bind(sv);
      sv.render = () => {
        const t = (performance.now() - start) / 1000;
        for (const b of built.current) b.update(t, walkRef.current ? 1 : 0);
        base();
      };
      v.current = sv;
      const p = props.current;
      loadCosmetics();
      sv.loadSkin(p.skin, { model: p.model === "slim" ? "slim" : "auto-detect" }).catch(() => onError?.());
      if (p.cape && !p.capeAnim) sv.loadCape(p.cape, { backEquipment: p.elytra ? "elytra" : "cape" }).catch(() => {});
      apply();
      ro = new ResizeObserver(() => {
        if (!wrap.current || !v.current) return;
        const b = wrap.current.getBoundingClientRect();
        if (b.width > 50 && b.height > 50) v.current.setSize(b.width, b.height);
      });
      ro.observe(wrap.current);
      // stop drawing while the preview is scrolled out of view (keeps the page smooth)
      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver((e) => { if (v.current) v.current.renderPaused = !e.some((x) => x.isIntersecting); });
        io.observe(wrap.current);
      }
    })();
    return () => {
      dead = true;
      ro?.disconnect();
      io?.disconnect();
      built.current.forEach((b) => b.dispose());
      built.current = [];
      v.current?.dispose();
      v.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    v.current?.loadSkin(skin, { model: model === "slim" ? "slim" : "auto-detect" }).catch(() => onError?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skin, model]);
  const animKey = capeAnim ? `${capeAnim.url}|${capeAnim.frames}|${capeAnim.fps}` : "";
  useEffect(() => {
    let dead = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const equip = elytra ? "elytra" : "cape";
    const still = () => {
      if (cape) v.current?.loadCape(cape, { backEquipment: equip }).then(apply).catch(() => {});
      else v.current?.resetCape();
    };
    if (!capeAnim) {
      still();
      return;
    }
    // Animated cape: load frame 0 as a normal cape, then redraw the cape canvas in place each tick.
    loadStrip(capeAnim.url)
      .then(async (img) => {
        if (dead) return;
        const g = stripFrame(img, capeAnim);
        const frame = document.createElement("canvas");
        frame.width = g.w;
        frame.height = g.h;
        const fx = frame.getContext("2d")!;
        fx.drawImage(img, 0, 0, g.w, g.h, 0, 0, g.w, g.h);
        // wait for the viewer if it is still booting
        for (let n = 0; !v.current && n < 50 && !dead; n++) await new Promise((r) => setTimeout(r, 100));
        const sv = v.current;
        if (dead || !sv) return;
        await sv.loadCape(frame, { backEquipment: equip });
        apply();
        if (dead || reducedMotion() || g.frames < 2) return;
        let i = 0;
        timer = setInterval(() => {
          const s = v.current;
          const tex = s && (s as unknown as { capeTexture: { needsUpdate: boolean } | null }).capeTexture;
          if (!s || !tex || document.hidden) return;
          i = (i + 1) % g.frames;
          const cx = s.capeCanvas.getContext("2d");
          if (!cx) return;
          cx.clearRect(0, 0, s.capeCanvas.width, s.capeCanvas.height);
          cx.drawImage(img, 0, i * g.h, g.w, g.h, 0, 0, s.capeCanvas.width, s.capeCanvas.height);
          tex.needsUpdate = true;
        }, 1000 / capeAnim.fps);
      })
      .catch(still);
    return () => {
      dead = true;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cape, elytra, animKey]);
  useEffect(apply, [walk, spin, showCape, layers, cape, elytra, pose]);

  // Native 3D cosmetics (NCM v1)
  const wornKey = worn.map((w) => `${w.id}|${w.modelUrl}|${w.textureUrl}|${w.side ?? ""}`).join(",");
  const wornRef = useRef(worn);
  wornRef.current = worn;
  const gen = useRef(0);
  const loadCosmetics = () => {
    if (!v.current) return;
    const mine = ++gen.current;
    const list = wornRef.current;
    Promise.all([import("three"), import("@/lib/ncm")]).then(async ([THREE, ncm]) => {
      const next: Built[] = [];
      for (const w of list) {
        try {
          const [json, image] = await Promise.all([fetchModel(w.modelUrl), ncm.loadImage(w.textureUrl)]);
          if (mine !== gen.current || !v.current) break;
          const b = ncm.buildCosmetic(THREE, json, image) as Built & { roots: { object: import("three").Object3D }[] };
          for (const r of b.roots)
            r.object.traverse((o) => {
              const g = (o as import("three").Mesh).geometry;
              if (g && !g.attributes.normal) g.computeVertexNormals();
            });
          // hand items / balloons: show the side the player picked (null = the item's default)
          (b as unknown as { setSide?: (s: unknown) => void }).setSide?.(w.side);
          next.push(ncm.attachToPlayer(b, v.current.playerObject.skin));
        } catch {
          /* a broken cosmetic is skipped */
        }
      }
      if (mine !== gen.current) {
        next.forEach((b) => b.dispose());
        return;
      }
      built.current.forEach((b) => b.dispose());
      built.current = next;
    }).catch(() => {});
  };
  useEffect(loadCosmetics, [wornKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Smooth camera zoom, like the launcher locker.
  const tween = useRef(0);
  const zoomTo = (target: number) => {
    const sv = v.current;
    if (!sv) return;
    cancelAnimationFrame(tween.current);
    const from = sv.zoom;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 260);
      const e = 1 - Math.pow(1 - k, 3);
      if (v.current) v.current.zoom = from + (target - from) * e;
      if (k < 1) tween.current = requestAnimationFrame(step);
    };
    tween.current = requestAnimationFrame(step);
  };
  const target = useRef<number | null>(null);
  useImperativeHandle(ref, () => ({
    reset: () => {
      const sv = v.current;
      if (!sv) return;
      sv.controls.reset();
      sv.camera.rotation.x = -0.2;
      target.current = zoomRef.current;
      zoomTo(zoomRef.current);
    },
    /** Button zoom (the wheel is left to the page so scrolling never gets stuck on the preview). */
    zoom: (factor: number) => {
      const sv = v.current;
      const now = target.current ?? sv?.zoom ?? zoomRef.current;
      const next = Math.min(ZMAX, Math.max(ZMIN, now * factor));
      target.current = next;
      zoomTo(next);
      return { in: next < ZMAX - 0.001, out: next > ZMIN + 0.001 };
    },
    pause: (paused: boolean) => {
      const sv = v.current;
      if (!sv) return;
      if (sv.animation) sv.animation.paused = paused;
      sv.autoRotate = !paused && props.current.spin;
    },
  }));

  return (
    <div ref={wrap} className="h-full w-full">
      <canvas ref={canvas} className="cutout-sm block h-full w-full" aria-label="3D preview of your skin" />
    </div>
  );
});

export default LockerViewer;
