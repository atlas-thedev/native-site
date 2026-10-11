"use client";

import { Loader2, Receipt } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadTebex, siteTheme } from "./tebex";

/** /billing: opens Tebex's payment portal, where buyers see receipts and manage or cancel Native+. */
export default function BillingPortalClient() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const cfg = await fetch("/api/billing", { cache: "no-store" }).then((r) => r.json()).then((d) => d.config ?? {});
        if (!cfg.publicToken) throw new Error("Billing isn’t available right now. Contact us through the Support page and we’ll help.");
        await loadTebex();
        setToken(cfg.publicToken);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn’t load billing.");
        setToken(null);
      }
    })();
  }, []);

  const open = () => {
    if (!token || !window.Tebex) return;
    window.Tebex.portal.init({ token, theme: siteTheme() });
    window.Tebex.portal.launch();
  };

  const btn = "inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85 disabled:opacity-60";
  const ghost = "inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-[15px] font-semibold transition hover:bg-surface-2";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col justify-center px-5 py-24 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-2"><Receipt className="h-6 w-6" /></span>
      <h1 className="v-display !leading-[0.9] mt-6 text-[clamp(2.2rem,5vw,3.4rem)] ">Billing</h1>
      <p className="mx-auto mt-4 max-w-[480px] text-[17px] text-mute">
        Payments are handled by Tebex, our merchant of record. In the payment portal you can see receipts and manage or cancel Native+. Sign in there with the email you paid with.
      </p>
      {error && <p role="alert" className="mx-auto mt-4 max-w-[460px] text-[15px] font-semibold">{error}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={open} disabled={!token} className={btn}>
          {token === undefined && <Loader2 className="h-4 w-4 animate-spin" />} Open payment portal
        </button>
        <Link href="/account" className={ghost}>Your account</Link>
      </div>
      <p className="mx-auto mt-10 max-w-[460px] text-[13px] text-dim">
        Need a refund? See the <Link href="/refunds" className="underline underline-offset-2 hover:text-fg">refund policy</Link> or reach us on the <Link href="/support" className="underline underline-offset-2 hover:text-fg">Support page</Link>.
      </p>
    </div>
  );
}
