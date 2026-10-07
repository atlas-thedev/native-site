"use client";

import BetaBadge from "../beta/BetaBadge";
import { AnimatePresence, motion } from "motion/react";
import { Check, Gift, Loader2, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { playClaimMagic } from "./claimMagic";
import CapeStrip from "../CapeStrip";
import LockerViewer from "../LockerViewer";
import { storeAction } from "../capes/actions";
import { Mascot, Sparkle } from "./Toons";
import Countdown from "./Countdown";
import { useLaunch } from "./LaunchContext";
import { money, type StoreItem } from "@/lib/store";

type Props = { name: string; capes: StoreItem[]; picked: string | null; welcome: boolean; skin: string | null; model: "default" | "slim" };

/** Pick one of the founder capes for free (pre-launch accounts only). */
export default function FounderPicker({ name, capes, picked: initialPicked, welcome, skin, model }: Props) {
  const { launch } = useLaunch();
  const [picked, setPicked] = useState(initialPicked);
  const [sel, setSel] = useState(initialPicked ?? capes[0]?.id ?? null);
  const [busy, setBusy] = useState<"claim" | "wear" | null>(null);
  const [err, setErr] = useState("");
  const [worn, setWorn] = useState(false);
  const item = capes.find((c) => c.id === sel) ?? capes[0];
  const done = !!picked;

  const claim = async () => {
    if (!item) return;
    setBusy("claim");
    setErr("");
    try {
      const r = await fetch("/api/founder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: item.id }) });
      const d = await r.json().catch(() => ({}));
      if (d.expired) return void (window.location.href = "/login?next=/founder");
      if (!d.ok) throw new Error(d.error || "Couldn’t claim that cape.");
      const id = d.picked ?? item.id;
      const thumb = document.querySelector(`[data-founder-cape="${CSS.escape(item.id)}"]`);
      setBusy(null);
      await playClaimMagic(thumb, { caption: `${item.name} is yours`, onArrive: () => setPicked(id) });
      setPicked(id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t claim that cape.");
    } finally {
      setBusy(null);
    }
  };
  const wear = async () => {
    if (!picked) return;
    setBusy("wear");
    setErr("");
    try {
      await storeAction("equip", picked);
      setWorn(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t put it on.");
    } finally {
      setBusy(null);
    }
  };

  if (!item) {
    return (
      <div className="mx-auto max-w-[640px] px-5 py-32 text-center">
        <h1 className="text-[40px] font-extrabold tracking-tight">Founder capes are on their way.</h1>
        <p className="mt-4 text-mute">Check back soon. Your free pick is saved for you.</p>
      </div>
    );
  }

  const pickedItem = capes.find((c) => c.id === picked);
  return (
    <div className="relative mx-auto max-w-[1280px] px-5 pb-28 pt-12 sm:pt-16">
      <header className="relative mb-10 text-center">
        <Sparkle className="toon-twinkle absolute left-[12%] top-2 hidden w-5 sm:block" />
        <Sparkle className="toon-twinkle absolute right-[14%] top-10 hidden w-4 sm:block [animation-delay:-1s]" />
        <p className="eyebrow">{welcome ? `Welcome to Native, ${name}` : "Founder reward"}</p>
        <h1 className="mt-4 text-balance text-[clamp(2.4rem,5.6vw,4.4rem)] font-extrabold leading-[1] tracking-[-0.045em]">
          {done ? "Your founder cape is yours." : "Pick your free founder cape."}
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[17px] text-mute">
          {done
            ? `${pickedItem?.name ?? "It"} lives in your locker forever. Wear it on the site now, and in the launcher and in game from day one.`
            : `You joined before launch, so one of these is on us. Choose carefully, you only get one. After launch each cape costs ${money(1.99)}.`}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="card overflow-hidden">
          <div className="dots relative h-[420px] sm:h-[560px]">
            <LockerViewer
              skin={skin ?? (model === "slim" ? "/skins/alex.png" : "/skins/steve.png")}
              model={model}
              cape={(pickedItem ?? item).stillUrl}
              capeAnim={(pickedItem ?? item).animated && (pickedItem ?? item).stripUrl ? { url: (pickedItem ?? item).stripUrl!, frames: (pickedItem ?? item).frames, fps: (pickedItem ?? item).fps } : null}
              walk
              spin
              showCape
              layers
              elytra={false}
            />
            <Mascot className="pointer-events-none absolute -bottom-2 -left-4 w-[110px] opacity-90 sm:w-[140px]" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <ul className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Founder capes">
            {capes.map((c) => {
              const on = (picked ?? sel) === c.id;
              const locked = done && picked !== c.id;
              return (
                <li key={c.id}>
                  <button
                    role="radio"
                    aria-checked={on}
                    disabled={done}
                    onClick={() => setSel(c.id)}
                    className={`group relative flex w-full flex-col items-center rounded-[22px] border p-3 transition ${on ? "border-fg bg-surface-2" : "border-line bg-surface hover:-translate-y-0.5 hover:bg-surface-2"} ${locked ? "opacity-40" : ""}`}
                  >
                    <div data-founder-cape={c.id} className="dots flex aspect-[4/5] w-full items-center justify-center rounded-2xl">
                      <CapeStrip strip={c.animated ? c.stripUrl : null} still={c.stillUrl} frames={c.frames} fps={c.fps} width={64} label={`${c.name} cape`} className="cutout-sm transition duration-500 group-hover:scale-[1.06]" />
                    </div>
                    <span className="mt-2.5 truncate text-[14px] font-bold tracking-tight">{c.name}</span>
                    <span className="text-[12px] text-dim">{done ? (picked === c.id ? "Yours" : money(c.price || 1.99)) : <><s>{money(c.price || 1.99)}</s> · Free</>}</span>
                    {on && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-inv text-inv-fg">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="card p-6">
            <p className="text-[24px] font-extrabold tracking-tight">{(pickedItem ?? item).name}</p>
            {(pickedItem ?? item).description && <p className="mt-1.5 text-mute">{(pickedItem ?? item).description}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              {!done ? (
                <button onClick={claim} disabled={!!busy} className="inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-60">
                  {busy === "claim" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />} Claim {item.name} free
                </button>
              ) : worn ? (
                <span className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-[15px] font-semibold"><Check className="h-4 w-4" /> You’re wearing it</span>
              ) : (
                <button onClick={wear} disabled={!!busy} className="inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-60">
                  {busy === "wear" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PartyPopper className="h-4 w-4" />} Wear it now
                </button>
              )}
              <Link href="/account" className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[15px] font-semibold transition hover:bg-surface-2">Your account</Link>
            </div>
            <AnimatePresence>
              {err && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-4 text-[14px] font-semibold">
                  {err}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Link href="/beta" className="card group flex items-center gap-4 p-5 transition hover:bg-surface-2">
                <BetaBadge size={44} still />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-bold tracking-tight">Want to test Native early?</span>
                  <span className="block text-[13.5px] text-mute">Apply to be a Super Beta Tester and keep the cape, badge and Native+ for good.</span>
                </span>
                <span className="text-[20px] transition group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
            </motion.div>
          )}

          {launch.prelaunch && (
            <div className="card flex flex-col items-center p-6 text-center">
              <p className="text-[12.5px] font-semibold uppercase tracking-wider text-dim">Native launches in</p>
              <Countdown at={launch.at} size="sm" className="mt-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
