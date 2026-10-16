"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  Check,
  Clock,
  Crown,
  Hourglass,
  Loader2,
  Lock,
  MessageSquare,
  PartyPopper,
  Rocket,
  Send,
  Shirt,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CapeStrip from "../CapeStrip";
import LockerViewer from "../LockerViewer";
import Sky from "../plus/Sky";
import BetaBadge from "./BetaBadge";
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

  const perks = [
    { icon: Rocket, title: "Builds before anyone", body: "New versions show up in your launcher days or weeks before they go public." },
    { icon: MessageSquare, title: "A private channel", body: "A testers-only Discord channel. The people who build Native read every message." },
    { icon: Bug, title: "A real say", body: "Your reports decide what we fix next, and your ideas end up in what we build after." },
    { icon: Shirt, title: "The Super Beta cape", body: "Animated, never sold, and only handed to accepted testers. Wear it in the launcher and in game." },
    { icon: BadgeIcon, title: "The badge", body: "It sits next to your name in Relay, on your profile and in your friends’ lists." },
    { icon: Crown, title: "A month of Native+", body: "Every paid cape and every Native+ perk for 30 days, on us. No card needed." },
  ];
  const steps: [string, string][] = [
    ["Apply", "Three short steps. Most people finish in about three minutes."],
    ["We read it", "A real person reviews every application, usually within a week."],
    ["You’re in", "The cape, badge and your month of Native+ land on your account and we message you on Discord."],
  ];
  const faq: [string, string][] = [
    ["Who gets picked?", "People who play a lot, on different hardware and versions, and who will actually tell us when something breaks. A good bug report beats a big follower count."],
    ["How long until I hear back?", "Usually within a week. Your status updates on this page, and if you’re accepted the team sends you a Discord message."],
    ["How long does the Native+ last?", "One month from the day you’re accepted. After that you can keep it with a Native+ plan, and the Super Beta cape and badge stay yours either way."],
    ["What if I’m not picked?", "You can apply again a week after your review. Hanging out in the Discord and reporting bugs helps a lot."],
    ["Can I lose the perks?", "Only if you leak private builds or break the rules. Otherwise the cape and badge stay yours for good."],
  ];
  const cta = signedIn ? (
    app && !editing ? (
      <button onClick={goForm} className={primary}>
        <Hourglass className="h-4 w-4" /> View your application
      </button>
    ) : (
      <button onClick={goForm} disabled={!canApply} className={primary}>
        <Bug className="h-4 w-4" /> {canApply ? "Apply now" : "Applications closed"}
      </button>
    )
  ) : (
    <Link href="/register?next=/beta" className={primary}>
      <Bug className="h-4 w-4" /> Create an account to apply
    </Link>
  );

  return (
    <div className="relative pb-32">
      {/* hero */}
      <section className="relative overflow-hidden border-b border-line">
        <Sky />
        <div className="beta-sky pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-[1180px] items-end gap-12 px-5 pt-20 sm:pt-28 lg:grid-cols-[1fr_auto]">
          <div className="pb-36 lg:pb-44">
            <p className="eyebrow flex items-center gap-2.5">
              <span className={`h-2 w-2 rounded-full ${open ? "bg-beta [animation:pulse-soft_1.4s_ease-in-out_infinite]" : "bg-dim"}`} />
              {open ? "Applications open" : "Applications closed"}
            </p>
            <h1 className="v-display !leading-[0.9] mt-5 text-[clamp(3.2rem,8vw,6.4rem)] ">
              Super Beta<span className="text-beta">.</span>
            </h1>
            <p className="mt-6 max-w-[470px] text-[19px] leading-relaxed text-mute">
              Play new Native builds before anyone else, talk straight to the team, keep the cape and badge for good, and get a month of Native+ on us.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {cta}
              {signedIn ? (
                <a href="#how" className={ghost}>How it works</a>
              ) : (
                <Link href="/login?next=/beta" className={ghost}>Sign in</Link>
              )}
            </div>
            <p className="mt-5 text-[14px] text-dim">Free to apply. Takes about three minutes.</p>
          </div>

          <div className="relative hidden items-end gap-7 pb-[66px] lg:flex" aria-hidden>
            {cape ? (
              <div className="relative">
                <span className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--beta)_22%,transparent),transparent)]" />
                <CapeStrip strip={cape.animated ? cape.stripUrl : null} still={cape.stillUrl} frames={cape.frames} fps={cape.fps} width={150} label="Super Beta Tester cape" className="cutout relative" />
              </div>
            ) : (
              <span className="grid h-[240px] w-[150px] place-items-center rounded-2xl border border-line text-dim">Cape</span>
            )}
            <div className="mb-6 flex flex-col items-center gap-3">
              <BetaBadge size={96} />
              <span className="rounded-full border border-line bg-bg/70 px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-mute backdrop-blur">Testers only</span>
            </div>
          </div>
        </div>
      </section>

      {/* rewards */}
      <section className="mx-auto mt-10 max-w-[1280px] px-5">
        <div className="mb-6 px-1">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">What you keep</h2>
          <p className="mt-1.5 text-mute">Never sold, never in a sale. Accepted testers only.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="beta-cape-stage card relative flex flex-col overflow-hidden p-0">
            <div className="dots relative min-h-[380px] flex-1 sm:min-h-[460px]">
              {cape ? (
                <LockerViewer
                  skin={skin ?? (model === "slim" ? "/skins/alex.png" : "/skins/steve.png")}
                  model={model}
                  cape={cape.stillUrl}
                  capeAnim={cape.animated && cape.stripUrl ? { url: cape.stripUrl, frames: cape.frames, fps: cape.fps } : null}
                  walk
                  spin
                  showCape
                  layers
                  elytra={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-mute">The Super Beta Tester cape</div>
              )}
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="rounded-2xl border border-line bg-bg/80 px-4 py-3 backdrop-blur-xl">
                  <p className="text-[15px] font-extrabold tracking-tight">Super Beta Tester cape</p>
                  <p className="text-[12.5px] text-dim">Animated · {name ? `Shown on ${name}` : "Drag to spin"}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="card flex items-center gap-6 p-6">
              <span className="dots grid h-[120px] w-[120px] shrink-0 place-items-center rounded-2xl">
                <BetaBadge size={84} />
              </span>
              <div>
                <p className="text-[19px] font-extrabold tracking-tight">The badge</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">Shows next to your name in Relay and on your profile, so everyone knows you were here early.</p>
              </div>
            </div>
            <div className="card flex items-center gap-6 p-6">
              <span className="dots grid h-[120px] w-[120px] shrink-0 place-items-center rounded-2xl">
                <PlusMark size={60} />
              </span>
              <div>
                <p className="text-[19px] font-extrabold tracking-tight">
                  A month of Native<span className="text-gold">+</span>
                </p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">Every paid cape, the gold N+ and the crown in Relay for 30 days. No card, no subscription.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1080px] px-5">
        {/* perks */}
        <section className="mt-24">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">What testers get</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map(({ icon: I, title, body }) => (
              <li key={title} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-2">
                  <I className="h-5 w-5" />
                </span>
                <p className="mt-5 text-[17px] font-bold tracking-tight">{title}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* how it works */}
        <section id="how" className="mt-24 scroll-mt-24">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">How it works</h2>
          <ol className="card mt-8 grid p-0 md:grid-cols-3">
            {steps.map(([t, d], i) => (
              <li key={t} className="border-line p-6 sm:p-7 [&:not(:last-child)]:border-b md:[&:not(:last-child)]:border-b-0 md:[&:not(:last-child)]:border-r">
                <span className="font-mono text-[13px] font-semibold text-dim">0{i + 1}</span>
                <p className="mt-3 text-[17px] font-bold tracking-tight">{t}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">{d}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* form / status */}
      <section
        ref={formRef}
        id="apply"
        className="mt-24 scroll-mt-24"
      >
        <div className="mx-auto max-w-[860px] px-5">
          {!signedIn ? (
            <div className="card relative overflow-hidden p-8 text-center sm:p-12">
              <Lock className="mx-auto h-8 w-8" />
              <h2 className="mt-5 text-[30px] font-extrabold tracking-tight">
                Sign in to apply.
              </h2>
              <p className="mx-auto mt-3 max-w-[460px] text-mute">
                If you’re accepted, the cape, badge and a month of Native+ go straight to
                your Native account. Making one takes a minute.
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
                  We’re testing with the current group right now. Join the
                  Discord and you’ll hear first when the next round opens.
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
                            hint="We guessed this from your browser. Change it if it’s off."
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
                            hint="CPU, graphics card and RAM. It helps us cover lots of hardware."
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
                              placeholder="What would you test first? What do you love or hate about Minecraft launchers?"
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


      <div className="mx-auto max-w-[1080px] px-5">
        {/* faq */}
        <section className="mt-24">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">Questions</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {faq.map(([q, d]) => (
              <div key={q} className="grid gap-2 py-5 sm:grid-cols-[300px_1fr]">
                <dt className="font-semibold">{q}</dt>
                <dd className="text-mute">{d}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* cta */}
        {!(app && app.status === "approved") && (
          <section className="card relative mt-24 overflow-hidden px-8 py-14 text-center">
            <div className="beta-sky pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              <BetaBadge size={76} className="mx-auto" />
              <h2 className="mt-6 text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold tracking-tight">Find the bugs before everyone else.</h2>
              <p className="mx-auto mt-3 max-w-[480px] text-mute">Tell us how you play and what you run it on. We’ll take it from there.</p>
              <div className="mt-8 flex justify-center">{cta}</div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const BadgeIcon = ({ className = "" }: { className?: string }) => <BetaBadge size={22} still className={className} />;

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
              Welcome to the Super Beta Testers. Your badge, cape and month of
              Native+ are already on your account.
              {app.plusEndsAt ? ` Native+ runs until ${new Date(app.plusEndsAt).toLocaleDateString(undefined, { day: "numeric", month: "long" })}.` : ""}
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
              We liked your application. The next spot that opens is yours,
              and we’ll message you on Discord when it does.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-[32px] font-extrabold tracking-tight">
              Application sent.
            </h2>
            <p className="mt-3 max-w-[560px] text-mute">
              Someone on the team will read it. The decision shows up here, and
              if you’re accepted you’ll get a Discord message too. You can still
              edit it while you wait.
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
              <BetaBadge size={34} still />
              <span className="text-[14px] font-bold">
                Badge on your profile
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-inv text-inv-fg">
                <Crown className="h-4 w-4" />
              </span>
              <span className="text-[14px] font-bold">{app.plusEndsAt ? `Native+ until ${date(app.plusEndsAt)}` : "A month of Native+"}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {app.status === "approved" && (
            <Link href="/download" className={primary}>
              Wear it in the launcher
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
