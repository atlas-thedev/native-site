import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { PxLink } from "../ui/Px";

type Props = {
  title: string;
  blurb: ReactNode;
  /** "Don't have a cloak yet?" + a button to the sibling page */
  cta: { text: string; label: string; href: string };
  /** right-aligned slot under the CTA, e.g. a search box */
  aside?: ReactNode;
};

/** Page header shared by Cloaks and Cosmetics: a sky band with pixel clouds, a big title and a way to the other half of the store. */
export default function StoreHero({ title, blurb, cta, aside }: Props) {
  return (
    <header className="st-hero mb-6">
      <span aria-hidden className="st-cloud left-[8%] top-3" />
      <span aria-hidden className="st-cloud left-[46%] top-1 scale-125" />
      <span aria-hidden className="st-cloud right-[14%] top-4" />
      <div className="relative flex flex-wrap items-end justify-between gap-x-10 gap-y-6 px-6 pb-7 pt-12 sm:px-9 sm:pt-14">
        <div className="min-w-0">
          <h1 className="text-[clamp(2rem,4.4vw,2.9rem)] font-extrabold leading-none tracking-[-0.035em]">{title}</h1>
          <p className="mt-3 max-w-[560px] text-[15.5px] leading-relaxed text-mute">{blurb}</p>
        </div>
        <div className="flex flex-col items-end gap-3 max-sm:w-full max-sm:items-stretch">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 max-sm:justify-between">
            <span className="text-[14px] text-mute">{cta.text}</span>
            <PxLink href={cta.href} variant="ghost">{cta.label} <ArrowRight /></PxLink>
          </div>
          {aside}
        </div>
      </div>
    </header>
  );
}

export function Crumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13.5px] text-mute">
      {trail.map((c, i) => (
        <span key={c.label} className="inline-flex items-center gap-2">
          {i > 0 && <span aria-hidden className="text-dim">›</span>}
          {c.href ? <Link href={c.href} className="transition hover:text-fg">{c.label}</Link> : <span className="text-fg">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
