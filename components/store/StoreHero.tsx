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
    <header className="st-hero v-store-hero mb-8 pb-8">
      <div className="v-head-rule"><span>(Native)</span><span>{cta.text}</span></div>
      <div className="relative flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div className="min-w-0">
          <h1 className="v-page-title">{title}</h1>
          <p className="v-page-sub max-w-[620px]">{blurb}</p>
        </div>
        <div className="flex flex-col items-end gap-3 max-sm:w-full max-sm:items-stretch">
          <PxLink href={cta.href} variant="ghost">{cta.label} <ArrowRight /></PxLink>
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
