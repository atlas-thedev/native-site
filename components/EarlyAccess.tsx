import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import NativeGlyph from "./NativeGlyph";

export default function EarlyAccess({
  closesAt,
}: {
  closesAt?: number | null;
}) {
  const closeLabel =
    closesAt && closesAt > Date.now()
      ? `Applications close ${new Date(closesAt).toLocaleDateString("en", { month: "short", day: "numeric" })}`
      : "Applications are open now";

  return (
    <section
      className="mx-auto max-w-[1280px] px-5 pb-8 pt-2"
      aria-labelledby="early-access-title"
    >
      <div className="early-access-card relative overflow-hidden rounded-[28px] border border-line px-6 py-7 sm:px-9 sm:py-9">
        <div className="early-access-orbit" aria-hidden />
        <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-5">
            <span className="native-glyph-shell hidden h-14 w-14 shrink-0 items-center justify-center sm:flex">
              <NativeGlyph className="h-7 w-7" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em]">
                  <span className="h-2 w-2 rounded-full bg-fg [animation:pulse-soft_1.4s_ease-in-out_infinite]" />{" "}
                  Early access
                </span>
                <span className="text-[13px] text-dim">{closeLabel}</span>
              </div>
              <h2
                id="early-access-title"
                className="mt-3 text-[clamp(1.75rem,3vw,2.55rem)] font-extrabold leading-[1.03] tracking-[-0.04em]"
              >
                Help shape the next Native build.
              </h2>
              <p className="mt-3 max-w-[720px] text-[15.5px] leading-relaxed text-mute">
                Join the Super Beta Tester program for private builds, a direct
                line to the team, and permanent rewards if you’re accepted.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-semibold text-mute">
                {[
                  "Lifetime Native+",
                  "Exclusive cape + badge",
                  "Private tester channel",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-fg" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link
            href="/beta"
            className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-full bg-inv px-6 text-[14.5px] font-bold text-inv-fg transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
          >
            Apply for early access <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
