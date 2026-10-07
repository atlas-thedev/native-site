"use client";

import { Crown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBilling, openPortal, startCheckout, type BillingState } from "./capes/billing";
import { money } from "@/lib/store";
import { useLaunch } from "./launch/LaunchContext";

const fmt = (t: number | null) => (t ? new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "");

/** Monthly / yearly cards with live member state. */
export default function PlusPlans() {
  const [bill, setBill] = useState<BillingState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const { launch } = useLaunch();

  useEffect(() => {
    getBilling().then(setBill).catch(() => {});
  }, []);

  const plans = bill?.config?.plus;
  const monthly = plans?.monthly?.amount ?? 2.99;
  const yearly = plans?.yearly?.amount ?? 24.99;
  const saving = Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100));
  const enabled = bill ? !!bill.config.enabled : true;
  const plus = bill?.plus;

  const go = async (plan: "monthly" | "yearly") => {
    setErr("");
    setBusy(plan);
    try {
      await startCheckout({ kind: "plus", plan });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t start the checkout.");
      setBusy(null);
    }
  };
  const manage = async () => {
    setErr("");
    setBusy("portal");
    try {
      await openPortal();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t open billing.");
    } finally {
      setBusy(null);
    }
  };

  const primary = "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-inv px-6 text-[15px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-60";
  const ghost = "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line px-6 text-[15px] font-semibold transition hover:bg-surface-2 disabled:opacity-60";

  if (plus?.active) {
    return (
      <div className="card mt-10 flex flex-wrap items-center gap-5 p-7">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-inv text-inv-fg"><Crown className="h-5 w-5" /></span>
        <div className="min-w-[220px] flex-1">
          <p className="text-[20px] font-extrabold tracking-tight">You’re a Native+ member</p>
          <p className="mt-1 text-mute">
            {plus.plan === "yearly" ? "Yearly" : "Monthly"} plan · {plus.endsAt ? `ends ${fmt(plus.endsAt)}` : plus.renewsAt ? `renews ${fmt(plus.renewsAt)}` : "active"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/download" className="inline-flex h-11 items-center rounded-full bg-inv px-5 text-[14.5px] font-semibold text-inv-fg transition hover:opacity-85">Open the launcher</Link>
          <button onClick={manage} disabled={busy === "portal"} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[14.5px] font-semibold transition hover:bg-surface-2">
            {busy === "portal" && <Loader2 className="h-4 w-4 animate-spin" />} Manage billing
          </button>
        </div>
        {err && <p role="alert" className="w-full text-[14px] font-semibold">{err}</p>}
      </div>
    );
  }

  const card = (plan: "monthly" | "yearly", price: number, per: string, note: string, best = false) => (
    <div className={`card flex flex-col p-7 ${best ? "border-fg/60" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold uppercase tracking-wider text-mute">{plan === "monthly" ? "Monthly" : "Yearly"}</p>
        {best && saving > 0 && <span className="rounded-full bg-inv px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-inv-fg">Save {saving}%</span>}
      </div>
      <p className="mt-4 text-[44px] font-extrabold leading-none tracking-[-0.04em]">{money(price)}<span className="text-[17px] font-semibold text-mute"> / {per}</span></p>
      <p className="mt-2 text-[14.5px] text-mute">{note}</p>
      <div className="mt-7">
        {launch.lockStore ? (
          <span className={`${best ? primary : ghost} cursor-default opacity-60`}><Crown className="h-4 w-4" /> Opens at launch</span>
        ) : bill && !bill.signedIn ? (
          <Link href="/login" className={best ? primary : ghost}>Sign in to join</Link>
        ) : (
          <button onClick={() => go(plan)} disabled={!!busy || !enabled} className={best ? primary : ghost}>
            {busy === plan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />} {enabled ? `Join ${plan === "monthly" ? "monthly" : "yearly"}` : "Coming soon"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2">
        {card("monthly", monthly, "month", "Billed every month. Cancel anytime.")}
        {card("yearly", yearly, "year", `About ${money(yearly / 12)} a month, billed once a year.`, true)}
      </div>
      {err && <p role="alert" className="mt-4 text-[14px] font-semibold">{err}</p>}
    </div>
  );
}
