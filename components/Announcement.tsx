"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useVersion } from "./VersionContext";

export default function Announcement() {
  const version = useVersion();
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex h-10 max-w-[1280px] items-center justify-center gap-3 px-5 text-[13px] text-mute">
        <span className="hidden items-center gap-2 font-semibold text-fg sm:flex">
          <span className="logo-mark h-4 w-4" aria-hidden /> Native
        </span>
        <span className="hidden h-3.5 w-px bg-line sm:block" />
        <span className="hidden sm:inline">Native Client {version} — free for Windows, macOS and Linux.</span>
        <span className="sm:hidden">Native {version} is out.</span>
        <Link href="/changes" className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-fg transition hover:bg-surface-2">
          See what’s new <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
