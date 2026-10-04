"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CapeAnim } from "@/lib/store";
import { loadStrip, reducedMotion, stripFrame } from "./capeAnim";

export type ViewerHandle = { reset: () => void };
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
  onError?: () => void;
};

/** Responsive, transparent skinview3d canvas used by the account locker. */
const LockerViewer = forwardRef<ViewerHandle, Props>(function LockerViewer({ skin, cape, model, walk, spin, showCape, layers, elytra, capeAnim, onError }, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const v = useRef<import("skinview3d").SkinViewer | null>(null);
  const lib = useRef<typeof import("skinview3d") | null>(null);
  const props = useRef<Props>({ skin, cape, model, walk, spin, showCape, layers, elytra, capeAnim });
  props.current = { skin, cape, model, walk, spin, showCape, layers, elytra, capeAnim };

  const apply = () => {
    const sv = v.current;
    const l = lib.current;
    if (!sv || !l) return;
    const p = props.current;
    sv.autoRotate = p.spin;
    sv.autoRotateSpeed = 0.9;
    if (p.walk) {
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
    (async () => {
      const l = await import("skinview3d");
      if (dead || !canvas.current || !wrap.current) return;
      lib.current = l;
      const r = wrap.current.getBoundingClientRect();
      const sv = new l.SkinViewer({ canvas: canvas.current, width: Math.max(200, r.width), height: Math.max(260, r.height) });
      sv.zoom = 0.82;
      sv.fov = 38;
      sv.controls.enableZoom = false;
      sv.controls.enablePan = false;
      sv.camera.rotation.x = -0.2;
      v.current = sv;
      const p = props.current;
      sv.loadSkin(p.skin, { model: p.model }).catch(() => onError?.());
      if (p.cape && !p.capeAnim) sv.loadCape(p.cape, { backEquipment: p.elytra ? "elytra" : "cape" }).catch(() => {});
      apply();
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
      v.current?.dispose();
      v.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    v.current?.loadSkin(skin, { model }).catch(() => onError?.());
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
  useEffect(apply, [walk, spin, showCape, layers, cape, elytra]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      const sv = v.current;
      if (!sv) return;
      sv.controls.reset();
      sv.camera.rotation.x = -0.2;
    },
  }));

  return (
    <div ref={wrap} className="h-full w-full">
      <canvas ref={canvas} className="cutout-sm block h-full w-full" aria-label="3D preview of your skin" />
    </div>
  );
});

export default LockerViewer;
