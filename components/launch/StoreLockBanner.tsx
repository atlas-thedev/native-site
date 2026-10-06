"use client";

import { Gift, Lock } from "lucide-react";
import { PxLink } from "../ui/Px";
import Countdown from "./Countdown";
import { useLaunch } from "./LaunchContext";

/** Shown above the cape gallery while the store is locked before launch. */
export default function StoreLockBanner({ signedIn }: { signedIn: boolean }) {
  const { launch } = useLaunch();
  if (!launch.lockStore || !launch.prelaunch) return null;
  return (
    <div className="st-panel mb-6 flex flex-col items-start justify-between gap-6 p-6 sm:p-7 lg:flex-row lg:items-center">
      <div>
        <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-dim"><Lock className="h-3.5 w-3.5" /> Store locked until launch</p>
        <p className="mt-2 text-[24px] font-extrabold tracking-tight">Browse now, buy on launch day.</p>
        <p className="mt-1 max-w-[520px] text-mute">{launch.founderPick ? "Make your account before launch and one founder cape is yours, free." : "Capes go on sale the moment Native launches."}</p>
      </div>
      <div className="flex flex-col items-start gap-4 lg:items-end">
        <Countdown at={launch.at} size="sm" />
        {launch.founderPick && (
          <PxLink href={signedIn ? "/founder" : "/register?next=/founder"} variant="light"><Gift /> {signedIn ? "Pick your free cape" : "Join early · free cape"}</PxLink>
        )}
      </div>
    </div>
  );
}
