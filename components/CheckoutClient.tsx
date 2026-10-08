"use client";

import { Check, ExternalLink, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loadTebex, payUrl, siteTheme, type TebexJs } from "./tebex";

type Phase = "loading" | "ready" | "open" | "done" | "closed" | "error";

const safeReturn = (v: string | null) => (v && v.startsWith("/") && !v.startsWith("//") ? v : null);
const IDENT = /^[A-Za-z0-9-]{6,80}$/;

/**
 * The launcher and the website send buyers here (/checkout?ident=…). Tebex.js opens the Tebex checkout for the
 * basket; Tebex's webhook unlocks the purchase. Tebex sends buyers back to /checkout?done=1 after paying on pay.tebex.io.
 */
export default function CheckoutClient() {
  const params = useSearchParams();
  const raw = params.get("ident");
  const ident = raw && IDENT.test(raw) ? raw : null;
  const finished = params.get("done") === "1";
  const back = safeReturn(params.get("return"));
  const [phase, setPhase] = useState<Phase>(finished ? "done" : ident ? "loading" : "error");
  const [error, setError] = useState(finished || ident ? "" : "This checkout link is missing its order. Start again from the store.");
  const tebex = useRef<TebexJs | null>(null);
  const started = useRef(false);

  const launch = () => {
    const T = tebex.current;
    if (!T || !ident) return;
    try {
      T.checkout.init({ ident, theme: siteTheme(), closeOnPaymentComplete: true });
      T.checkout.launch();
    } catch {
      window.location.href = payUrl(ident);
    }
  };

  useEffect(() => {
    if (finished || !ident || started.current) return;
    started.current = true;
    (async () => {
      try {
        const T = await loadTebex();
        tebex.current = T;
        T.checkout.on("open", () => setPhase((p) => (p === "done" ? p : "open")));
        T.checkout.on("payment:complete", () => setPhase("done"));
        T.checkout.on("close", () => setPhase((p) => (p === "done" ? p : "closed")));
        T.checkout.on("payment:error", () => {
          setError("The payment didn’t go through. You haven’t been charged — try again or use another payment method.");
          setPhase("closed");
        });
        setPhase("ready");
        launch(); // may be blocked as a popup on some browsers; the button below works either way
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn’t open the checkout.");
        setPhase("error");
      }
    })();
  }, [ident, finished]);

  const btn = "inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85";
  const ghost = "inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-[15px] font-semibold transition hover:bg-surface-2";
  const h1 = "text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col justify-center px-5 py-24 text-center">
      {phase === "done" ? (
        <>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-inv text-inv-fg"><Check className="h-7 w-7" /></span>
          <h1 className={`mt-6 ${h1}`}>Thanks, you’re all set.</h1>
          <p className="mx-auto mt-4 max-w-[480px] text-[17px] text-mute">
            Your purchase unlocks on your Native account in a few seconds. If you bought from the launcher, head back to it and it’ll update by itself. A receipt from Tebex is on its way to your email.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={back ?? "/account"} className={btn}>{back ? "Go back" : "Your account"}</Link>
            <Link href="/download" className={ghost}>Get the launcher</Link>
          </div>
        </>
      ) : phase === "error" ? (
        <>
          <h1 className={h1}>Checkout unavailable</h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[17px] text-mute" role="alert">{error}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {ident && <a href={payUrl(ident)} className={btn}>Open the payment page <ExternalLink className="h-4 w-4" /></a>}
            <Link href={back ?? "/plus"} className={ident ? ghost : btn}>Go back</Link>
            <Link href="/support" className={ghost}>Get help</Link>
          </div>
        </>
      ) : phase === "loading" ? (
        <>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-mute" />
          <h1 className={`mt-6 ${h1}`}>Secure checkout</h1>
          <p className="mx-auto mt-4 max-w-[440px] text-[16px] text-mute">Opening the payment form…</p>
        </>
      ) : (
        <>
          <h1 className={h1}>{phase === "closed" ? "Checkout closed" : "Secure checkout"}</h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[17px] text-mute" role={error ? "alert" : undefined}>
            {error || (phase === "closed" ? "You haven’t been charged. Pick up where you left off, or go back." : phase === "open" ? "Finish paying in the Tebex window." : "Your order is ready. Continue to pay securely with Tebex.")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={launch} className={btn}><Lock className="h-4 w-4" /> Continue to payment</button>
            <Link href={back ?? "/plus"} className={ghost}>Go back</Link>
          </div>
          {ident && (
            <p className="mt-5 text-[14px] text-mute">
              Window didn’t open? <a href={payUrl(ident)} className="underline underline-offset-2 hover:text-fg">Pay on the Tebex page instead</a>.
            </p>
          )}
        </>
      )}
      <p className="mx-auto mt-12 max-w-[460px] text-[13px] text-dim">
        <Lock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" /> Orders are processed by Tebex, our reseller and merchant of record, who handle payment, tax and receipts. See our <Link href="/refunds" className="underline underline-offset-2 hover:text-fg">refund policy</Link>.
      </p>
    </div>
  );
}
