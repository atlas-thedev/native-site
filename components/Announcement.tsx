"use client";

import { ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { useVersion } from "./VersionContext";
import { useLaunch, useCountdown } from "./launch/LaunchContext";

const pill = "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-fg transition hover:bg-surface-2";

function Mini({ at }: { at: number }) {
  const t = useCountdown(at);
  if (!t.ready) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return <span className="font-mono font-semibold tabular-nums text-fg">{t.days}d {p(t.hours)}h {p(t.minutes)}m {p(t.seconds)}s</span>;
}

/** Top bar: admin announcement › early access › live offer › launch countdown › latest version. */
export default function Announcement() {
  const version = useVersion();
  const { launch, announcement, offers, beta } = useLaunch();
  const offer = offers.find((o) => o.banner);
  const isExt = (h: string) => /^https:/.test(h);

  let body: React.ReactNode;
  if (announcement.enabled && announcement.text) {
    body = (
      <>
        <span className="truncate">{announcement.text}</span>
        {announcement.href && (
          <Link href={announcement.href} target={isExt(announcement.href) ? "_blank" : undefined} className={pill}>
            {announcement.cta || "Learn more"} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </>
    );
  } else if (beta.open) {
    body = (
      <>
        <span className="truncate">
          <b className="font-semibold text-fg">Early access is open.</b>
          <span className="hidden sm:inline"> Test new builds first and keep the Super Beta cape for good.</span>
        </span>
        {launch.prelaunch && (
          <span className="hidden items-center gap-2 md:flex">
            <span className="h-3.5 w-px bg-line" />
            <span>Launch in</span>
            <Mini at={launch.at} />
          </span>
        )}
        <Link href="/beta" className={pill}>Apply <ArrowRight className="h-3 w-3" /></Link>
      </>
    );
  } else if (offer && !launch.lockStore) {
    body = (
      <>
        <Tag className="h-3.5 w-3.5 shrink-0 text-fg" />
        <span className="truncate"><b className="text-fg">{offer.title}</b> · {offer.percent}% off{offer.itemIds.length ? " selected capes" : " every cape"}</span>
        <Link href="/capes" className={pill}>Shop capes <ArrowRight className="h-3 w-3" /></Link>
      </>
    );
  } else if (launch.prelaunch) {
    body = (
      <>
        <span className="hidden sm:inline">Native launches in</span>
        <Mini at={launch.at} />
        {launch.founderPick && (
          <Link href="/founder" className={pill}>Claim a free cape <ArrowRight className="h-3 w-3" /></Link>
        )}
      </>
    );
  } else {
    body = (
      <>
        <span className="hidden sm:inline">Native Client {version} is out, free on Windows, macOS and Linux.</span>
        <span className="sm:hidden">Native {version} is out.</span>
        <Link href="/changes" className={pill}>See what’s new <ArrowRight className="h-3 w-3" /></Link>
      </>
    );
  }

  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex h-10 max-w-[1280px] items-center justify-center gap-3 px-5 text-[13px] text-mute">
        <span className="hidden items-center gap-2 font-semibold text-fg sm:flex">
          <span className="logo-mark h-4 w-4" aria-hidden /> Native
        </span>
        <span className="hidden h-3.5 w-px bg-line sm:block" />
        {body}
      </div>
    </div>
  );
}
