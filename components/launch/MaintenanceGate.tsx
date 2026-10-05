"use client";

import { Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Countdown from "./Countdown";
import { useLaunch } from "./LaunchContext";
import { useAccount } from "../useAccount";
import { site } from "@/lib/site";

const OPEN = ["/login", "/admin"];

/** Covers the site while maintenance is on. Admins (and the sign-in page) get through. */
export default function MaintenanceGate() {
  const { maintenance } = useLaunch();
  const me = useAccount();
  const path = usePathname() || "/";
  const open = OPEN.some((p) => path === p || path.startsWith(`${p}/`));
  const block = maintenance.enabled && !open && !me?.isAdmin;

  useEffect(() => {
    if (!block) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [block]);

  if (!maintenance.enabled) return null;
  if (!block) {
    return me?.isAdmin ? (
      <div className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-line bg-bg/90 px-4 py-2 text-[12.5px] font-semibold shadow-lg backdrop-blur">
        Maintenance mode is on, so only admins can see the site. <Link className="underline" href="/admin">Turn off</Link>
      </div>
    ) : null;
  }
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="mt-title" className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" aria-hidden />
      <div className="relative flex flex-col items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface"><Wrench className="h-7 w-7 [animation:float-y_2.4s_ease-in-out_infinite]" /></span>
        <p className="eyebrow mt-8">Maintenance</p>
        <h1 id="mt-title" className="mt-4 max-w-[640px] text-balance text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.04em]">{maintenance.message || "We’ll be right back."}</h1>
        {maintenance.until && maintenance.until > Date.now() && (
          <>
            <p className="mt-8 text-[13px] font-semibold uppercase tracking-wider text-dim">Back in about</p>
            <Countdown at={maintenance.until} size="sm" className="mt-3" />
          </>
        )}
        <div className="mt-10 flex gap-3">
          <a href={site.discord} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85">Updates on Discord</a>
          <Link href="/login" className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[15px] font-semibold transition hover:bg-surface-2">Staff sign in</Link>
        </div>
      </div>
    </div>
  );
}
