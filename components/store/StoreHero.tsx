import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  active: "cloaks" | "cosmetics";
  eyebrow: string;
  title: string;
  blurb: string;
  stats: [string, string | number][];
  /** a few floating previews on the right */
  previews?: ReactNode;
};

const TABS = [
  { id: "cloaks", href: "/cloaks", label: "Cloaks" },
  { id: "cosmetics", href: "/cosmetics", label: "Cosmetics" },
] as const;

/** Shared header for the Cloaks and Cosmetics pages so both read as one store. */
export default function StoreHero({ active, eyebrow, title, blurb, stats, previews }: Props) {
  return (
    <header className="card relative mb-8 overflow-hidden p-0">
      <div aria-hidden className="dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,transparent,#000_70%)]" />
      <div className="relative grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <nav aria-label="Store sections" className="inline-flex gap-1 rounded-full border border-line bg-bg/60 p-1 backdrop-blur">
            {TABS.map((t) => (
              <Link key={t.id} href={t.href} aria-current={active === t.id ? "page" : undefined}
                className={`inline-flex h-8 items-center rounded-full px-4 text-[13.5px] font-semibold transition ${active === t.id ? "bg-inv text-inv-fg" : "text-mute hover:text-fg"}`}>
                {t.label}
              </Link>
            ))}
          </nav>
          <p className="eyebrow mt-6">{eyebrow}</p>
          <h1 className="mt-3 text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[0.95] tracking-[-0.045em]">{title}</h1>
          <p className="mt-4 max-w-[560px] text-[16.5px] text-mute">{blurb}</p>
          <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-3">
            {stats.map(([k, v]) => (
              <div key={k}>
                <dd className="text-[26px] font-extrabold leading-none tracking-tight">{v}</dd>
                <dt className="mt-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-dim">{k}</dt>
              </div>
            ))}
          </dl>
        </div>
        {previews && <div className="hidden items-end justify-center gap-4 lg:flex">{previews}</div>}
      </div>
    </header>
  );
}
