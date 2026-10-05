"use client";

import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

/** Calls the admin proxy. Throws with the API's error message. */
export async function adm<T = Record<string, unknown>>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const r = await fetch(`/api/admin/${path}`, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const d = await r.json().catch(() => ({}));
  if (d.signIn) {
    window.location.href = "/login?next=/admin";
    throw new Error("Sign in again.");
  }
  if (!r.ok || d.ok === false)
    throw new Error(d.error || `Request failed (${r.status}).`);
  return d as T;
}

export const fileToBase64 = (f: File) =>
  new Promise<string>((res, rej) => {
    const rd = new FileReader();
    rd.onload = () => res(String(rd.result).replace(/^data:[^,]+,/, ""));
    rd.onerror = () => rej(new Error("Couldn’t read that file."));
    rd.readAsDataURL(f);
  });

/** ms → value for <input type="datetime-local"> in the browser's time zone. */
export const toLocalInput = (ms: number | null | undefined) => {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const fromLocalInput = (v: string) => (v ? new Date(v).getTime() : null);
export const fmtDate = (ms: number | null | undefined) =>
  ms
    ? new Date(ms).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
export const usd = (n: number) =>
  `$${(Math.round((Number(n) || 0) * 100) / 100).toFixed(2)}`;

/* ── toasts ─────────────────────────────────────────────────────────── */
type Toast = { id: number; t: "ok" | "err"; s: string };
const ToastCtx = createContext<(t: "ok" | "err", s: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastHost({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((t: "ok" | "err", s: string) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, t, s }]);
    setTimeout(
      () => setList((l) => l.filter((x) => x.id !== id)),
      t === "err" ? 6000 : 3200,
    );
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex flex-col items-end gap-2">
        <AnimatePresence>
          {list.map((x) => (
            <motion.div
              key={x.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              role={x.t === "err" ? "alert" : "status"}
              className={`pointer-events-auto max-w-[380px] rounded-2xl px-4 py-3 text-[14px] font-semibold shadow-xl ${x.t === "err" ? "border border-fg bg-bg text-fg" : "bg-inv text-inv-fg"}`}
            >
              {x.s}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/** Runs an async action with a busy flag and toasts. */
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const run = useCallback(
    async <T,>(
      key: string,
      fn: () => Promise<T>,
      ok?: string,
    ): Promise<T | undefined> => {
      setBusy(key);
      try {
        const r = await fn();
        if (ok) toast("ok", ok);
        return r;
      } catch (e) {
        toast("err", e instanceof Error ? e.message : "Something went wrong.");
        return undefined;
      } finally {
        setBusy(null);
      }
    },
    [toast],
  );
  return { busy, run };
}

/* ── primitives ─────────────────────────────────────────────────────── */
export function Panel({
  title,
  sub,
  actions,
  children,
  className = "",
}: {
  title?: string;
  sub?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[22px] border border-line bg-surface p-5 shadow-[0_1px_0_rgba(255,255,255,.025)] sm:p-6 ${className}`}
    >
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-[19px] font-extrabold tracking-tight">
                {title}
              </h2>
            )}
            {sub && <p className="mt-1 text-[14px] text-mute">{sub}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="group rounded-[20px] border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-fg/20 hover:bg-surface-2">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-dim">
        {label}
      </p>
      <p className="mt-2 text-[30px] font-extrabold leading-none tracking-tight">
        {value}
      </p>
      {hint && <p className="mt-2 text-[12.5px] text-mute">{hint}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-mute">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-dim">{hint}</span>}
    </label>
  );
}
export const input =
  "h-11 w-full rounded-xl border border-line bg-bg/70 px-3.5 text-[15px] text-fg outline-none transition placeholder:text-dim focus:border-fg";
export const textarea =
  "min-h-[84px] w-full rounded-xl border border-line bg-bg/70 px-3.5 py-2.5 text-[15px] text-fg outline-none transition placeholder:text-dim focus:border-fg";

export function Toggle({
  on,
  onChange,
  label,
  hint,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-line bg-bg px-4 py-3 text-left transition hover:border-fg/40 disabled:opacity-50"
    >
      <span>
        <span className="block text-[15px] font-semibold">{label}</span>
        {hint && (
          <span className="mt-0.5 block text-[12.5px] text-mute">{hint}</span>
        )}
      </span>
      <span
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-inv" : "bg-surface-2"}`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={`absolute top-0.5 h-5 w-5 rounded-full ${on ? "right-0.5 bg-inv-fg" : "left-0.5 bg-fg/60"}`}
        />
      </span>
    </button>
  );
}

export function Btn({
  children,
  onClick,
  busy,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  busy?: boolean;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const v =
    variant === "primary"
      ? "bg-inv text-inv-fg hover:opacity-85"
      : variant === "danger"
        ? "border border-line text-fg hover:border-fg hover:bg-surface-2"
        : "border border-line hover:bg-surface-2";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      title={title}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[14px] font-semibold transition disabled:opacity-50 ${v} ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({
  children,
  solid,
}: {
  children: React.ReactNode;
  solid?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${solid ? "bg-inv text-inv-fg" : "border border-line text-mute"}`}
    >
      {children}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-[14px] text-mute">
      {children}
    </p>
  );
}
