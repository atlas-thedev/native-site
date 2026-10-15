"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowLeft, Check, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck, User, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

const LockerViewer = dynamic(() => import("./LockerViewer"), { ssr: false });

type Mode = "login" | "register" | "forgot";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const nameRe = /^[A-Za-z0-9_]{3,16}$/;
const ease = [0.16, 1, 0.3, 1] as const;

async function post(action: string, body: object) {
  const r = await fetch(`/api/auth/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  return { ok: !!d.ok, error: d.error || (r.ok ? "" : "Something went wrong. Please try again.") };
}

const copy: Record<Mode, { title: string; sub: string; side: string; sideSub: string }> = {
  login: { title: "Welcome back", sub: "Sign in to your Native account.", side: "Pick up right where you left off.", sideSub: "Your friends, settings and look follow you to every device." },
  register: { title: "Create your account", sub: "Free, and it takes less than a minute.", side: "One account for all of Native.", sideSub: "Friends, chat, cloaks and cosmetics, synced across the launcher and the game." },
  forgot: { title: "Reset your password", sub: "We’ll email you a 6-digit code.", side: "Locked out? It happens.", sideSub: "Get a code by email, choose a new password and you’re back in." },
};

const perks = ["Free on Windows, macOS and Linux", "Cloaks and cosmetics everyone in game can see", "Friends, chat and parties built in"];

/** 0–4: length, mixed case, digits, symbols. */
function strength(pw: string) {
  if (!pw) return 0;
  let s = pw.length >= 6 ? 1 : 0;
  if (pw.length >= 10) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  else if (/\d|[^A-Za-z0-9]/.test(pw) && s < 4) s += pw.length >= 8 ? 1 : 0;
  return Math.min(4, s);
}
const STRENGTH = ["Too short", "Weak", "Okay", "Good", "Strong"];

/** Six boxes for an emailed code; paste fills them all. */
function CodeInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => refs.current[0]?.focus(), []);
  const set = (i: number, d: string) => {
    const chars = value.padEnd(6, " ").split("");
    chars[i] = d || " ";
    onChange(chars.join("").replace(/\s+$/, "").replace(/ /g, ""));
  };
  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit code">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={value[i] ?? ""}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={6}
          className="auth-otp"
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            if (digits.length > 1) {
              onChange((value.slice(0, i) + digits).slice(0, 6));
              refs.current[Math.min(5, i + digits.length)]?.focus();
              return;
            }
            set(i, digits);
            if (digits) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

function Field({ label, icon, hint, children, right }: { label: string; icon: ReactNode; hint?: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[13.5px] font-semibold">
        {label}
        {right}
      </span>
      <span className="auth-field">
        <span className="auth-field-icon" aria-hidden>{icon}</span>
        {children}
      </span>
      {hint && <span className="mt-1.5 block text-[12.5px] text-dim">{hint}</span>}
    </label>
  );
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [cool, setCool] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (mode === "login" && q.has("reset")) setInfo("Password updated. You can sign in now.");
    if (mode === "login" && q.get("link") === "expired") setInfo("That sign-in link expired. Press Open website in the Native launcher again.");
  }, [mode]);

  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  const fail = (m: string) => {
    setErr(m);
    setBusy(false);
  };

  const sendCode = async () => {
    const res = await post(mode === "register" ? "send-code" : "forgot", mode === "register" ? { email, username } : { email });
    if (!res.ok) return fail(res.error);
    setStep(2);
    setCode("");
    setCool(30);
    setInfo(`We sent a 6-digit code to ${email}.`);
    setBusy(false);
  };

  /** Where to go after signing in / up: a same-site ?next= path, else the account page. */
  const nextPath = () => {
    const n = new URLSearchParams(window.location.search).get("next") || "";
    return /^\/(?!\/)[\w\-/?=&.]*$/.test(n) ? n : "/account";
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    if (mode === "login") {
      if (!login.trim() || !password) return setErr("Enter your username or email and your password.");
      setBusy(true);
      const res = await post("login", { login, password, remember });
      if (!res.ok) return fail(res.error);
      window.location.assign(nextPath());
      return;
    }
    if (step === 1) {
      if (!emailRe.test(email.trim())) return setErr("Please enter a valid email address.");
      if (mode === "register") {
        if (!nameRe.test(username)) return setErr("Usernames are 3 to 16 letters, numbers or underscores. Your Minecraft name works best.");
        if (password.length < 6) return setErr("Password must be at least 6 characters.");
      }
      setBusy(true);
      return sendCode();
    }
    if (!/^\d{6}$/.test(code.trim())) return setErr("Enter the 6-digit code from your email.");
    if (mode === "forgot" && password.length < 6) return setErr("Password must be at least 6 characters.");
    setBusy(true);
    if (mode === "register") {
      const res = await post("verify", { email, code, username, password, model: "classic" });
      if (!res.ok) return fail(res.error);
      window.location.assign(nextPath() === "/account" ? "/founder?welcome=1" : nextPath());
    } else {
      const res = await post("reset", { email, code, password });
      if (!res.ok) return fail(res.error);
      window.location.assign("/login?reset=1");
    }
  }

  const c = copy[mode];
  const twoStep = mode !== "login";
  const capsCheck = (e: React.KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.("CapsLock") ?? false);
  const score = strength(password);

  const pwField = (label: string, auto: string, meter = false) => (
    <div>
      <Field
        label={label}
        icon={<Lock />}
        right={mode === "login" && <Link href="/forgot" className="text-[13px] font-medium text-mute underline decoration-dim underline-offset-4 hover:text-fg">Forgot password?</Link>}
      >
        <input className="auth-input !pr-12" type={show ? "text" : "password"} autoComplete={auto} value={password} onChange={(e) => setPassword(e.target.value)} onKeyUp={capsCheck} onKeyDown={capsCheck} placeholder={meter ? "At least 6 characters" : "Your password"} />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-dim transition hover:bg-surface-2 hover:text-fg">
          {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </Field>
      {caps && <p className="mt-1.5 text-[12.5px] font-medium text-fg">Caps Lock is on.</p>}
      {meter && password && (
        <div className="mt-2.5 flex items-center gap-3" aria-live="polite">
          <span className="flex flex-1 gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={`auth-meter ${score >= i ? `is-${score}` : ""}`} />
            ))}
          </span>
          <span className="w-16 text-right text-[12px] font-semibold text-mute">{STRENGTH[score]}</span>
        </div>
      )}
    </div>
  );

  const button = mode === "login" ? "Sign in" : mode === "register" ? (step === 1 ? "Continue" : "Create account") : step === 1 ? "Send reset code" : "Update password";

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-110px)] max-w-[1180px] items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="auth-shell relative grid w-full overflow-hidden rounded-[30px] border border-line bg-bg shadow-[0_40px_120px_-40px_var(--shadow)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      >
        {/* Showcase */}
        <aside className="auth-side relative hidden flex-col justify-between overflow-hidden border-r border-line p-10 lg:flex">
          <div className="dots pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" aria-hidden />
          <div className="auth-glow" aria-hidden />
          <p className="eyebrow relative">Native account</p>

          <div className="relative -mx-4 my-2 h-[330px]">
            <LockerViewer skin={mode === "register" ? "/skins/alex.png" : "/skins/steve.png"} model={mode === "register" ? "slim" : "default"} cape="/capes/founders.png" walk spin showCape layers elytra={false} />
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease }}>
                <h2 className="text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em]">{c.side}</h2>
                <p className="mt-2.5 max-w-[400px] text-[15px] leading-relaxed text-mute">{c.sideSub}</p>
              </motion.div>
            </AnimatePresence>
            <ul className="mt-6 space-y-2.5">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[14px] font-medium">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-inv text-inv-fg"><Check className="h-3 w-3" strokeWidth={3} /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Form */}
        <div className="relative flex flex-col p-7 sm:p-11">
          {mode === "forgot" ? (
            <Link href="/login" className="mb-7 inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold text-mute transition hover:text-fg"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
          ) : (
            <div className="auth-switch mb-8" role="tablist" aria-label="Account">
              <span className={`auth-switch-slab ${mode === "register" ? "is-right" : ""}`} aria-hidden />
              <Link href="/login" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-on" : ""}>Sign in</Link>
              <Link href="/register" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "is-on" : ""}>Create account</Link>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="v-display !leading-[0.9] text-[32px] leading-tight ">{step === 2 ? "Check your email" : c.title}</h1>
              <p className="mt-1.5 text-[15px] text-mute">{step === 2 ? <>Enter the code we sent to <b className="font-semibold text-fg">{email}</b>.</> : c.sub}</p>
            </div>
            {twoStep && (
              <span className="mt-2 shrink-0 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">Step {step}/2</span>
            )}
          </div>
          {twoStep && (
            <div className="mt-5 flex gap-1.5" aria-hidden>
              <span className="auth-step is-on" />
              <span className={`auth-step ${step === 2 ? "is-on" : ""}`} />
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-7 space-y-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${mode}-${step}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25, ease }} className="space-y-5">
                {mode === "login" && (
                  <>
                    <Field label="Username or email" icon={<User />}>
                      <input className="auth-input" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" autoFocus placeholder="Steve or steve@example.com" spellCheck={false} />
                    </Field>
                    {pwField("Password", "current-password")}
                    <label className="flex w-fit cursor-pointer select-none items-center gap-2.5 text-[14px] font-medium text-mute">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 cursor-pointer rounded accent-current" />
                      Remember me
                    </label>
                  </>
                )}
                {twoStep && step === 1 && (
                  <>
                    <Field label="Email" icon={<Mail />}>
                      <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus placeholder="you@example.com" />
                    </Field>
                    {mode === "register" && (
                      <Field
                        label="Minecraft username"
                        icon={<User />}
                        hint={username && !nameRe.test(username) ? "3 to 16 letters, numbers or underscores." : "Your Minecraft name works best. It’s what other players see."}
                        right={username && nameRe.test(username) && <CheckCircle2 className="h-4 w-4 text-fg" aria-label="Looks good" />}
                      >
                        <input className="auth-input" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))} autoComplete="username" maxLength={16} spellCheck={false} placeholder="Steve" />
                      </Field>
                    )}
                    {mode === "register" && pwField("Password", "new-password", true)}
                  </>
                )}
                {twoStep && step === 2 && (
                  <>
                    <div>
                      <span className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold"><KeyRound className="h-4 w-4" /> 6-digit code</span>
                      <CodeInput value={code} onChange={setCode} disabled={busy} />
                      <div className="mt-3 flex items-center justify-between text-[13px]">
                        <button type="button" onClick={() => { setStep(1); setErr(""); setInfo(""); }} className="font-medium text-mute underline decoration-dim underline-offset-4 hover:text-fg">Change email</button>
                        <button type="button" disabled={cool > 0 || busy} onClick={async () => { setBusy(true); setErr(""); await sendCode(); }} className="font-medium text-mute underline decoration-dim underline-offset-4 hover:text-fg disabled:no-underline disabled:opacity-60">
                          {cool > 0 ? `Resend in ${cool}s` : "Resend code"}
                        </button>
                      </div>
                    </div>
                    {mode === "forgot" && pwField("New password", "new-password", true)}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {(err || (info && step !== 2)) && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} role={err ? "alert" : "status"} className={`auth-note ${err ? "is-err" : ""}`}>
                  {err ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  <span>{err || info}</span>
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={busy} className="auth-submit">
              {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : mode === "register" && step === 2 ? <UserPlus className="h-[18px] w-[18px]" /> : null}
              {button}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-7 flex gap-3 rounded-[18px] border border-line bg-surface p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-bg"><ShieldCheck className="h-[18px] w-[18px]" /></span>
              <p className="text-[13px] leading-relaxed text-mute">
                <b className="font-semibold text-fg">Premium Minecraft account?</b> Sign in with Microsoft in the Native launcher, then press the globe (Open website) next to your account.
              </p>
            </div>
          )}

          <div className="mt-auto pt-8 text-center text-[13px] text-dim">
            {mode === "login" && <>New to Native? <Link href="/register" className="font-semibold text-fg underline decoration-dim underline-offset-4 hover:decoration-fg">Create a free account</Link></>}
            {mode === "register" && <>By creating an account you agree to the <Link href="/terms" className="underline underline-offset-2 hover:text-fg">Terms</Link> and <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">Privacy Policy</Link>.</>}
            {mode === "forgot" && <>Remembered it? <Link href="/login" className="font-semibold text-fg underline decoration-dim underline-offset-4 hover:decoration-fg">Sign in</Link></>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
