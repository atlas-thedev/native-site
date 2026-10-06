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
      { label: "The launcher", href: "/#launcher" },
      { label: "Features", href: "/#features" },
      { label: "Product tour", href: "/#tour" },
      { label: "Versions", href: "/#versions" },
      { label: "What’s new", href: "/changes" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Your locker", href: "/account" },
      { label: "Cloaks", href: "/cloaks" },
      { label: "Cosmetics", href: "/cosmetics" },
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

const linkCls = "text-[15px] text-mute transition hover:text-fg";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 pb-14 pt-16 sm:grid-cols-3 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="sm:col-span-3 md:col-span-1">
          <Link href="/" className="flex items-center gap-3">
            <img src="/brand/icon.png" alt="" width={32} height={32} className="logo-img h-8 w-8" aria-hidden />
            <span className="text-xl font-extrabold tracking-tight">native</span>
          </Link>
          <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-mute">
            {site.tagline} A modern launcher for people who care how their tools feel.
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { i: Discord, h: site.discord, l: "Discord" },
              { i: YouTube, h: site.youtube, l: "YouTube" },
            ].map(({ i: I, h, l }) => (
              <a
                key={l}
                href={h}
                target="_blank"
                rel="noreferrer"
                aria-label={l}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition hover:bg-surface-2 hover:text-fg"
              >
                <I className="h-[17px] w-[17px]" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-5 text-[15px] font-bold">{c.title}</h4>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.ext ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className={linkCls}>
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-5 py-7 text-[13px] text-dim md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} Native. All rights reserved.</p>
            <p>Not an official Minecraft product. Not approved by or associated with Mojang Studios or Microsoft.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legal.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-fg">
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
