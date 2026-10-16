import Link from "next/link";
import { Check, Copy, ExternalLink, FileCode, KeyRound, Lock, Shield, ShieldAlert, ShieldCheck, Terminal, UserCheck } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Security & Trust",
  description: "How Native protects your account, game files, and system: official Microsoft authentication, code-signed installers, SHA-256 release checksums, and zero telemetry.",
  path: "/security",
});

const matrixCollected = [
  { item: "Microsoft Password", status: "NEVER", note: "Handled strictly on login.live.com. Native never sees, touches, or stores your password." },
  { item: "Session Tokens", status: "Local Only", note: "Encrypted and stored only on your computer to launch the game without re-signing in." },
  { item: "Game Files & Worlds", status: "Local Only", note: "Saved in standard local directories. Never uploaded, locked, or modified by our servers." },
  { item: "Background Telemetry", status: "NEVER", note: "No third-party analytics trackers, no adware SDKs, and no hidden telemetry beacons." },
  { item: "Crash Logs", status: "User-Consented", note: "Parsed locally by default. Only uploaded to mclo.gs if you click 'Share log', with tokens stripped." },
  { item: "Relay Friends & Chat", status: "Encrypted in Transit", note: "Delivered strictly between conversation participants with HTTPS and WSS." },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-32 pt-24 sm:px-8 sm:pt-32">
      <JsonLd data={breadcrumb([{ name: "Security & Trust", path: "/security" }])} />

      <div className="mb-14 text-center">
        <Reveal><p className="eyebrow">Security & Trust</p></Reveal>
        <SplitText as="h1" text="Engineered for trust." className="v-display !leading-[0.9] mt-5 text-[clamp(2.8rem,7vw,5.6rem)]" />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-[620px] text-lg text-mute">
            Running a Minecraft launcher requires trust. Here is exactly how Native is architected to keep your Microsoft account, system, and personal data secure.
          </p>
        </Reveal>
      </div>

      {/* 4 Core Pillars */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-[24px] border border-line bg-surface p-7 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-fg">
            <KeyRound className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-[22px] font-extrabold tracking-tight">Official Microsoft OAuth 2.0</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-mute">
            When you sign in to Minecraft, the launcher opens Microsoft’s official OAuth 2.0 PKCE authentication flow directly on <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-fg">login.live.com</code>.
          </p>
          <ul className="mt-5 space-y-2 text-[14px] text-mute">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>We never see, receive, or store your Microsoft password</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>2-Factor Authentication (2FA) works natively</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Session tokens are encrypted on your local drive</span>
            </li>
          </ul>
        </div>

        <div className="rounded-[24px] border border-line bg-surface p-7 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-fg">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-[22px] font-extrabold tracking-tight">Code Signing & Release Integrity</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-mute">
            All Native installers, executables, and AppImages are compiled through clean, reproducible GitHub Actions pipelines with verifiable code signatures.
          </p>
          <ul className="mt-5 space-y-2 text-[14px] text-mute">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Automated GitHub release builds</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Cryptographic SHA-256 release checksums</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>No tampered or ad-bundled binaries</span>
            </li>
          </ul>
        </div>

        <div className="rounded-[24px] border border-line bg-surface p-7 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-fg">
            <Shield className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-[22px] font-extrabold tracking-tight">Zero Telemetry & Strict Privacy</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-mute">
            Native is completely free of third-party trackers, adware, and data mining. We do not track your hardware IDs, web activity, or play habits.
          </p>
          <ul className="mt-5 space-y-2 text-[14px] text-mute">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Zero third-party analytics or marketing SDKs</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>No advertising cookies or cross-site tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>We never sell or distribute player data</span>
            </li>
          </ul>
        </div>

        <div className="rounded-[24px] border border-line bg-surface p-7 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-fg">
            <Terminal className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-[22px] font-extrabold tracking-tight">Local-First Crash Diagnostics</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-mute">
            The built-in crash analyzer reads your logs locally to detect conflicting mods and memory issues. No logs are ever uploaded without your explicit command.
          </p>
          <ul className="mt-5 space-y-2 text-[14px] text-mute">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Analyzes errors directly on your CPU</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Optional sharing via trusted mclo.gs service</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Sensitive tokens & paths sanitized automatically</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Verification Instructions */}
      <section className="mt-16 rounded-[28px] border border-line bg-surface p-8 sm:p-10">
        <h2 className="text-[26px] font-extrabold tracking-tight">How to verify release checksums</h2>
        <p className="mt-2 max-w-[620px] text-[15px] text-mute">
          Before running an installer, you can verify that your downloaded file matches our exact binary bit-for-bit using standard operating system utilities.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface-2 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] font-bold text-fg">Windows (PowerShell)</span>
            </div>
            <p className="mt-2 text-[13px] text-mute">Open PowerShell in your Downloads folder and run:</p>
            <code className="mt-3 block overflow-x-auto rounded-xl border border-line bg-bg p-3.5 font-mono text-[12.5px] text-fg">
              Get-FileHash .\Native-Client-Setup-*.exe -Algorithm SHA256
            </code>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] font-bold text-fg">macOS & Linux (Terminal)</span>
            </div>
            <p className="mt-2 text-[13px] text-mute">Open Terminal in your Downloads folder and run:</p>
            <code className="mt-3 block overflow-x-auto rounded-xl border border-line bg-bg p-3.5 font-mono text-[12.5px] text-fg">
              shasum -a 256 Native-Client-*
            </code>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-6">
          <p className="text-[14px] text-mute">Compare the resulting hash with the published list on our download page.</p>
          <Link href="/download#checksums" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-fg underline decoration-line underline-offset-4 hover:decoration-fg">
            View Current SHA-256 Checksums <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Data Disclosure Matrix */}
      <section className="mt-16">
        <h2 className="text-[26px] font-extrabold tracking-tight">Data Collection & Privacy Transparency</h2>
        <p className="mt-2 text-[15px] text-mute">A clear, complete summary of what information is handled by Native.</p>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-[13px] font-bold uppercase tracking-wider text-dim">
                  <th className="px-6 py-4">Data Type</th>
                  <th className="px-6 py-4">Handling</th>
                  <th className="px-6 py-4">Policy & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[14.5px]">
                {matrixCollected.map((row) => (
                  <tr key={row.item} className="hover:bg-surface-2/50 transition">
                    <td className="px-6 py-4 font-semibold text-fg whitespace-nowrap">{row.item}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        row.status === "NEVER"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : row.status === "Local Only"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : "bg-surface-2 text-mute border border-line"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-mute text-[14px]">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security Contacts & Vulnerability Disclosure */}
      <section className="mt-16 rounded-[28px] border border-line bg-surface p-8 sm:p-10">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[20px] font-extrabold tracking-tight">Responsible Vulnerability Disclosure</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">
              If you discover a security vulnerability in Native Client or our backend services, please report it directly to our security team via our Discord or email at <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-fg">security@playnative.net</code>. We respond within 24 hours and credit researchers who practice responsible disclosure.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={site.discord} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface-2 px-5 text-[13.5px] font-semibold text-fg hover:bg-surface">
                Join Security Discord Channel <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <Link href="/privacy" className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface-2 px-5 text-[13.5px] font-semibold text-fg hover:bg-surface">
                Read Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
