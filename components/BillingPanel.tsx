"use client";

import { Crown, Gift, Loader2, Receipt } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBilling, openPortal, redeemCode, type BillingState } from "./capes/billing";
import { money } from "@/lib/store";

const fmt = (t: number | null) => (t ? new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
const STATUS: Record<string, string> = { completed: "Paid", paid: "Paid", refunded: "Refunded", partially_refunded: "Partly refunded", chargeback: "Charged back" };

/** Account page: Native+ status, purchase history, billing portal and redeem codes. */
export default function BillingPanel({ names }: { names: Record<string, string> }) {
  const [bill, setBill] = useState<BillingState | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"portal" | "redeem" | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; s: string } | null>(null);

  useEffect(() => {
    getBilling().then(setBill).catch(() => {});
  }, []);

  const plus = bill?.plus;
  const purchases = bill?.purchases ?? [];
  const portal = async () => {
    setMsg(null);
    setBusy("portal");
    try {
      await openPortal();
    } catch (e) {
      setMsg({ t: "err", s: e instanceof Error ? e.message : "Couldn’t open billing." });
    } finally {
      setBusy(null);
    }
  };
  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setMsg(null);
    setBusy("redeem");
    try {
      const r = await redeemCode(code.trim());
      setCode("");
      setMsg({ t: "ok", s: `${r.item?.name ?? "Your cape"} is in your locker. Reload to wear it.` });
    } catch (err) {
      setMsg({ t: "err", s: err instanceof Error ? err.message : "That code didn’t work." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-32" aria-label="Billing">
      <h2 className="mb-4 text-[22px] font-extrabold tracking-tight">Billing &amp; codes</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card flex flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"><Crown className="h-[18px] w-[18px]" /></span>
            <p className="text-[18px] font-extrabold tracking-tight">Native+</p>
          </div>
          {plus?.active ? (
            <p className="mt-3 flex-1 text-[14.5px] text-mute">
              Member · {plus.plan === "yearly" ? "yearly" : "monthly"} plan{plus.endsAt ? ` · ends ${fmt(plus.endsAt)}` : plus.renewsAt ? ` · renews ${fmt(plus.renewsAt)}` : ""}. Every paid cape is yours to add.
            </p>
          ) : (
            <p className="mt-3 flex-1 text-[14.5px] text-mute">Every paid cape and the Native+ badge from $2.99 a month.</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {plus?.active ? (
              <button onClick={portal} disabled={busy === "portal"} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[14px] font-semibold transition hover:bg-surface-2">
                {busy === "portal" && <Loader2 className="h-4 w-4 animate-spin" />} Manage or cancel
              </button>
            ) : (
              <Link href="/plus" className="inline-flex h-10 items-center rounded-full bg-inv px-4 text-[14px] font-semibold text-inv-fg transition hover:opacity-85">See Native+</Link>
            )}
          </div>
        </div>

        <div className="card flex flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"><Receipt className="h-[18px] w-[18px]" /></span>
            <p className="text-[18px] font-extrabold tracking-tight">Purchases</p>
          </div>
          {purchases.length ? (
            <ul className="mt-3 flex-1 divide-y divide-line text-[14px]">
              {purchases.slice(0, 5).map((p) => (
                <li key={p.transactionId} className="flex items-center justify-between gap-3 py-2">
                  <span className="truncate font-semibold">{p.kind === "plus" ? `Native+ ${p.plan === "yearly" ? "yearly" : "monthly"}` : names[p.itemId ?? ""] ?? "Cape"}</span>
                  <span className="shrink-0 text-mute">{money(p.amount)} · {STATUS[p.status] ?? p.status} · {fmt(p.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 flex-1 text-[14.5px] text-mute">Nothing yet. Paid capes and Native+ payments show up here.</p>
          )}
          {purchases.length > 0 && (
            <div className="mt-5">
              <button onClick={portal} disabled={busy === "portal"} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[14px] font-semibold transition hover:bg-surface-2">
                {busy === "portal" && <Loader2 className="h-4 w-4 animate-spin" />} Receipts & billing
              </button>
            </div>
          )}
        </div>

        <form onSubmit={redeem} className="card flex flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"><Gift className="h-[18px] w-[18px]" /></span>
            <p className="text-[18px] font-extrabold tracking-tight">Redeem a code</p>
          </div>
          <p className="mt-3 text-[14.5px] text-mute">Got a code from an event or the Native team? Enter it to add the cape.</p>
          <div className="mt-5 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="NATIVE-CODE" aria-label="Redeem code" maxLength={32} className="h-10 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 font-mono text-[14px] tracking-wider outline-none focus:border-fg" />
            <button disabled={busy === "redeem" || !code.trim()} className="inline-flex h-10 items-center gap-2 rounded-full bg-inv px-4 text-[14px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-50">
              {busy === "redeem" && <Loader2 className="h-4 w-4 animate-spin" />} Redeem
            </button>
          </div>
        </form>
      </div>
      {msg && <p role={msg.t === "err" ? "alert" : "status"} className={`mt-4 text-[14px] ${msg.t === "err" ? "font-semibold" : "text-mute"}`}>{msg.s}</p>}
    </section>
  );
}
