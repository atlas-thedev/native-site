"use client";

import { FlaskConical, Gift, Sparkles, UserCheck, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLaunch } from "./LaunchContext";
import { useAccount } from "../useAccount";

/** Shows its children (the download cards) after launch, or early for signed-in beta testers; otherwise an early access application card. */
export default function DownloadGate({ children }: { children: React.ReactNode }) {
  const { launch } = useLaunch();
  const me = useAccount();
  const [tester, setTester] = useState(false);
  const locked = launch.lockDownloads;

  useEffect(() => {
    if (!locked || !me) return;
    let dead = false;
    fetch("/api/download/access", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => !dead && setTester(d?.tester === true))
      .catch(() => {});
    return () => {
      dead = true;
    };
  }, [locked, me]);

  if (!locked) return <>{children}</>;

  if (tester)
    return (
      <>
        <div className="mx-auto mb-8 flex w-fit items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-[14px] font-semibold text-emerald-600 dark:text-emerald-400">
          <FlaskConical className="h-4 w-4" />
          <span>Super Beta Tester Early Access Unlocked — Welcome to Native!</span>
        </div>
        {children}
      </>
    );

  return (
    <div className="dots mx-auto flex max-w-[860px] flex-col items-center rounded-[28px] border border-line bg-surface/50 px-6 py-14 text-center backdrop-blur-sm">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
        <FlaskConical className="h-4 w-4" /> Early Access Active · Super Beta Program
      </span>

      <p className="mt-5 text-[28px] font-extrabold tracking-tight sm:text-[34px]">Downloads available in Early Access</p>
      
      <p className="mx-auto mt-3 max-w-[560px] text-[16px] leading-relaxed text-mute">
        General public downloads will unlock with full public release. Early Access is open right now for approved Super Beta testers. Apply today to test builds, give feedback, and earn the permanent Super Beta cloak.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/beta"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85 shadow-sm"
        >
          <FlaskConical className="h-4 w-4" /> Apply for Early Access
        </Link>

        {!me ? (
          <Link
            href="/login?next=/download"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-6 text-[15px] font-semibold text-fg transition hover:bg-surface-2"
          >
            <UserCheck className="h-4 w-4" /> Already a tester? Sign in
          </Link>
        ) : (
          <Link
            href="/founder"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-6 text-[15px] font-semibold text-fg transition hover:bg-surface-2"
          >
            <Gift className="h-4 w-4" /> Claim Free Founder Cape
          </Link>
        )}
      </div>

      <div className="mt-10 grid w-full max-w-[620px] grid-cols-1 gap-3 border-t border-line/60 pt-8 sm:grid-cols-3 text-left">
        <div className="rounded-xl border border-line/60 bg-surface/60 p-3.5">
          <p className="text-[13px] font-bold text-fg flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Active Builds
          </p>
          <p className="mt-1 text-[12px] text-mute">Windows, macOS & Linux builds available for testers.</p>
        </div>
        <div className="rounded-xl border border-line/60 bg-surface/60 p-3.5">
          <p className="text-[13px] font-bold text-fg flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-emerald-500" /> Free Cape & Cloak
          </p>
          <p className="mt-1 text-[12px] text-mute">Keep the Super Beta cloak and claim a Founder cape.</p>
        </div>
        <div className="rounded-xl border border-line/60 bg-surface/60 p-3.5">
          <p className="text-[13px] font-bold text-fg flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Safe & Verified
          </p>
          <p className="mt-1 text-[12px] text-mute">Official Microsoft OAuth, code-signed, SHA-256 verified.</p>
        </div>
      </div>
    </div>
  );
}
