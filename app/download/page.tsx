import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import DownloadCards from "@/components/DownloadCards";
import CodeSigningCredit from "@/components/CodeSigningCredit";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import CopyHash from "@/components/v2/CopyHash";
import DownloadGate from "@/components/launch/DownloadGate";
import { getAvailability, getChecksums } from "@/lib/server/releases";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Download",
  description: "Download Native Client for Windows, macOS and Linux. Free, with automatic updates, Java management and mod loader setup built in.",
  path: "/download",
});

const link = "text-fg underline decoration-dim underline-offset-4 hover:decoration-fg";
const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`;

const steps = [
  { img: "/guide/smartscreen-1.webp", t: "Keep the file", d: "Chrome or Edge may say the installer “isn’t commonly downloaded”. Open the download list and choose Keep (in Edge: ⋯ → Keep → Show more → Keep anyway)." },
  { img: "/guide/smartscreen-2.webp", t: "Click “More info”", d: "When you open the installer, Windows may show a blue “Windows protected your PC” screen. Click the small More info link under the text." },
  { img: "/guide/smartscreen-3.webp", t: "Click “Run anyway”", d: "Check that the app name starts with Native-Client, then press Run anyway. The installer starts and Native opens when it’s done." },
];

export default async function DownloadPage() {
  const [a, sums] = await Promise.all([getAvailability(), getChecksums()]);
  const any = Object.values(a.platforms).some(Boolean);
  const fmt = a.date ? new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
  return (
    <div className="pb-[clamp(80px,10vw,150px)]">
      <JsonLd data={breadcrumb([{ name: "Download", path: "/download" }])} />
      <section className="v-wrap v-page-hero">
        <div className="v-head-rule">
          <span>Version {a.version}</span>
          <span>{fmt ?? "Windows · macOS · Linux"}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <SplitText as="h1" text="Download" className="v-page-title" />
          <p className="v-page-sub !mt-0 max-w-[420px] pb-3">Free for Windows, macOS and Linux. Pick your platform and you’re playing in minutes. Updates install themselves.</p>
        </div>
      </section>

      <section className="v-wrap mt-6">
        <DownloadGate>
          <DownloadCards version={a.version} avail={a.platforms} />
          {!any && (
            <p className="mx-auto mt-10 max-w-[560px] rounded-2xl border border-line bg-surface p-5 text-center text-[15px] text-mute">
              The newest build is still being published. Check back in a little while, or ask in <a className={link} href={site.discord} target="_blank" rel="noreferrer">our Discord</a>.
            </p>
          )}
        </DownloadGate>
      </section>

      <div className="v-wrap mt-8">
        <CodeSigningCredit className="max-w-[760px]" />
      </div>

      <section id="windows-warning" className="v-wrap mt-[clamp(70px,9vw,140px)]">
        <div className="v-head-rule"><span>(Windows)</span><span>Installing for the first time</span></div>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="v-display v-h2">Windows says “unrecognized app”?</h2>
          <div className="max-w-[520px] space-y-4 text-[16px] leading-relaxed text-mute">
            <p>Windows SmartScreen can warn about new or less commonly downloaded apps while their reputation builds, even when an installer is code-signed. Check the publisher and verify the download before running it.</p>
            <p>Native is only ever published on this site and our GitHub releases. You can check your file against the SHA-256 checksums below before you run it.</p>
          </div>
        </div>
        <ol className="v-steps mt-12">
          {steps.map((s, i) => (
            <li key={s.t} className="v-step">
              <div className="flex items-baseline justify-between">
                <span className="v-step-n">0{i + 1}</span>
                <span className="v-label">Step {i + 1} of 3</span>
              </div>
              <Image src={s.img} alt={s.t} width={1440} height={900} sizes="(min-width:900px) 33vw, 94vw" />
              <h3 className="font-[family-name:var(--font-display)] text-[30px] uppercase leading-none">{s.t}</h3>
              <p className="text-[15px] leading-relaxed text-mute">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-start gap-3 text-[14.5px] text-mute">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-fg" />
          <span>You only need to do this once. After that, Native updates itself in the background. On macOS, if the app is blocked, right-click Native in Applications and choose Open.</span>
        </p>
      </section>

      {sums.files.length > 0 && (
        <section id="checksums" className="v-wrap mt-[clamp(70px,9vw,140px)]">
          <div className="v-head-rule"><span>(Verify)</span><span>SHA-256 · v{sums.version}</span></div>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="v-display v-h3">Checksums</h2>
              <p className="mt-5 max-w-[420px] text-[15.5px] leading-relaxed text-mute">Run one of these and compare the result with the hash for your file. If they match, it’s exactly the file we published.</p>
              <div className="mt-6 space-y-3 font-mono text-[12.5px]">
                <p className="v-label">Windows (PowerShell)</p>
                <code className="block rounded-[10px] border border-line bg-surface p-3 text-mute">Get-FileHash .\Native-Client-Setup-*.exe -Algorithm SHA256</code>
                <p className="v-label pt-2">macOS / Linux</p>
                <code className="block rounded-[10px] border border-line bg-surface p-3 text-mute">shasum -a 256 Native-Client-*</code>
              </div>
            </div>
            <ul className="border-t border-line">
              {sums.files.map((f) => (
                <li key={f.name} className="v-hash">
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-bold">{f.name}</span>
                    <span className="mt-1 block font-mono text-[11.5px] text-dim">{mb(f.size)}</span>
                  </span>
                  <CopyHash value={f.sha256} />
                  <code className="col-span-2">{f.sha256}</code>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Reveal delay={0.2} className="v-wrap mt-16 text-[14px] text-dim">
        See what changed in <Link className={link} href="/changes">every release</Link>. Need help? <Link className={link} href="/support">Visit support</Link> or <a className={link} href={site.discord} target="_blank" rel="noreferrer">join the Discord</a>.
      </Reveal>
    </div>
  );
}
