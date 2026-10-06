"use client";

import { ArrowDown, Check } from "lucide-react";
import Link from "next/link";
import Reveal from "../Reveal";
import SplitText from "../SplitText";
import { Apple, Linux, Windows } from "../icons";
import { useOS } from "../useOS";
import { platforms, type Platform } from "@/lib/site";
import type { Avail } from "../DownloadCards";

const mb = (n: number) => `${Math.round(n / 1048576)} MB`;

const rows: {
  key: string;
  p: Platform;
  label: string;
  sub: string;
  href: string;
  Icon: typeof Windows;
}[] = [
  { key: "win", p: "windows", label: "Windows", sub: "Windows 10 and 11 · x64", href: "/api/download/windows", Icon: Windows },
  { key: "mac", p: "mac", label: "macOS", sub: "Apple Silicon", href: "/api/download/mac", Icon: Apple },
  { key: "mac-x64", p: "mac", label: "macOS", sub: "Intel", href: "/api/download/mac?arch=x64", Icon: Apple },
  { key: "linux", p: "linux", label: "Linux", sub: "AppImage · .deb", href: "/api/download/linux", Icon: Linux },
];

export default function DownloadCta({ version, avail }: { version: string; avail: Avail }) {
  const os = useOS();
  const OsIcon = os === "mac" ? Apple : os === "linux" ? Linux : Windows;
  const mine = avail[os];

  return (
    <Reveal>
      <div className="nx-panel dots px-6 py-16 text-center sm:px-10 sm:py-24">
        <div className="nx-glow" aria-hidden />
        <div className="relative">
          <span className="logo-mark mx-auto mb-7 block h-12 w-12" aria-hidden />
          <SplitText
            text="Download Native."
            className="text-[clamp(2.8rem,7.5vw,6.4rem)] font-extrabold leading-[0.96] tracking-[-0.05em]"
          />
          <p className="mx-auto mt-5 max-w-[480px] text-[17px] text-mute">
            Version {version}. Free for Windows, macOS and Linux, with automatic updates built in.
          </p>

          <div className="mt-9">
            <a
              href={mine ? `/api/download/${os}` : "/download"}
              download={mine ? "" : undefined}
              className="nx-pill nx-pill-accent h-14 px-8 text-[17px]"
            >
              <OsIcon className="h-5 w-5" /> Download for {platforms[os].label} <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          <ul className="mx-auto mt-10 grid max-w-[900px] gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {rows.map(({ key, p, label, sub, href, Icon }) => {
              const file = avail[p];
              const body = (
                <>
                  <Icon className="h-6 w-6 shrink-0" />
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="text-[15px] font-bold">{label}</span>
                    <span className="truncate text-[12.5px] text-dim">{sub}</span>
                    {file && key !== "mac-x64" && <span className="mt-0.5 font-mono text-[11px] text-dim">{mb(file.size)}</span>}
                  </span>
                </>
              );
              const cls =
                "flex h-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition";
              return (
                <li key={key}>
                  {file ? (
                    <a href={href} download="" className={`${cls} hover:bg-surface-2`}>
                      {body}
                    </a>
                  ) : (
                    <div className={`${cls} opacity-50`} aria-disabled>
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-8 inline-flex items-center gap-2 text-[13.5px] text-dim">
            <Check className="h-3.5 w-3.5" /> Free to download. Sign in with Microsoft, a Native account, or play offline.{" "}
            <Link href="/download" className="underline decoration-dim underline-offset-4 hover:text-fg">
              All downloads
            </Link>
          </p>
        </div>
      </div>
    </Reveal>
  );
}
