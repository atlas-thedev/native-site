"use client";

import { Check, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PaddleEvent = { name?: string; data?: unknown };
type PaddleJs = {
  Environment: { set: (env: string) => void };
  Initialize: (o: { token: string; eventCallback?: (e: PaddleEvent) => void; checkout?: { settings?: Record<string, unknown> } }) => void;
  Checkout: { open: (o: { transactionId: string; settings?: Record<string, unknown> }) => void };
};
declare global {
  interface Window { Paddle?: PaddleJs }
}

type Phase = "loading" | "open" | "done" | "closed" | "error";

function loadPaddle(): Promise<PaddleJs> {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => (window.Paddle ? resolve(window.Paddle) : reject(new Error("Paddle didn’t load.")));
    s.onerror = () => reject(new Error("Couldn’t load the payment form. Check your connection or ad blocker."));
    document.head.appendChild(s);
  });
}

const safeReturn = (v: string | null) => (v && v.startsWith("/") && !v.startsWith("//") ? v : null);

/**
 * Paddle's default payment link points here (…/checkout?_ptxn=txn_…). The launcher and the website both send
 * buyers to this page; Paddle.js opens the overlay for the transaction and Paddle's webhook unlocks the purchase.
 */
export default function CheckoutClient() {
  const params = useSearchParams();
  const txn = params.get("_ptxn");
  const back = safeReturn(params.get("return"));
  const [phase, setPhase] = useState<Phase>(txn ? "loading" : "error");
  const [error, setError] = useState(txn ? "" : "This checkout link is missing its order. Start again from the store.");
  const paddle = useRef<PaddleJs | null>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (!txn || opened.current) return;
    opened.current = true;
    (async () => {
      try {
        const cfg = await fetch("/api/billing", { cache: "no-store" }).then((r) => r.json()).then((d) => d.config ?? {});
        if (!cfg.enabled || !cfg.clientToken) throw new Error("Payments aren’t switched on yet.");
        const P = await loadPaddle();
        paddle.current = P;
        if (cfg.environment === "sandbox") P.Environment.set("sandbox");
        const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
        P.Initialize({
          token: cfg.clientToken,
          checkout: { settings: { displayMode: "overlay", theme, allowLogout: false, showAddDiscounts: true } },
          eventCallback: (e) => {
            if (e.name === "checkout.loaded") setPhase((p) => (p === "done" ? p : "open"));
            if (e.name === "checkout.completed") setPhase("done");
            if (e.name === "checkout.closed") setPhase((p) => (p === "done" ? p : "closed"));
            if (e.name === "checkout.error") {
              setError("The payment form hit a problem. Try again.");
              setPhase("error");
            }
          },
        });
        // Paddle.js opens ?_ptxn automatically; open it ourselves if it didn’t.
        setTimeout(() => setPhase((p) => {
          if (p === "loading") P.Checkout.open({ transactionId: txn });
          return p;
        }), 2500);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn’t open the checkout.");
        setPhase("error");
      }
    })();
  }, [txn]);

  const reopen = () => {
    if (!txn || !paddle.current) return;
    setPhase("loading");
    paddle.current.Checkout.open({ transactionId: txn });
  };

  const btn = "inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85";
  const ghost = "inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-[15px] font-semibold transition hover:bg-surface-2";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col justify-center px-5 py-24 text-center">
      {phase === "done" ? (
        <>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-inv text-inv-fg"><Check className="h-7 w-7" /></span>
          <h1 className="mt-6 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">Thanks, you’re all set.</h1>
          <p className="mx-auto mt-4 max-w-[480px] text-[17px] text-mute">
            Your purchase unlocks on your Native account in a few seconds. If you bought from the launcher, head back to it and it’ll update by itself. A receipt is on its way to your email.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={back ?? "/account"} className={btn}>{back ? "Back to the store" : "Open your locker"}</Link>
            <Link href="/capes" className={ghost}>Browse capes</Link>
          </div>
        </>
      ) : phase === "closed" ? (
        <>
          <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">Checkout closed</h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[17px] text-mute">You haven’t been charged. Pick up where you left off, or go back.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={reopen} className={btn}>Continue to payment</button>
            <Link href={back ?? "/capes"} className={ghost}>Go back</Link>
          </div>
        </>
      ) : phase === "error" ? (
        <>
          <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">Checkout unavailable</h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[17px] text-mute" role="alert">{error}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={back ?? "/capes"} className={btn}>Back to capes</Link>
            <Link href="/support" className={ghost}>Get help</Link>
          </div>
        </>
      ) : (
        <>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-mute" />
          <h1 className="mt-6 text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">Secure checkout</h1>
          <p className="mx-auto mt-4 max-w-[440px] text-[16px] text-mute">Opening the payment form… Payments are processed by Paddle, our reseller and merchant of record.</p>
        </>
      )}
      <p className="mx-auto mt-12 max-w-[460px] text-[13px] text-dim">
        <Lock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" /> Orders are processed by Paddle.com, who handle payment, tax and receipts. See our <Link href="/refunds" className="underline underline-offset-2 hover:text-fg">refund policy</Link>.
      </p>
    </div>
  );
}
