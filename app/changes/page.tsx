import Link from "next/link";
import ChangesClient from "@/components/ChangesClient";
import JsonLd from "@/components/JsonLd";
import Notes from "@/components/Notes";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import { getCommits } from "@/lib/server/commits";
import { getLatestMinecraft } from "@/lib/server/mojang";
import { getReleases, getSiteVersion } from "@/lib/server/releases";
import { breadcrumb, pageMeta } from "@/lib/seo";

export const revalidate = 600;

export const metadata = pageMeta({
  title: "What’s new",
  description: "Release notes and the full change log for Native Client, plus the newest Minecraft release and snapshot.",
  path: "/changes",
});

const d = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—");

export default async function ChangesPage() {
  const [mc, releases, first, version] = await Promise.all([getLatestMinecraft(), getReleases(), getCommits(1, 30), getSiteVersion()]);
  const latest = releases[0];
  const stats = [
    { k: "Native Client", v: version, s: latest ? `Released ${d(latest.date)}` : "Latest build" },
    { k: "Minecraft release", v: mc?.release ?? "—", s: mc ? `Released ${d(mc.releaseDate)}` : "Unavailable right now" },
    { k: "Minecraft snapshot", v: mc?.snapshot ?? "—", s: mc ? d(mc.snapshotDate) : "Unavailable right now" },
  ];
  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-32 pt-24 sm:px-8 sm:pt-32">
      <JsonLd data={breadcrumb([{ name: "What’s new", path: "/changes" }])} />
      <div className="mb-14 text-center">
        <Reveal><p className="eyebrow">Change log</p></Reveal>
        <SplitText as="h1" text="What’s new." className="mt-5 text-[clamp(2.8rem,7vw,5.6rem)] font-extrabold leading-[1] tracking-[-0.045em]" />
        <Reveal delay={0.2}><p className="mx-auto mt-6 max-w-[540px] text-lg text-mute">Every release and every change to Native Client, updated live. Minecraft versions come straight from Mojang.</p></Reveal>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.k} className="rounded-[22px] border border-line bg-surface p-6">
            <p className="eyebrow">{s.k}</p>
            <p className="mt-3 break-words text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold leading-tight tracking-[-0.03em]">{s.v}</p>
            <p className="mt-1 text-[13.5px] text-dim">{s.s}</p>
          </div>
        ))}
      </div>

      <section className="mt-20" aria-labelledby="rel">
        <h2 id="rel" className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold tracking-[-0.035em]">Releases</h2>
        {releases.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-mute">No release has been published yet.</p>
        ) : (
          <ol className="mt-8 space-y-5">
            {releases.map((r, i) => (
              <li key={r.tag} className="rounded-[24px] border border-line bg-surface p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[26px] font-extrabold tracking-tight">{r.version}</span>
                  {i === 0 && <span className="rounded-full bg-inv px-3 py-0.5 text-[12px] font-bold text-inv-fg">Latest</span>}
                  {r.prerelease && <span className="rounded-full border border-line px-3 py-0.5 text-[12px] font-semibold text-mute">Pre-release</span>}
                  <span className="ml-auto font-mono text-[12.5px] text-dim">{d(r.date)}</span>
                </div>
                <div className="mt-4">
                  {r.notes.trim() ? <Notes md={r.notes} /> : <p className="text-[15px] text-dim">No release notes were written for this version.</p>}
                </div>
                {i === 0 && <Link href="/download" className="mt-6 inline-flex h-10 items-center rounded-full bg-inv px-5 text-[14px] font-semibold text-inv-fg transition hover:opacity-85">Download {r.version}</Link>}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-24" aria-labelledby="log">
        <h2 id="log" className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold tracking-[-0.035em]">Development log</h2>
        <p className="mb-8 mt-2 text-mute">Everything that has been merged, newest first.</p>
        <ChangesClient initial={first.commits} hasMore={first.hasMore} shippedAt={latest?.date ?? null} />
      </section>
    </div>
  );
}
