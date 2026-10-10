"use client";

import { Footprints, Pause, Play, RotateCcw, Shirt, ZoomIn, ZoomOut } from "lucide-react";
import { useRef, useState } from "react";
import LockerViewer, { type ViewerHandle } from "../LockerViewer";

type Props = { skin: string; model: "default" | "slim"; cape?: string | null; zoom?: number };

/** Interactive 3D stage for a skin: drag to rotate, walk / pause, outer layer toggle, zoom. */
export default function SkinStage({ skin, model, cape = null, zoom = 0.62 }: Props) {
  const viewer = useRef<ViewerHandle>(null);
  const [walk, setWalk] = useState(true);
  const [layers, setLayers] = useState(true);
  const [paused, setPaused] = useState(false);
  const [z, setZ] = useState({ in: true, out: true });
  const zoomBy = (f: number) => { const r = viewer.current?.zoom(f); if (r) setZ(r); };
  return (
    <div className="relative h-full min-h-[520px] bg-[radial-gradient(ellipse_at_50%_35%,rgb(255_255_255/0.07),transparent_65%)] pb-14 pt-6">
      <LockerViewer ref={viewer} zoom={zoom} skin={skin} model={model} cape={cape} walk={walk} spin showCape={!!cape} layers={layers} />
      <div className="viewer-actions">
        <div>
          <button type="button" onClick={() => { viewer.current?.reset(); setZ({ in: true, out: true }); }} title="Reset view" aria-label="Reset view"><RotateCcw /></button>
          <button type="button" onClick={() => zoomBy(1 / 1.25)} disabled={!z.out} title="Zoom out" aria-label="Zoom out"><ZoomOut /></button>
          <button type="button" onClick={() => zoomBy(1.25)} disabled={!z.in} title="Zoom in" aria-label="Zoom in"><ZoomIn /></button>
        </div>
        <div>
          <button type="button" onClick={() => setWalk((w) => !w)} aria-pressed={walk} title={walk ? "Stand still" : "Walk"} aria-label={walk ? "Stand still" : "Walk"}><Footprints /></button>
          <button type="button" onClick={() => setLayers((l) => !l)} aria-pressed={layers} title={layers ? "Hide outer layer" : "Show outer layer"} aria-label="Toggle outer layer"><Shirt /></button>
          <button type="button" onClick={() => { const p = !paused; setPaused(p); viewer.current?.pause(p); }} title={paused ? "Play" : "Pause"} aria-label={paused ? "Play" : "Pause"}>{paused ? <Play /> : <Pause />}</button>
        </div>
      </div>
    </div>
  );
}
