"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import Countdown from "./Countdown";
import { useLaunch } from "./LaunchContext";
import { useAccount } from "../useAccount";

/** Shows its children (the download cards) only after launch; before that, a countdown + sign-up card. */
export default function DownloadGate({ children }: { children: React.ReactNode }) {
  const { launch } = useLaunch();
  const me = useAccount();
  if (!launch.lockDownloads) return <>{children}</>;
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
