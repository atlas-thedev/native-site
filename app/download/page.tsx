import DownloadCards from "@/components/DownloadCards";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import { getAvailability } from "@/lib/server/releases";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import Link from "next/link";

export const revalidate = 600;

export const metadata = pageMeta({
  title: "Download",
  description: "Download Native Client for Windows, macOS and Linux. Free, with automatic updates, Java management and mod loader setup built in.",
  path: "/download",
});

const link = "text-fg underline decoration-dim underline-offset-4 hover:decoration-fg";

export default async function DownloadPage() {
  const a = await getAvailability();
  const any = Object.values(a.platforms).some(Boolean);
  const fmt = a.date ? new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
  return (
    <section className="relative mx-auto max-w-[1240px] px-5 pb-32 pt-24 sm:px-8 sm:pt-32">
      <JsonLd data={breadcrumb([{ name: "Download", path: "/download" }])} />
      <div className="mb-16 text-center">
        <Reveal><p className="eyebrow">Version {a.version}{fmt ? ` · ${fmt}` : ""}</p></Reveal>
        <SplitText as="h1" text="Download Native Client." className="mt-5 text-[clamp(2.8rem,7vw,6rem)] font-extrabold leading-[1] tracking-[-0.045em]" />
        <Reveal delay={0.2}><p className="mx-auto mt-6 max-w-[520px] text-lg text-mute">Free for Windows, macOS and Linux. Pick your platform and you’re playing in minutes.</p></Reveal>
      </div>
      <DownloadCards version={a.version} avail={a.platforms} />
      {!any && (
        <p className="mx-auto mt-10 max-w-[560px] rounded-2xl border border-line bg-surface p-5 text-center text-[15px] text-mute">
          The newest build is still being published. Check back in a little while, or ask in <a className={link} href={site.discord} target="_blank" rel="noreferrer">our Discord</a>.
        </p>
      )}
      <Reveal delay={0.2} className="mt-12 text-center text-[14px] text-dim">
        See what changed in <Link className={link} href="/changes">every release</Link>. Need help? <Link className={link} href="/support">Visit support</Link> or <a className={link} href={site.discord} target="_blank" rel="noreferrer">join the Discord</a>.
      </Reveal>
    </section>
  );
}
