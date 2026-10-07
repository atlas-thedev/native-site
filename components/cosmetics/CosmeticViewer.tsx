"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CosmeticSlot } from "@/lib/store";

export type CosmeticViewerHandle = { reset: () => void; zoom: (factor: number) => void };
export type Worn = { id: string; modelUrl: string; textureUrl: string; slot?: string; side?: "left" | "right" | null };
type Built = { model: { flat: { anim: unknown[] }[] }; update: (t: number, walk: number) => void; dispose: () => void };
type Props = {
  skin: string;
  model: "default" | "slim";
  cape: string | null;
  /** what the player has on, one per slot */
  worn: Worn[];
  walk: boolean;
  spin: boolean;
  /** turns the camera to the slot that was picked last */
  focus: CosmeticSlot | null;
  onError?: () => void;
};

/** Where the camera looks for each slot: [orbit angle, target height, zoom]. */
const SHOTS: Record<CosmeticSlot | "all", [number, number, number]> = {
  all: [0.5, -1, 0.55],
  hats: [0.45, 10, 0.85],
  glasses: [0.3, 9, 1.0],
  back: [Math.PI - 0.6, 3, 0.62],
  shoes: [0.7, -17, 0.95],
  hand: [0.55, -2, 0.7],
  balloon: [0.4, 6, 0.55],
};

const models = new Map<string, Promise<unknown>>();
export const fetchModel = (url: string) => {
  if (!models.has(url)) models.set(url, fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error("model failed")))));
  const p = models.get(url)!;
  p.catch(() => models.delete(url));
  return p;
};

/** skinview3d player wearing Native 3D cosmetics (NCM v1), with a camera that flies to each slot. */
const CosmeticViewer = forwardRef<CosmeticViewerHandle, Props>(function CosmeticViewer({ skin, model, cape: capeIn, worn, walk, spin, focus, onError }, ref) {
  // a back item (wings, jetpack, backpack) takes the cape's place, like in game
  const cape = worn.some((w) => w.slot === "back") ? null : capeIn;
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const v = useRef<import("skinview3d").SkinViewer | null>(null);
  const lib = useRef<typeof import("skinview3d") | null>(null);
  const built = useRef<Built[]>([]);
  const walkRef = useRef(walk);
  const shot = useRef<{ from: [number, number, number]; to: [number, number, number]; at: number; wrap: number; keep?: boolean } | null>(null);
  const props = useRef({ skin, model, cape, walk, spin });
  props.current = { skin, model, cape, walk, spin };
  walkRef.current = walk;

  // a skin that fails to load falls back to Steve/Alex so the stage is never empty
  const loadSkin = (sv: import("skinview3d").SkinViewer, src: string, m: "default" | "slim") =>
    sv.loadSkin(src, { model: m }).catch(() => {
      onError?.();
      sv.loadSkin(m === "slim" ? "/skins/alex.png" : "/skins/steve.png", { model: m }).catch(() => {});
    });

  const apply = () => {
    const sv = v.current;
    const l = lib.current;
    if (!sv || !l) return;
    const p = props.current;
    sv.autoRotate = p.spin;
    sv.autoRotateSpeed = 0.8;
    if (p.walk) {
      if (!(sv.animation instanceof l.WalkingAnimation)) {
        sv.animation = new l.WalkingAnimation();
        sv.animation.speed = 0.55;
      }
    } else if (!(sv.animation instanceof l.IdleAnimation)) sv.animation = new l.IdleAnimation();
  };

  /** Current camera as [angle around the player, target height, zoom]. */
  const current = (): [number, number, number] => {
    const sv = v.current!;
    const c = sv.camera.position;
    const t = sv.controls.target;
    return [Math.atan2(c.x - t.x, c.z - t.z), t.y, (sv as unknown as { _zoom: number })._zoom];
  };
  const userZoom = useRef(1);
  const flyTo = (target: [number, number, number], keepZoom = false) => {
    if (!v.current) return;
    if (!keepZoom) userZoom.current = 1;
    const to: [number, number, number] = [target[0], target[1], Math.min(2.6, Math.max(0.35, target[2] * userZoom.current))];
    const w = v.current.playerWrapper.rotation.y;
    shot.current = { from: current(), to, at: performance.now(), wrap: Math.atan2(Math.sin(w), Math.cos(w)), keep: keepZoom };
  };

  useEffect(() => {
    let dead = false;
    let ro: ResizeObserver | undefined;
    (async () => {
      const l = await import("skinview3d");
      if (dead || !canvas.current || !wrap.current) return;
      lib.current = l;
      const r = wrap.current.getBoundingClientRect();
      const sv = new l.SkinViewer({ canvas: canvas.current, width: Math.max(200, r.width), height: Math.max(260, r.height) });
      sv.fov = 36;
      sv.zoom = SHOTS.all[2];
      sv.controls.enableZoom = false;
      sv.controls.enablePan = false;
      sv.globalLight.intensity = 2.6;
      sv.cameraLight.intensity = 0.9;
      const start = performance.now();
      const base = sv.render.bind(sv);
      sv.render = () => {
        const now = performance.now();
        const s = shot.current;
        if (s) {
          // ease the camera to the slot: orbit angle, look-at height and zoom together
          const k = Math.min(1, (now - s.at) / (s.keep ? 280 : 900));
          const e = 1 - Math.pow(1 - k, 3);
          let da = s.to[0] - s.from[0];
          da = Math.atan2(Math.sin(da), Math.cos(da));
          const a = s.from[0] + da * e;
          const y = s.from[1] + (s.to[1] - s.from[1]) * e;
          const z = s.from[2] + (s.to[2] - s.from[2]) * e;
          const dist = Math.min(256, Math.max(10, 4.5 + 16.5 / Math.tan((sv.fov / 360) * Math.PI) / z));
          (sv as unknown as { _zoom: number })._zoom = z;
          sv.controls.target.set(0, y, 0);
          sv.camera.position.set(Math.sin(a) * dist, y + 2, Math.cos(a) * dist);
          sv.camera.lookAt(sv.controls.target);
          // bring the player back to face forward so the shot lands on the slot
          const w = sv.playerWrapper.rotation;
          if (!s.keep) w.y = s.wrap * (1 - e);
          if (k >= 1) shot.current = null;
        }
        const t = (now - start) / 1000;
        for (const b of built.current) b.update(t, walkRef.current ? 1 : 0);
        base();
      };
      v.current = sv;
      const p = props.current;
      loadSkin(sv, p.skin, p.model);
      if (p.cape) sv.loadCape(p.cape).catch(() => {});
      apply();
      flyTo(SHOTS.all);
      loadCosmetics();
      ro = new ResizeObserver(() => {
        if (!wrap.current || !v.current) return;
        const b = wrap.current.getBoundingClientRect();
        if (b.width > 50 && b.height > 50) v.current.setSize(b.width, b.height);
      });
      ro.observe(wrap.current);
    })();
    return () => {
      dead = true;
      ro?.disconnect();
      built.current.forEach((b) => b.dispose());
      built.current = [];
      v.current?.dispose();
      v.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          // NCM cubes ship without normals; lit materials need them on this three.js build
          for (const r of b.roots)
            r.object.traverse((o) => {
              const g = (o as import("three").Mesh).geometry;
              if (g && !g.attributes.normal) g.computeVertexNormals();
            });
          (b as unknown as { setSide?: (s: unknown) => void }).setSide?.(w.side);
          next.push(ncm.attachToPlayer(b, v.current.playerObject.skin));
        } catch {
          /* a broken cosmetic is skipped, the rest still show */
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

  useEffect(() => {
    if (v.current) loadSkin(v.current, skin, model);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skin, model]);
  useEffect(() => {
    if (!v.current) return;
    if (cape) v.current.loadCape(cape).catch(() => {});
    else v.current.resetCape();
  }, [cape]);
  useEffect(apply, [walk, spin]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (v.current) flyTo(SHOTS[focus ?? "all"]);
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoom = (f: number) => {
    const sv = v.current;
    if (!sv) return;
    const base = SHOTS[focus ?? "all"];
    userZoom.current = Math.min(2.6 / base[2], Math.max(0.35 / base[2], userZoom.current * f));
    // keep the current angle, change only the distance
    const [a, y] = current();
    flyTo([a, y, base[2]], true);
  };
  useImperativeHandle(ref, () => ({ reset: () => flyTo(SHOTS[focus ?? "all"]), zoom }));
  // wheel / trackpad zoom
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); e.stopPropagation(); zoom(Math.exp(-e.deltaY * 0.0016)); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  return (
    <div ref={wrap} data-lenis-prevent className="h-full w-full overscroll-contain">
      <canvas ref={canvas} className="block h-full w-full cursor-grab active:cursor-grabbing" aria-label="3D preview of your character wearing the cosmetics" />
    </div>
  );
});

export default CosmeticViewer;
