import { ArrowRight } from "lucide-react";
import Link from "next/link";
import BetaBadge from "./beta/BetaBadge";

/** The early access invite that sits at the top of the hero. */
export default function EarlyAccess({ className = "" }: { className?: string }) {
  return (
    <Link href="/beta" className={`ea-banner group ${className}`} aria-label="Early access is open. Apply to the Super Beta Tester program">
      <span className="ea-banner-glow" aria-hidden />
      <BetaBadge size={30} still />
      <span className="flex min-w-0 flex-col items-start leading-tight">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-beta">
          <span className="h-1.5 w-1.5 rounded-full bg-current [animation:pulse-soft_1.4s_ease-in-out_infinite]" />
          Early access is open
        </span>
        <span className="mt-0.5 truncate text-[14px] font-semibold text-fg">Become a Super Beta Tester</span>
      </span>
      <span className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-inv text-inv-fg transition-transform duration-300 group-hover:translate-x-0.5">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
