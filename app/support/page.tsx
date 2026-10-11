import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import StatusPill from "@/components/StatusPill";
import { Discord, YouTube } from "@/components/icons";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Support",
  description: "Get help with Native Client: fix launch problems, recover your account, and reach the community on Discord.",
  path: "/support",
});

const topics = [
  {
    q: "The game won’t launch",
    a: ["Open the instance and check the Console or Logs tab. The crash analyzer reads the log and suggests fixes you can apply in one click.", "Make sure the instance uses the Java version Native picked for it (Settings → Java), and that you have enough free memory allocated.", "If a mod is the culprit, disable recently added mods and relaunch."],
  },
  {
    q: "My game crashed",
    a: ["Run the crash analyzer after the crash. It points out the cause, whether that’s a conflicting mod, memory or Java.", "To ask for help, share the log from the analyzer and post the link in our Discord."],
  },
  {
    q: "I can’t sign in to my Native account",
    a: ["Use your username or email with your password.", "Forgot it? Reset it with an emailed code on the reset page.", "Didn’t get the email? Check spam, wait a minute, then request a new code."],
  },
  {
    q: "My skin or cape isn’t showing",
    a: ["Make sure you saved your changes to your account in the launcher’s Locker or on your account page.", "Microsoft accounts use the official Mojang skin; Native cosmetics apply to Native accounts.", "Other players see updates the next time their launcher syncs."],
  },
  {
    q: "Friends or messages aren’t loading",
    a: ["Check that Native services are online using the status above.", "The launcher shows your last synced friends and chats while offline and refreshes when your connection returns."],
  },
  {
    q: "I want my account deleted",
    a: ["Ask in our Discord server and we’ll take care of it. See the Privacy Policy for what we store."],
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-32 pt-24 sm:px-8 sm:pt-32">
      <JsonLd data={breadcrumb([{ name: "Support", path: "/support" }])} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: topics.map((t) => ({ "@type": "Question", name: t.q, acceptedAnswer: { "@type": "Answer", text: t.a.join(" ") } })) }} />
      <div className="mb-14 text-center">
        <Reveal><p className="eyebrow">Support</p></Reveal>
        <SplitText as="h1" text="How can we help?" className="v-display !leading-[0.9] mt-5 text-[clamp(2.8rem,7vw,5.6rem)] " />
        <Reveal delay={0.2}><p className="mx-auto mt-6 max-w-[520px] text-lg text-mute">Quick fixes for the most common problems, and real people in our community when you need more.</p></Reveal>
        <Reveal delay={0.3} className="mt-8"><StatusPill /></Reveal>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a href={site.discord} target="_blank" rel="noreferrer" className="group rounded-[24px] border border-line bg-surface p-7 transition hover:bg-surface-2">
          <Discord className="h-8 w-8" />
          <h2 className="mt-5 text-[22px] font-extrabold tracking-tight">Ask in Discord</h2>
          <p className="mt-2 text-[15px] text-mute">The fastest way to get help, report a bug or suggest an idea. Share your crash report link and we’ll take a look.</p>
        </a>
        <a href={site.youtube} target="_blank" rel="noreferrer" className="group rounded-[24px] border border-line bg-surface p-7 transition hover:bg-surface-2">
          <YouTube className="h-8 w-8" />
          <h2 className="mt-5 text-[22px] font-extrabold tracking-tight">Watch the guides</h2>
          <p className="mt-2 text-[15px] text-mute">Walkthroughs, updates and tips on our YouTube channel.</p>
        </a>
      </div>

      <h2 className="mb-6 mt-20 text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold tracking-[-0.035em]">Common problems</h2>
      <div className="divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-surface">
        {topics.map((t) => (
          <details key={t.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-[17px] font-semibold tracking-tight hover:bg-surface sm:px-7 [&::-webkit-details-marker]:hidden">
              {t.q}
              <span className="text-xl text-dim transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <ul className="space-y-2.5 px-6 pb-6 text-[15.5px] leading-relaxed text-mute sm:px-7">
              {t.a.map((x) => (
                <li key={x} className="flex gap-3"><span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-dim" />{x}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <p className="mt-12 text-center text-[14px] text-dim">
        Account trouble? <Link href="/forgot" className="text-fg underline decoration-dim underline-offset-4 hover:decoration-fg">Reset your password</Link> · <Link href="/terms" className="text-fg underline decoration-dim underline-offset-4 hover:decoration-fg">Terms</Link> · <Link href="/privacy" className="text-fg underline decoration-dim underline-offset-4 hover:decoration-fg">Privacy</Link>
      </p>
    </div>
  );
}
