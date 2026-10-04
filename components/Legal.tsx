import JsonLd from "./JsonLd";
import { breadcrumb } from "@/lib/seo";

export type Section = { h: string; body: (string | string[])[] };

export default function Legal({ title, path, updated, intro, sections }: { title: string; path: string; updated: string; intro: string; sections: Section[] }) {
  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-32 pt-24 sm:px-8 sm:pt-32">
      <JsonLd data={breadcrumb([{ name: title, path }])} />
      <header className="mb-14">
        <p className="eyebrow">Legal · Updated {updated}</p>
        <h1 className="mt-5 text-[clamp(2.6rem,6vw,4.8rem)] font-extrabold leading-[1] tracking-[-0.045em]">{title}</h1>
        <p className="mt-6 max-w-[680px] text-lg leading-relaxed text-mute">{intro}</p>
      </header>
      <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-28 space-y-2.5 text-[14px]">
            {sections.map((s, i) => (
              <li key={s.h}><a href={`#s${i + 1}`} className="text-mute transition hover:text-fg">{i + 1}. {s.h}</a></li>
            ))}
          </ol>
        </nav>
        <div className="space-y-12">
          {sections.map((s, i) => (
            <section key={s.h} id={`s${i + 1}`} className="scroll-mt-28">
              <h2 className="text-[24px] font-extrabold tracking-tight">{i + 1}. {s.h}</h2>
              <div className="mt-4 space-y-4 text-[16px] leading-[1.7] text-mute">
                {s.body.map((b, k) =>
                  Array.isArray(b) ? (
                    <ul key={k} className="space-y-2">
                      {b.map((li) => (
                        <li key={li} className="flex gap-3"><span className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-dim" /><span>{li}</span></li>
                      ))}
                    </ul>
                  ) : (
                    <p key={k}>{b}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
