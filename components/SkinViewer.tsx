"use client";

import { useEffect, useRef } from "react";

type Props = { skin: string; cape?: string | null; className?: string; width?: number; height?: number };

/** Live 3D player model on a fully transparent canvas. */
export default function SkinViewer({ skin, cape, className, width = 300, height = 420 }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const viewer = useRef<import("skinview3d").SkinViewer | null>(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      const sv = await import("skinview3d");
      if (dead || !canvas.current) return;
      const v = new sv.SkinViewer({ canvas: canvas.current, width, height, skin });
      v.zoom = 0.9;
      v.fov = 40;
      v.controls.enableZoom = false;
      v.controls.enablePan = false;
      v.animation = new sv.WalkingAnimation();
      v.animation.speed = 0.6;
      v.autoRotate = true;
      v.autoRotateSpeed = 0.8;
      v.camera.rotation.x = -0.25;
      viewer.current = v;
      if (cape) v.loadCape(cape);
    })();
    return () => {
      dead = true;
      viewer.current?.dispose();
      viewer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    viewer.current?.loadSkin(skin);
  }, [skin]);
  useEffect(() => {
    if (cape) viewer.current?.loadCape(cape);
    else viewer.current?.resetCape();
  }, [cape]);

  return <canvas ref={canvas} className={className} aria-label="3D skin preview" />;
}
