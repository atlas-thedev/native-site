"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import LockerViewer from "../LockerViewer";
import SkinHead from "../SkinHead";
import type { PlayerHit } from "@/lib/store";
import type { Outfit } from "@/lib/outfit";

type Entry = { player: PlayerHit; skin: string | null; model?: "default" | "slim"; outfit?: Outfit };
const joined = (t: number) => (t ? new Date(t).toLocaleDateString("en", { month: "short", year: "numeric" }) : "");

function Stage({ e, big }: { e: Entry; big: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([x]) => x.isIntersecting && setOn(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const model = e.model ?? "default";
  const skin = e.skin ?? (model === "slim" ? "/skins/alex.png" : "/skins/steve.png");
  return (
    <div ref={ref} className="v-pod-stage">
      <span aria-hidden className="absolute bottom-0 left-1/2 h-[18px] w-[60%] -translate-x-1/2 rounded-[50%] bg-fg/10 blur-[6px]" />
      {on ? (
        <div className="absolute inset-0">
          <LockerViewer
            zoom={big ? 0.62 : 0.56}
            skin={skin}
            model={model}
            cape={e.outfit?.cape ?? null}
            capeAnim={e.outfit?.capeAnim ?? null}
            walk
            spin
            showCape
            layers
            worn={e.outfit?.worn ?? []}
          />
        </div>
      ) : (
        <span className="relative mb-10"><SkinHead skin={e.skin} name={e.player.name} size={big ? 140 : 110} /></span>
      )}
    </div>
  );
}

/** Top three collectors on a podium, each as a live 3D model wearing their cloak and cosmetics. */
export default function Podium({ top }: { top: Entry[] }) {
  // visual order: 2nd, 1st, 3rd on wide screens
  const order = top.length >= 3 ? [1, 0, 2] : top.map((_, i) => i);
  return (
    <ol className="v-podium">
      {order.map((idx, k) => {
        const e = top[idx];
        if (!e) return null;
        const rank = idx + 1;
        const wearing = e.outfit?.worn.length ?? 0;
        return (
          <motion.li
            key={e.player.name}
            className={`v-pod is-${rank} ${rank === 1 ? "max-[899px]:order-first" : ""}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: k * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="v-pod-rank" aria-hidden>{String(rank).padStart(2, "0")}</span>
            <span className="v-label">{rank === 1 ? "Top collector" : `Rank ${rank}`}</span>
            <Stage e={e} big={rank === 1} />
            <Link href={`/u/${encodeURIComponent(e.player.name)}`} data-cursor="Profile" className="group mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
              <span className="min-w-0">
                <span className="v-pod-name block">{e.player.name}</span>
                <span className="mt-2 block font-mono text-[12px] text-dim">
                  {e.player.owned.toLocaleString()} {e.player.owned === 1 ? "item" : "items"}{wearing ? ` · wearing ${wearing}` : ""} · joined {joined(e.player.joinedAt)}
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-dim transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg" />
            </Link>
          </motion.li>
        );
      })}
    </ol>
  );
}
