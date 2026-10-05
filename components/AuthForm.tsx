"use client";

import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Mode = "login" | "register" | "forgot";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function post(action: string, body: object) {
  const r = await fetch(`/api/auth/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  return { ok: !!d.ok, error: d.error || (r.ok ? "" : "Something went wrong. Please try again.") };
}

const copy = {
  login: { title: "Welcome back.", sub: "Sign in to manage your Native locker." },
  register: { title: "Create your account.", sub: "One Native account for your locker, friends and settings." },
  forgot: { title: "Reset your password.", sub: "We’ll email you a 6-digit code." },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [cool, setCool] = useState(0);

  useEffect(() => {
    if (mode === "login" && new URLSearchParams(window.location.search).has("reset")) setInfo("Password updated. You can sign in now.");
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
    setCool(30);
    setInfo(`We sent a 6-digit code to ${email}.`);
    setBusy(false);
  };

  /** Where to go after signing in / up: a same-site ?next= path, else the locker. */
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
      const res = await post("login", { login, password });
      if (!res.ok) return fail(res.error);
      window.location.assign(nextPath());
      return;
    }
    if (step === 1) {
      if (!emailRe.test(email.trim())) return setErr("Please enter a valid email address.");
      if (mode === "register") {
        if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) return setErr("Usernames are 3 to 16 letters, numbers or underscores. Your Minecraft name works best.");
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
  const pwField = (label: string, auto: string) => (
    <label className="block">
      <span className="mb-2 block text-[13.5px] font-semibold">{label}</span>
      <span className="relative block">
        <input className="field !pr-12" type={show ? "text" : "password"} autoComplete={auto} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-dim transition hover:text-fg">
          {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </span>
    </label>
  );
  const textField = (label: string, v: string, set: (s: string) => void, p: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-2 block text-[13.5px] font-semibold">{label}</span>
      <input className="field" value={v} onChange={(e) => set(e.target.value)} {...p} />
    </label>
  );

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-110px)] max-w-[1280px] items-center justify-center px-5 py-16">
      <div className="dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)]" aria-hidden />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative w-full max-w-[440px] rounded-[28px] border border-line bg-bg p-8 shadow-[0_30px_80px_-30px_var(--shadow)] sm:p-10">
        <span className="logo-mark mb-6 block h-10 w-10" aria-hidden />
        <h1 className="text-[32px] font-extrabold leading-tight tracking-[-0.04em]">{c.title}</h1>
        <p className="mt-2 text-[15px] text-mute">{c.sub}</p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-4">
          {mode === "login" && (
            <>
              {textField("Username or email", login, setLogin, { autoComplete: "username", autoFocus: true })}
              {pwField("Password", "current-password")}
              <div className="-mt-1 text-right"><Link href="/forgot" className="text-[13.5px] text-mute underline decoration-dim underline-offset-4 hover:text-fg">Forgot password?</Link></div>
            </>
          )}
          {mode !== "login" && step === 1 && (
            <>
              {textField("Email", email, setEmail, { type: "email", autoComplete: "email", autoFocus: true })}
              {mode === "register" && textField("Minecraft username", username, setUsername, { autoComplete: "username", maxLength: 16, spellCheck: false })}
              {mode === "register" && pwField("Password", "new-password")}
            </>
          )}
          {mode !== "login" && step === 2 && (
            <>
              {textField("6-digit code", code, (s) => setCode(s.replace(/\D/g, "").slice(0, 6)), { inputMode: "numeric", autoComplete: "one-time-code", autoFocus: true, placeholder: "······", className: "field text-center font-mono text-2xl tracking-[0.5em]" })}
              {mode === "forgot" && pwField("New password", "new-password")}
              <button type="button" disabled={cool > 0 || busy} onClick={async () => { setBusy(true); setErr(""); await sendCode(); }} className="text-[13.5px] text-mute underline decoration-dim underline-offset-4 hover:text-fg disabled:no-underline disabled:opacity-60">
                {cool > 0 ? `Resend code in ${cool}s` : "Resend code"}
              </button>
            </>
          )}

          <AnimatePresence>
            {(err || info) && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} role={err ? "alert" : "status"} className={`overflow-hidden rounded-xl border px-4 py-3 text-[14px] ${err ? "border-fg text-fg" : "border-line text-mute"}`}>
                {err || info}
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" disabled={busy} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-inv text-[16px] font-semibold text-inv-fg transition hover:opacity-85 active:scale-[0.98] disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign in" : mode === "register" ? (step === 1 ? "Send verification code" : "Create account") : step === 1 ? "Send reset code" : "Update password"}
          </button>
        </form>

        <p className="mt-7 text-center text-[14.5px] text-mute">
          {mode === "login" ? (
            <>New to Native? <Link href="/register" className="font-semibold text-fg underline decoration-dim underline-offset-4 hover:decoration-fg">Create an account</Link></>
          ) : (
            <>Back to <Link href="/login" className="font-semibold text-fg underline decoration-dim underline-offset-4 hover:decoration-fg">sign in</Link></>
          )}
        </p>
        {mode === "register" && (
          <p className="mt-4 text-center text-[12.5px] leading-relaxed text-dim">
            By creating an account you agree to the <Link href="/terms" className="underline underline-offset-2 hover:text-fg">Terms</Link> and <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">Privacy Policy</Link>.
          </p>
        )}
      </motion.div>
    </div>
  );
}
