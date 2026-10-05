"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  Check,
  Clock,
  Crown,
  FlaskConical,
  Hourglass,
  Loader2,
  Lock,
  MessageSquare,
  PartyPopper,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CapeStrip from "../CapeStrip";
import LockerViewer from "../LockerViewer";
import FlyingBee from "../launch/FlyingBee";
import NativeGlyph from "../NativeGlyph";
import PlusMark from "../plus/PlusMark";
import { playClaimMagic } from "../launch/claimMagic";
import type { BetaAnswers, BetaApplication } from "@/lib/launch";
import type { StoreItem } from "@/lib/store";

type Props = {
  signedIn: boolean;
  name: string | null;
  open: boolean;
  initial: BetaApplication | null;
  cape: StoreItem | null;
  skin: string | null;
  model: "default" | "slim";
};

const VERSIONS = [
  "1.21.x",
  "1.20.x",
  "1.19.x",
  "1.18.x",
  "1.16.5",
  "1.12.2",
  "1.8.9",
  "Snapshots",
];
const STYLES = [
  "Survival",
  "Modded",
  "PvP",
  "Building",
  "Servers",
  "Redstone",
  "Speedrun",
  "Tech",
];
const EMPTY: BetaAnswers = {
  discord: "",
  platform: "",
  age: "",
  specs: "",
  versions: [],
  hours: 8,
  playstyle: [],
  experience: "",
  why: "",
  timezone: "",
  agree: false,
};
const STEPS = ["About you", "Your setup", "Why you"] as const;

const field =
  "h-12 w-full rounded-2xl border border-line bg-bg px-4 text-[15px] text-fg outline-none transition placeholder:text-dim focus:border-fg";
const area =
  "min-h-[120px] w-full resize-y rounded-2xl border border-line bg-bg px-4 py-3 text-[15px] leading-relaxed text-fg outline-none transition placeholder:text-dim focus:border-fg";
const primary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-50";
const ghost =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line px-6 text-[15px] font-semibold transition hover:bg-surface-2 disabled:opacity-50";

function Chip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[14px] font-semibold transition active:scale-[.97] ${on ? "border-fg bg-inv text-inv-fg" : "border-line hover:border-fg/50 hover:bg-surface-2"}`}
    >
      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}
function Segment<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T | "";
  options: [T, string][];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl border border-line bg-bg p-1"
    >
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`relative h-10 rounded-xl text-[14px] font-semibold transition ${value === v ? "text-inv-fg" : "text-mute hover:text-fg"}`}
        >
          {value === v && (
            <motion.span
              layoutId={`seg-${label}`}
              className="absolute inset-0 rounded-xl bg-inv"
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
            />
          )}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  );
}
function Q({
  label,
  hint,
  children,
  optional,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between gap-3 text-[14.5px] font-bold tracking-tight">
        {label}
        {optional && (
          <span className="text-[12px] font-medium text-dim">Optional</span>
        )}
      </span>
      {children}
      {hint && <span className="text-[12.5px] text-dim">{hint}</span>}
    </div>
  );
}

/** The Super Beta Tester program: perks, the application form and your application's status. */
export default function BetaProgram({
  signedIn,
  name,
  open,
  initial,
  cape,
  skin,
  model,
}: Props) {
  const [app, setApp] = useState<BetaApplication | null>(initial);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [a, setA] = useState<BetaAnswers>(() => ({
    ...EMPTY,
    ...(initial?.answers ?? {}),
  }));
  const [busy, setBusy] = useState<"send" | "withdraw" | null>(null);
  const [err, setErr] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!a.timezone) {
      try {
        setA((x) => ({
          ...x,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        }));
      } catch {}
    }
    if (!a.platform && typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      const p = /Windows/i.test(ua)
        ? "windows"
        : /Mac OS X|Macintosh/i.test(ua)
          ? "macos"
          : /Linux/i.test(ua)
            ? "linux"
            : "";
      if (p) setA((x) => ({ ...x, platform: p as BetaAnswers["platform"] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof BetaAnswers>(k: K, v: BetaAnswers[K]) => {
    setA((x) => ({ ...x, [k]: v }));
    setErr("");
  };
  const toggle = (k: "versions" | "playstyle", v: string) =>
    set(k, a[k].includes(v) ? a[k].filter((x) => x !== v) : [...a[k], v]);

  const stepError = (i: number) => {
    if (i === 0) {
      if (a.discord.trim().length < 2)
        return "Add your Discord username so we can reach you.";
      if (!a.age) return "Pick your age range.";
    }
    if (i === 1 && !a.platform) return "Pick the computer you play on.";
    if (i === 2) {
      if (a.why.trim().length < 40)
        return `Tell us a bit more about why you want in (${40 - a.why.trim().length} more characters).`;
      if (!a.agree)
        return "Please agree to report bugs and keep unreleased things private.";
    }
    return "";
  };
  const next = () => {
    const e = stepError(step);
    if (e) return setErr(e);
    setDir(1);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => {
    setErr("");
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const e = stepError(i);
      if (e) {
        setDir(i < step ? -1 : 1);
        setStep(i);
        return setErr(e);
      }
    }
    setBusy("send");
    setErr("");
    try {
      const r = await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      const d = await r.json().catch(() => ({}));
      if (d.expired) return void (window.location.href = "/login?next=/beta");
      if (!r.ok || d.ok === false)
        throw new Error(d.error || "Couldn’t send your application.");
      setApp(d.application);
      setEditing(false);
      setStep(0);
      requestAnimationFrame(() =>
        sentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      );
    } catch (e) {
      setErr(
        e instanceof Error ? e.message : "Couldn’t send your application.",
      );
    } finally {
      setBusy(null);
    }
  };
  const withdraw = async () => {
    if (
      !confirm(
        "Withdraw your application? You can apply again any time while applications are open.",
      )
    )
      return;
    setBusy("withdraw");
    try {
      const r = await fetch("/api/beta", { method: "DELETE" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.ok === false)
        throw new Error(d.error || "Couldn’t withdraw it.");
      setApp(null);
      setA((x) => ({ ...x, agree: false }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t withdraw it.");
    } finally {
      setBusy(null);
    }
  };

  const showForm =
    signedIn &&
    (!app ||
      editing ||
      (app.status === "rejected" && app.canReapply && editing));
  const canApply = open || (app && app.status === "pending");
  const goForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="relative">
      {/* hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]"
          aria-hidden
        />
        <FlyingBee
          size={56}
          seed={5}
          area={[0.04, 0.08, 0.96, 0.5]}
          className="z-20 hidden md:block"
        />
        <NativeGlyph className="toon-twinkle pointer-events-none absolute left-[14%] top-[22%] w-5 text-dim" />
        <NativeGlyph className="toon-twinkle pointer-events-none absolute right-[16%] top-[16%] w-4 text-dim [animation-delay:-1.2s]" />
        <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-10 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/70 px-3.5 py-1.5 text-[13px] font-semibold backdrop-blur">
              <span
                className={`h-2 w-2 rounded-full ${open ? "bg-fg [animation:pulse-soft_1.4s_ease-in-out_infinite]" : "bg-dim"}`}
              />
              {open ? "Applications open" : "Applications closed"}
            </span>
            <h1 className="mt-6 text-balance text-[clamp(2.6rem,6.4vw,5.2rem)] font-extrabold leading-[0.98] tracking-[-0.05em]">
              Break Native before anyone else.
            </h1>
            <p className="mt-6 max-w-[540px] text-[18px] leading-relaxed text-mute">
              Become a <b className="font-bold text-fg">Super Beta Tester</b>.
              Get early builds, a private channel with the team, and a say in
              what ships. Accepted testers keep their perks forever.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {signedIn ? (
                app && !editing ? (
                  <button onClick={goForm} className={primary}>
                    <Hourglass className="h-4 w-4" /> View your application
                  </button>
                ) : (
                  <button
                    onClick={goForm}
                    disabled={!canApply}
                    className={primary}
                  >
                    <FlaskConical className="h-4 w-4" />{" "}
                    {canApply ? "Apply now" : "Applications closed"}
                  </button>
                )
              ) : (
                <>
                  <Link href="/register?next=/beta" className={primary}>
                    <FlaskConical className="h-4 w-4" /> Create an account to
                    apply
                  </Link>
                  <Link href="/login?next=/beta" className={ghost}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
            <ul className="mt-10 grid max-w-[560px] grid-cols-3 gap-3">
              {[
                ["Cape", "Super Beta Tester"],
                ["Badge", "On your profile"],
                ["Native+", "Free, forever"],
              ].map(([k, v], i) => (
                <motion.li
                  key={k}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="rounded-2xl border border-line bg-bg/60 px-4 py-3 backdrop-blur"
                >
                  <p className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">
                    {k}
                  </p>
                  <p className="mt-0.5 text-[14.5px] font-bold tracking-tight">
                    {v}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="beta-cape-stage relative overflow-hidden rounded-[30px] border border-line">
            <div className="dots relative h-[400px] sm:h-[480px]">
              {cape ? (
                <LockerViewer
                  skin={
                    skin ??
                    (model === "slim" ? "/skins/alex.png" : "/skins/steve.png")
                  }
                  model={model}
                  cape={cape.stillUrl}
                  capeAnim={
                    cape.animated && cape.stripUrl
                      ? {
                          url: cape.stripUrl,
                          frames: cape.frames,
                          fps: cape.fps,
                        }
                      : null
                  }
                  walk
                  spin
                  showCape
                  layers
                  elytra={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-mute">
                  The Super Beta Tester cape
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center gap-3 rounded-2xl border border-line bg-bg/80 px-3.5 py-3 backdrop-blur-xl">
                <img
                  src="/badges/super-beta-tester.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 [image-rendering:pixelated]"
                />
                <div className="leading-tight">
                  <p className="text-[13.5px] font-extrabold tracking-tight">
                    Super Beta Tester
                  </p>
                  <p className="text-[11.5px] text-dim">
                    Founding access · never sold
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* perks */}
      <section className="mx-auto max-w-[1280px] px-5 py-20">
        <p className="eyebrow">What you get</p>
        <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
          Thanks, in three parts.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="card group flex flex-col p-6">
            <div className="dots flex h-[220px] items-center justify-center rounded-2xl">
              {cape ? (
                <CapeStrip
                  strip={cape.animated ? cape.stripUrl : null}
                  still={cape.stillUrl}
                  frames={cape.frames}
                  fps={cape.fps}
                  width={96}
                  label="Super Beta Tester cape"
                  className="cutout-sm transition duration-500 group-hover:-rotate-3 group-hover:scale-[1.06]"
                />
              ) : (
                <FlaskConical className="h-12 w-12 text-dim" />
              )}
            </div>
            <p className="mt-5 text-[20px] font-extrabold tracking-tight">
              The Super Beta Tester cape
            </p>
            <p className="mt-1.5 text-[15px] text-mute">
              An animated cape bubbling with test potions. Never sold — testers
              only. Wear it in the launcher and in game.
            </p>
          </div>
          <div className="card group flex flex-col p-6">
            <div className="dots flex h-[220px] items-center justify-center rounded-2xl">
              <img
                src="/badges/super-beta-tester.png"
                alt="Super Beta Tester badge"
                width={112}
                height={112}
                className="h-28 w-28 transition duration-500 [image-rendering:pixelated] group-hover:rotate-6 group-hover:scale-110"
              />
            </div>
            <p className="mt-5 text-[20px] font-extrabold tracking-tight">
              The badge
            </p>
            <p className="mt-1.5 text-[15px] text-mute">
              Shows next to your name in Relay, on your profile and to your
              friends. Everyone will know you were here first.
            </p>
          </div>
          <div className="card group flex flex-col p-6">
            <div className="dots flex h-[220px] items-center justify-center rounded-2xl">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[30px] bg-inv text-inv-fg transition duration-500 group-hover:-rotate-6 group-hover:scale-110">
                <PlusMark size={54} />
                <span className="absolute -bottom-3 rounded-full border border-line bg-bg px-3 py-1 text-[12px] font-extrabold text-fg">
                  FOREVER
                </span>
              </div>
            </div>
            <p className="mt-5 text-[20px] font-extrabold tracking-tight">
              Native+ for life
            </p>
            <p className="mt-1.5 text-[15px] text-mute">
              Every paid cape, the Native+ badge and everything Native+ gets
              later. No subscription, no end date.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            [
              NativeGlyph,
              "Early builds",
              "Try new Native versions days or weeks before release.",
            ],
            [
              MessageSquare,
              "Private channel",
              "A testers-only Discord channel with the people who build Native.",
            ],
            [
              Bug,
              "Real impact",
              "Your bug reports and ideas decide what gets fixed and built next.",
            ],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof NativeGlyph;
            return (
              <div
                key={t as string}
                className="flex gap-4 rounded-[24px] border border-line p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line">
                  <I className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[16px] font-bold tracking-tight">
                    {t as string}
                  </p>
                  <p className="mt-1 text-[14.5px] text-mute">{d as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* form / status */}
      <section
        ref={formRef}
        id="apply"
        className="scroll-mt-24 border-t border-line"
      >
        <div className="mx-auto max-w-[860px] px-5 py-20">
          {!signedIn ? (
            <div className="card relative overflow-hidden p-8 text-center sm:p-12">
              <Lock className="mx-auto h-8 w-8" />
              <h2 className="mt-5 text-[30px] font-extrabold tracking-tight">
                Sign in to apply.
              </h2>
              <p className="mx-auto mt-3 max-w-[460px] text-mute">
                Your Native account is where the cape, badge and Native+ land if
                you’re accepted. It takes a minute.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/register?next=/beta" className={primary}>
                  Create a free account
                </Link>
                <Link href="/login?next=/beta" className={ghost}>
                  Sign in
                </Link>
              </div>
            </div>
          ) : showForm ? (
            !canApply && !app ? (
              <div className="card p-10 text-center">
                <Clock className="mx-auto h-8 w-8" />
                <h2 className="mt-5 text-[28px] font-extrabold tracking-tight">
                  Applications are closed for now.
                </h2>
                <p className="mx-auto mt-3 max-w-[440px] text-mute">
                  We’re testing with the current group. Join the Discord to hear
                  when the next round opens.
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="border-b border-line p-6 sm:p-8">
                  <p className="eyebrow">
                    {editing ? "Edit your application" : `Applying as ${name}`}
                  </p>
                  <h2 className="mt-3 text-[30px] font-extrabold tracking-tight">
                    {STEPS[step]}
                  </h2>
                  <ol
                    className="mt-6 grid grid-cols-3 gap-2"
                    aria-label="Progress"
                  >
                    {STEPS.map((s, i) => (
                      <li key={s} className="flex flex-col gap-2">
                        <span className="relative h-1.5 overflow-hidden rounded-full bg-surface-2">
                          <motion.span
                            className="absolute inset-y-0 left-0 rounded-full bg-fg"
                            initial={false}
                            animate={{ width: i <= step ? "100%" : "0%" }}
                            transition={{
                              type: "spring",
                              stiffness: 160,
                              damping: 26,
                            }}
                          />
                        </span>
                        <span
                          className={`text-[12.5px] font-semibold ${i <= step ? "text-fg" : "text-dim"}`}
                        >
                          {i + 1}. {s}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="relative overflow-hidden p-6 sm:p-8">
                  <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                      key={step}
                      custom={dir}
                      initial={{ opacity: 0, x: dir * 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: dir * -40 }}
                      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                      className="flex flex-col gap-7"
                    >
                      {step === 0 && (
                        <>
                          <Q
                            label="Discord username"
                            hint="We’ll message you here if you’re accepted."
                          >
                            <input
                              className={field}
                              value={a.discord}
                              maxLength={40}
                              placeholder="e.g. steve"
                              onChange={(e) => set("discord", e.target.value)}
                              autoComplete="off"
                            />
                          </Q>
                          <Q label="Age range">
                            <Segment
                              label="age"
                              value={a.age}
                              onChange={(v) => set("age", v)}
                              options={[
                                ["13-17", "13–17"],
                                ["18-24", "18–24"],
                                ["25+", "25+"],
                              ]}
                            />
                          </Q>
                          <Q
                            label="Time zone"
                            hint="Detected from your browser — change it if it’s wrong."
                          >
                            <input
                              className={field}
                              value={a.timezone}
                              maxLength={60}
                              placeholder="e.g. Europe/London"
                              onChange={(e) => set("timezone", e.target.value)}
                            />
                          </Q>
                        </>
                      )}
                      {step === 1 && (
                        <>
                          <Q label="You play on">
                            <Segment
                              label="platform"
                              value={a.platform}
                              onChange={(v) => set("platform", v)}
                              options={[
                                ["windows", "Windows"],
                                ["macos", "macOS"],
                                ["linux", "Linux"],
                              ]}
                            />
                          </Q>
                          <Q
                            label="Your PC"
                            hint="CPU, graphics card and RAM — helps us test on lots of hardware."
                            optional
                          >
                            <input
                              className={field}
                              value={a.specs}
                              maxLength={300}
                              placeholder="e.g. Ryzen 5 5600, RTX 3060, 16 GB"
                              onChange={(e) => set("specs", e.target.value)}
                            />
                          </Q>
                          <Q label="Versions you play" optional>
                            <div className="flex flex-wrap gap-2">
                              {VERSIONS.map((v) => (
                                <Chip
                                  key={v}
                                  on={a.versions.includes(v)}
                                  onClick={() => toggle("versions", v)}
                                >
                                  {v}
                                </Chip>
                              ))}
                            </div>
                          </Q>
                          <Q label="How you play" optional>
                            <div className="flex flex-wrap gap-2">
                              {STYLES.map((v) => (
                                <Chip
                                  key={v}
                                  on={a.playstyle.includes(v)}
                                  onClick={() => toggle("playstyle", v)}
                                >
                                  {v}
                                </Chip>
                              ))}
                            </div>
                          </Q>
                          <Q
                            label={`Hours of Minecraft a week · ${a.hours >= 40 ? "40+" : a.hours}`}
                          >
                            <input
                              type="range"
                              min={0}
                              max={40}
                              step={1}
                              value={a.hours}
                              onChange={(e) =>
                                set("hours", Number(e.target.value))
                              }
                              className="w-full accent-[var(--fg)]"
                              aria-label="Hours per week"
                            />
                          </Q>
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <Q
                            label="Why do you want to be a Super Beta Tester?"
                            hint={`${a.why.trim().length} / 40 characters minimum`}
                          >
                            <textarea
                              className={area}
                              value={a.why}
                              maxLength={1200}
                              placeholder="What would you test first? What do you love — or hate — about Minecraft launchers?"
                              onChange={(e) => set("why", e.target.value)}
                            />
                          </Q>
                          <Q label="Testing or bug-report experience" optional>
                            <textarea
                              className={`${area} min-h-[90px]`}
                              value={a.experience}
                              maxLength={800}
                              placeholder="Other betas, mods, servers, GitHub issues… anything counts."
                              onChange={(e) =>
                                set("experience", e.target.value)
                              }
                            />
                          </Q>
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={a.agree}
                            onClick={() => set("agree", !a.agree)}
                            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${a.agree ? "border-fg bg-surface-2" : "border-line hover:bg-surface-2"}`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${a.agree ? "border-fg bg-inv text-inv-fg" : "border-line"}`}
                            >
                              {a.agree && (
                                <Check
                                  className="h-3.5 w-3.5"
                                  strokeWidth={3}
                                />
                              )}
                            </span>
                            <span className="text-[14.5px] leading-relaxed">
                              I’ll report the bugs I find and keep unreleased
                              builds and features private until they ship.
                            </span>
                          </button>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    {err && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="mt-6 rounded-2xl border border-fg px-4 py-3 text-[14px] font-semibold"
                      >
                        {err}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      {step > 0 && (
                        <button type="button" onClick={back} className={ghost}>
                          <ArrowLeft className="h-4 w-4" /> Back
                        </button>
                      )}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setErr("");
                          }}
                          className={ghost}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    {step < STEPS.length - 1 ? (
                      <button type="button" onClick={next} className={primary}>
                        Continue <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={submit}
                        disabled={!!busy}
                        className={primary}
                      >
                        {busy === "send" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}{" "}
                        {editing ? "Save changes" : "Send application"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : app ? (
            <div ref={sentRef}>
              <Status
                app={app}
                busy={busy}
                onWithdraw={withdraw}
                onEdit={() => {
                  setA({
                    ...EMPTY,
                    ...app.answers,
                    agree: app.status === "pending" ? app.answers.agree : false,
                  });
                  setEditing(true);
                  setStep(0);
                }}
                cape={cape}
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* faq */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-20 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold leading-[1.04] tracking-[-0.04em]">
              Good to know.
            </h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {[
              [
                "Who gets picked?",
                "People who play a lot, on different hardware and versions, and who’ll actually tell us when something breaks. Great bug reports beat big follower counts.",
              ],
              [
                "How long until I hear back?",
                "Usually within a week. Your status updates here, and accepted testers get a Discord message from the team.",
              ],
              [
                "Is Native+ really forever?",
                "Yes. Accepted testers get Native+ with no end date, plus every paid cape it includes — now and later.",
              ],
              [
                "What if I’m not picked?",
                "You can apply again a week after your review. Joining the Discord and reporting bugs helps a lot.",
              ],
              [
                "Can I lose the perks?",
                "Only for leaking private builds or breaking the rules. Otherwise they’re yours to keep.",
              ],
            ].map(([q, d]) => (
              <details
                key={q}
                className="group py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-bold tracking-tight">
                  {q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line transition group-open:rotate-45">
                    <X className="h-4 w-4 rotate-45" />
                  </span>
                </summary>
                <p className="mt-3 max-w-[620px] text-[15.5px] leading-relaxed text-mute">
                  {d}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Status({
  app,
  busy,
  onWithdraw,
  onEdit,
  cape,
}: {
  app: BetaApplication;
  busy: string | null;
  onWithdraw: () => void;
  onEdit: () => void;
  cape: StoreItem | null;
}) {
  const steps = useMemo(
    () => [
      { label: "Sent", done: true, at: app.createdAt },
      {
        label: "In review",
        done: app.status !== "pending",
        at: null as number | null,
      },
      {
        label:
          app.status === "approved"
            ? "Accepted"
            : app.status === "rejected"
              ? "Not this time"
              : app.status === "waitlist"
                ? "Waitlist"
                : "Decision",
        done: app.status !== "pending",
        at: app.reviewedAt,
      },
    ],
    [app],
  );
  const celebrated = useRef(false);
  const capeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // first time an accepted tester opens this page: the light flies from the cape to your name
    if (app.status !== "approved" || celebrated.current) return;
    celebrated.current = true;
    const key = `native:beta-celebrated:${app.id}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {}
    const t = window.setTimeout(
      () =>
        playClaimMagic(capeRef.current, {
          caption: "You’re a Super Beta Tester",
        }),
      700,
    );
    return () => window.clearTimeout(t);
  }, [app]);

  const date = (ms: number | null) =>
    ms
      ? new Date(ms).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        })
      : "";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-6 sm:p-10">
        <p className="eyebrow">Your application</p>
        {app.status === "approved" ? (
          <>
            <h2 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold tracking-tight">
              <PartyPopper className="h-8 w-8" /> You’re in.
            </h2>
            <p className="mt-3 max-w-[560px] text-mute">
              Welcome to the Super Beta Testers. Your badge, cape and lifetime
              Native+ are already on your account.
            </p>
          </>
        ) : app.status === "rejected" ? (
          <>
            <h2 className="mt-3 text-[32px] font-extrabold tracking-tight">
              Not this time.
            </h2>
            <p className="mt-3 max-w-[560px] text-mute">
              Thanks for applying.{" "}
              {app.canReapply
                ? "You can apply again now."
                : `You can apply again from ${date(app.reapplyAt)}.`}
            </p>
          </>
        ) : app.status === "waitlist" ? (
          <>
            <h2 className="mt-3 text-[32px] font-extrabold tracking-tight">
              You’re on the waitlist.
            </h2>
            <p className="mt-3 max-w-[560px] text-mute">
              We liked your application. As soon as a spot opens up, it’s yours
              — we’ll message you on Discord.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-[32px] font-extrabold tracking-tight">
              Application sent.
            </h2>
            <p className="mt-3 max-w-[560px] text-mute">
              The team reads every one. You’ll see the decision here, and on
              Discord if you’re accepted. You can still edit it while it’s
              waiting.
            </p>
          </>
        )}

        <ol className="mt-8 grid grid-cols-3 gap-3">
          {steps.map((s, i) => (
            <li key={i} className="flex flex-col gap-2">
              <span className="relative h-1.5 overflow-hidden rounded-full bg-surface-2">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-fg"
                  initial={{ width: 0 }}
                  animate={{
                    width: s.done
                      ? "100%"
                      : i === 1 && app.status === "pending"
                        ? "45%"
                        : "0%",
                  }}
                  transition={{
                    delay: 0.2 + i * 0.25,
                    type: "spring",
                    stiffness: 120,
                    damping: 22,
                  }}
                />
              </span>
              <span
                className={`text-[13px] font-semibold ${s.done ? "text-fg" : "text-dim"}`}
              >
                {s.label}
                {s.at ? ` · ${date(s.at)}` : ""}
              </span>
            </li>
          ))}
        </ol>

        {app.note && (
          <blockquote className="mt-8 rounded-2xl border border-line bg-surface-2 p-5 text-[15px] leading-relaxed">
            <p className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-dim">
              Note from the team
            </p>
            {app.note}
          </blockquote>
        )}

        {app.status === "approved" && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div
              ref={capeRef}
              className="dots flex items-center gap-3 rounded-2xl border border-line p-4"
            >
              {cape && (
                <CapeStrip
                  strip={cape.animated ? cape.stripUrl : null}
                  still={cape.stillUrl}
                  frames={cape.frames}
                  fps={cape.fps}
                  width={34}
                  label="Super Beta Tester cape"
                />
              )}
              <span className="text-[14px] font-bold">Cape in your locker</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
              <img
                src="/badges/super-beta-tester.png"
                alt=""
                width={34}
                height={34}
                className="h-[34px] w-[34px] [image-rendering:pixelated]"
              />
              <span className="text-[14px] font-bold">
                Badge on your profile
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-inv text-inv-fg">
                <Crown className="h-4 w-4" />
              </span>
              <span className="text-[14px] font-bold">Native+ forever</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {app.status === "approved" && (
            <Link href="/account" className={primary}>
              Wear your cape
            </Link>
          )}
          {app.status === "pending" && (
            <>
              <button onClick={onEdit} className={ghost}>
                Edit application
              </button>
              <button onClick={onWithdraw} disabled={!!busy} className={ghost}>
                {busy === "withdraw" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}{" "}
                Withdraw
              </button>
            </>
          )}
          {app.status === "rejected" && app.canReapply && (
            <button onClick={onEdit} className={primary}>
              Apply again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
