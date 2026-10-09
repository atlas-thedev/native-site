"use client";

import { FlaskConical, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Countdown from "./Countdown";
import { useLaunch } from "./LaunchContext";
import { useAccount } from "../useAccount";

/** Shows its children (the download cards) after launch, or early for signed-in beta testers; otherwise a countdown + sign-up card. */
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
        <p className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[14px] font-semibold">
          <FlaskConical className="h-4 w-4" /> Super Beta Tester early access
        </p>
        {children}
      </>
    );
  return (
    <div className="dots mx-auto flex max-w-[860px] flex-col items-center rounded-[28px] border border-line px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2"><Lock className="h-5 w-5" /></span>
      <p className="mt-5 text-[26px] font-extrabold tracking-tight">Downloads open at launch</p>
      <p className="mx-auto mt-2 max-w-[460px] text-mute">Native for Windows, macOS and Linux unlocks the second the timer hits zero. Make your account now so you’re ready.</p>
      <Countdown at={launch.at} size="sm" className="mt-8" />
      <Link href={me ? "/founder" : "/register?next=/founder"} className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85">
        <Sparkles className="h-4 w-4" /> {me ? "Pick your free founder cape" : "Create your free account"}
      </Link>
    </div>
  );
}
