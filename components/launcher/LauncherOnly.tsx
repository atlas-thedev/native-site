"use client";

import { ArrowRight, Download, Palette, Shirt, ShoppingBag, UserRound, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import LockerViewer from "../LockerViewer";
import type { Worn } from "../cosmetics/CosmeticViewer";

type Props = {
  /** Which page sent the visitor here; tunes the heading. */
  from?: "store" | "locker";
  skin?: string | null;
  model?: "default" | "slim";
  cape?: string | null;
  /** Animated cloak strip, when the equipped cloak is animated. */
  capeAnim?: { url: string; frames: number; fps: number } | null;
  /** Cosmetics the account wears, drawn on the 3D model. */
  worn?: Worn[];
  /** Account name shown under the model. */
  name?: string | null;
  /** Extra content under the steps (e.g. account details). */
  children?: ReactNode;
};

const ease = [0.16, 1, 0.3, 1] as const;

const perks: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <ShoppingBag />, title: "Store", body: "Cloaks, hats, wings, shoes and hand items. Try anything on your own skin in 3D before you buy." },
  { icon: <Shirt />, title: "Locker", body: "Change your skin, pick a cloak and wear up to one cosmetic per slot, all in one place." },
  { icon: <Palette />, title: "Dyes", body: "Dyeable cosmetics can be recoloured to any colour you like, right from the Locker." },
  { icon: <Gamepad2 />, title: "In game", body: "Everything you wear shows up in game for every player running Native." },
];

const steps = [
  { n: "1", title: "Download Native", body: "Free for Windows, macOS and Linux." },
  { n: "2", title: "Sign in", body: "Use your Native account or Microsoft." },
  { n: "3", title: "Open Store or Locker", body: "They are right there in the sidebar." },
];

/** Shown where the web store and locker used to be: both live in the Native launcher now. */
export default function LauncherOnly({ from = "store", skin, model = "default", cape = "/capes/founders.png", capeAnim = null, worn = [], name = null, children }: Props) {
  const title = from === "locker" ? "Your locker lives in the launcher." : "The store lives in the launcher.";
  return (
    <section className="relative mx-auto max-w-[1240px] px-5 pb-28 pt-12 sm:px-8 sm:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <p className="eyebrow">Launcher only</p>
          <h1 className="v-display !leading-[0.98] mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)] ">{title}</h1>
          <p className="mt-5 max-w-[560px] text-[17px] leading-relaxed text-mute">
            Browse, try on and wear every cloak and cosmetic inside Native. It is faster, it shows your real in-game look, and your outfit syncs straight to the game.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/download" className="inline-flex h-[52px] items-center gap-2 rounded-full bg-inv px-7 text-[15.5px] font-semibold text-inv-fg transition hover:opacity-85 active:scale-[0.98]">
              <Download className="h-[18px] w-[18px]" /> Download Native
            </Link>
            <Link href="/plus" className="inline-flex h-[52px] items-center gap-2 rounded-full border border-line px-7 text-[15.5px] font-semibold transition hover:bg-surface-2">
              See Native+ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.li key={s.n} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease }} className="rounded-[18px] border border-line bg-surface p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-inv text-[14px] font-extrabold text-inv-fg">{s.n}</span>
                <span className="mt-3 block text-[15px] font-bold">{s.title}</span>
                <span className="mt-1 block text-[13.5px] leading-snug text-mute">{s.body}</span>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1, ease }} className="v-pod is-1 !bg-transparent">
          <span className="v-label">{skin ? "Your look" : "Preview"}</span>
          <div className="v-pod-stage !h-[400px] sm:!h-[480px]">
            <span aria-hidden className="absolute bottom-0 left-1/2 h-[18px] w-[60%] -translate-x-1/2 rounded-[50%] bg-fg/10 blur-[6px]" />
            <div className="absolute inset-0">
              <LockerViewer zoom={0.62} skin={skin || (model === "slim" ? "/skins/alex.png" : "/skins/steve.png")} model={model} cape={cape} capeAnim={capeAnim} walk spin showCape layers elytra={false} worn={worn} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
            <span className="min-w-0">
              <span className="v-pod-name block">{name || "Steve"}</span>
              <span className="mt-2 block font-mono text-[12px] text-dim">
                {worn.length ? `wearing ${worn.length} cosmetic${worn.length === 1 ? "" : "s"}` : "no cosmetics yet"}{cape ? " · cloak on" : ""}
              </span>
            </span>
            <UserRound className="h-5 w-5 shrink-0 text-dim" />
          </div>
        </motion.div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.06, ease }} className="rounded-[22px] border border-line bg-surface p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-line bg-bg [&>svg]:h-5 [&>svg]:w-5">{p.icon}</span>
            <h2 className="mt-4 text-[18px] font-extrabold tracking-tight">{p.title}</h2>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">{p.body}</p>
          </motion.div>
        ))}
      </div>

      {children}
    </section>
  );
}
