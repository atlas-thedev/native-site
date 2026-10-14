import Link from "next/link";
import { site } from "@/lib/site";
import { Discord, YouTube } from "./icons";
import ThemeToggle from "./ThemeToggle";

type FooterLink = { label: string; href: string; ext?: boolean };

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Native",
    links: [
      { label: "Download", href: "/download" },
      { label: "Features", href: "/#features" },
      { label: "Store", href: "/store" },
      { label: "Players", href: "/players" },
      { label: "Versions", href: "/#versions" },
      { label: "What’s new", href: "/changes" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Your account", href: "/account" },
      { label: "Native+", href: "/plus" },
      { label: "Super Beta", href: "/beta" },
      { label: "Community vote", href: "/vote" },
      { label: "Forgot password", href: "/forgot" },
    ],
  },
  {
    title: "Stay connected",
    links: [
      { label: "Support", href: "/support" },
      { label: "FAQ", href: "/#faq" },
      { label: "Discord", href: site.discord, ext: true },
      { label: "YouTube", href: site.youtube, ext: true },
    ],
  },
];

const legal: FooterLink[] = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refunds" },
];

import BackToTop from "./v2/BackToTop";

export default function Footer() {
  return (
    <footer className="v-foot">
      <div className="v-wrap">
        <div className="v-foot-cols">
          <div className="col-span-2 md:col-span-1">
            <p className="v-label">Native · Minecraft launcher</p>
            <p className="mt-5 max-w-[340px] font-[family-name:var(--font-display)] text-[clamp(2rem,3.4vw,3rem)] uppercase leading-[0.95]">
              {site.tagline}
            </p>
            <div className="mt-7 flex items-center gap-2">
              {[
                { i: Discord, h: site.discord, l: "Discord" },
                { i: YouTube, h: site.youtube, l: "YouTube" },
              ].map(({ i: I, h, l }) => (
                <a key={l} href={h} target="_blank" rel="noreferrer" aria-label={l} className="v-top !h-12 !w-12">
                  <I className="h-[17px] w-[17px]" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="v-foot-col">
              <h4 className="v-label">{c.title}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.ext ? (
                      <a href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="v-foot-bar">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} Native. All rights reserved.</p>
            <p>Not an official Minecraft product. Not approved by or associated with Mojang Studios or Microsoft.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legal.map((l) => (
              <Link key={l.href} href={l.href} className="transition">{l.label}</Link>
            ))}
            <ThemeToggle />
            <BackToTop />
          </div>
        </div>
      </div>
      <div aria-hidden className="v-foot-word">native</div>
    </footer>
  );
}
