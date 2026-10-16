"use client";

import { motion } from "motion/react";
import { ArrowUpRight, CheckCircle2, FileText, FolderLock, KeyRound, Shield, ShieldCheck, Terminal, UserCheck } from "lucide-react";
import Link from "next/link";
import SectionHead from "../SectionHead";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.8, delay: i * 0.08, ease },
});

const pillars = [
  {
    icon: KeyRound,
    badge: "Authentication",
    title: "Official Microsoft OAuth 2.0",
    desc: "You log in directly on Microsoft’s official authentication portal. Native never sees, transmits, or stores your Microsoft password. Only standard cryptographic session tokens are stored locally on your device to launch the game.",
    points: [
      "Direct Microsoft login (login.live.com)",
      "Zero password logging or intercepting",
      "Encrypted local session token storage",
    ],
  },
  {
    icon: ShieldCheck,
    badge: "Integrity",
    title: "Code-Signed & SHA-256 Verified",
    desc: "Every installer and portable archive is compiled via automated, transparent GitHub Actions pipelines. We publish cryptographic SHA-256 hashes alongside every release so you can independently verify binary integrity before execution.",
    points: [
      "Verifiable GitHub Actions build pipelines",
      "Cryptographic SHA-256 release checksums",
      "Published alongside every version release",
    ],
  },
  {
    icon: Shield,
    badge: "Privacy",
    title: "Zero Telemetry & No Adware",
    desc: "Unlike other third-party launchers, Native contains zero ad trackers, no background telemetry collectors, and no spyware. We don't sell your data, monetize your browsing, or bundle unwanted software. What happens on your machine stays on your machine.",
    points: [
      "100% ad-free & tracker-free binary",
      "No silent background telemetry probes",
      "No bundled third-party bloatware",
    ],
  },
  {
    icon: Terminal,
    badge: "Diagnostics",
    title: "Transparent Crash Diagnostics",
    desc: "The crash analyzer diagnoses game and mod failures entirely offline on your computer. Crash logs are only uploaded to mclo.gs when you explicitly choose to share them, and all sensitive tokens, player IDs, and local paths are automatically sanitized.",
    points: [
      "100% local, offline crash inspections",
      "User-consented log sharing via mclo.gs",
      "Automatic token and IP address scrubbing",
    ],
  },
];

export default function TrustSecurity() {
  return (
    <section id="security" className="v-section v-wrap">
      <SectionHead
        index="(07)"
        label="Trust & Security"
        title="Built for trust. Verified for security."
        sub="A Minecraft launcher has access to your system. That requires absolute engineering transparency. Native is built with official authentication, cryptographic verification, and strict data privacy."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            {...rise(i)}
            className="group flex flex-col justify-between rounded-[24px] border border-line bg-surface/70 p-7 transition duration-300 hover:border-fg/30 hover:bg-surface sm:p-8"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-2 text-fg shadow-sm transition group-hover:scale-105">
                  <p.icon className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-line/80 bg-surface px-3 py-1 text-[12px] font-mono uppercase tracking-wider text-dim">
                  {p.badge}
                </span>
              </div>

              <h3 className="mt-6 text-[22px] font-extrabold tracking-tight text-fg">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mute">{p.desc}</p>
            </div>

            <ul className="mt-6 space-y-2.5 border-t border-line/60 pt-6">
              {p.points.map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-[13.5px] font-medium text-mute">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        {...rise(4)}
        className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-[24px] border border-line bg-surface/40 p-6 sm:p-8"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fg text-bg">
            <FolderLock className="h-6 w-6" />
          </span>
          <div>
            <h4 className="text-[17px] font-bold text-fg">Complete Local Sandboxing</h4>
            <p className="text-[14px] text-mute">Your instances, worlds, and custom configs reside in standard local folders. Never locked, never proprietary.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/security"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[14px] font-semibold text-fg transition hover:bg-surface-2"
          >
            Full Security Architecture <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/download#checksums"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[14px] font-semibold text-fg transition hover:bg-surface-2"
          >
            Release Checksums <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/privacy"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[14px] font-semibold text-fg transition hover:bg-surface-2"
          >
            Privacy Policy <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
