import Link from "next/link";
import {
  BadgeCheck,
  Check,
  Crown,
  Heart,
  Minus,
  RefreshCw,
  Shirt,
  Sparkles,
} from "lucide-react";
import NativeGlyph from "@/components/NativeGlyph";
import JsonLd from "@/components/JsonLd";
import PlusPlans from "@/components/PlusPlans";
import PlusMark from "@/components/plus/PlusMark";
import PlusCapes from "@/components/plus/PlusCapes";
import MyShot from "@/components/plus/MyShot";
import Sky from "@/components/plus/Sky";
import CapeStrip from "@/components/CapeStrip";
import { getCatalog } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { isPaid, sortItems } from "@/lib/store";

export const revalidate = 60;
export const metadata = pageMeta({
  title: "Native+",
  description:
    "Native+ unlocks every paid Native cape and every 3D cosmetic, a gold N+ in the launcher and the Native+ crown in Relay. $2.99 a month or $24.99 a year, and you can cancel anytime.",
  path: "/plus",
});

const perks = [
  {
    icon: Shirt,
    title: "Every paid cape",
    body: "Every paid Native cape sits in your locker while you’re a member. Wear any of them in the launcher and in game.",
  },
  {
    icon: Sparkles,
    title: "Every cosmetic, free",
    body: "All the 3D hats, glasses, wings, backpacks and shoes are yours to wear while you’re a member. Nothing to buy, nothing to claim.",
  },
  {
    icon: NativeGlyph,
    title: "New drops, automatically",
    body: "When a new paid cape or cosmetic drops, it lands in your locker the same day. Nothing to buy, nothing to claim.",
  },
  {
    icon: Crown,
    title: "The Native+ crown",
    body: "A gold crown next to your name in Relay. It shows on your profile, in your friends’ lists and in every chat.",
  },
  {
    icon: BadgeCheck,
    title: "A gold N+ launcher",
    body: "The Native N in your launcher (and its app icon) picks up a gold plus while you’re a member.",
  },
  {
    icon: Heart,
    title: "Keep Native free",
    body: "Native Client stays free for everyone. Members keep the servers running and new capes coming.",
  },
  {
    icon: RefreshCw,
    title: "Cancel anytime",
    body: "Manage or cancel from your account page in two clicks. You keep Native+ until the end of the period.",
  },
];

const compare: [string, boolean | string, boolean | string][] = [
  ["The full Native Client launcher", true, true],
  ["Free Native capes", true, true],
  ["Relay chat, friends & groups", true, true],
  ["Every paid cape", "Buy one by one", true],
  ["Every 3D cosmetic (hats, glasses, wings, shoes)", "Buy one by one", true],
  ["New capes and cosmetics as they launch", false, true],
  ["Gold N+ launcher logo & icon", false, true],
  ["Native+ crown in Relay", false, true],
];

const faq = [
  [
    "What happens if I cancel?",
    "You keep Native+ until the end of the period you paid for. After that, capes and cosmetics you got through Native+ leave your locker and the badge is removed. Anything you bought on its own is yours to keep.",
  ],
  [
    "Are event capes included?",
    "No. Event items, like the Beta Tester or CrabbyMC capes, are never sold. The Native team gives them out at events or with redeem codes.",
  ],
  [
    "Does it work with my premium Minecraft account?",
    "Yes. Connect your premium account to Native in the launcher and your Native+ perks come with it.",
  ],
  [
    "Who handles the payment?",
    "Our order process is conducted by our online reseller Paddle.com. Paddle is the merchant of record for all our orders and handles payment, tax, receipts and refunds.",
  ],
  [
    "Can I get a refund?",
    "Yes. You can ask for a refund within 14 days of a purchase. The refund policy has the details.",
  ],
];

const Cell = ({ v }: { v: boolean | string }) =>
  v === true ? (
    <Check className="mx-auto h-5 w-5" aria-label="Included" />
  ) : v === false ? (
    <Minus className="mx-auto h-4 w-4 text-dim" aria-label="Not included" />
  ) : (
    <span className="text-[13.5px] text-mute">{v}</span>
  );

export default async function PlusPage() {
  const catalog = await getCatalog();
  const visible = sortItems((catalog?.items ?? []).filter((i) => !i.hidden));
  const cosmetics = (catalog?.cosmetics ?? []).filter((i) => !i.exclusive);
  const paid = visible.filter((i) => isPaid(i) || i.paid);
  const showcase = paid.length ? paid : visible.filter((i) => !i.exclusive);
  const heroCapes = showcase.filter((i) => i.animated).slice(0, 3);

  return (
    <div className="pb-32">
      <JsonLd data={breadcrumb([{ name: "Native+", path: "/plus" }])} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <Sky />
        <div className="relative mx-auto grid max-w-[1180px] items-end gap-12 px-5 pt-20 sm:pt-28 lg:grid-cols-[1fr_auto]">
          <div className="pb-36 lg:pb-44">
            <p className="eyebrow">Membership</p>
            <h1 className="mt-5 text-[clamp(3.2rem,8vw,6.4rem)] font-extrabold leading-[0.92] tracking-[-0.05em]">
              Native<span className="text-gold">+</span>
            </h1>
            <p className="mt-6 max-w-[440px] text-[19px] leading-relaxed text-mute">
              Every paid cape and every cosmetic, the gold N+ and the Native+ crown in Relay.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#plans"
                className="inline-flex h-12 items-center rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85"
              >
                Get Native+
              </a>
              <Link
                href="/download"
                className="inline-flex h-12 items-center rounded-full border border-line px-7 text-[15px] font-semibold transition hover:bg-surface-2"
              >
                Get the launcher
              </Link>
            </div>
            <p className="mt-5 text-[14px] text-dim">
              $2.99 a month or $24.99 a year
            </p>
          </div>

          {heroCapes.length > 0 && (
            <div
              className="relative hidden items-end gap-6 pb-[66px] lg:flex"
              aria-hidden
            >
              {heroCapes.map((it, i) => (
                <div
                  key={it.id}
                  style={{ transform: `translateY(${i * 9}px)` }}
                >
                  <CapeStrip
                    strip={it.stripUrl}
                    still={it.stillUrl}
                    frames={it.frames}
                    fps={it.fps}
                    width={112}
                    label={`${it.name} cape`}
                    className="cutout"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Capes */}
      {showcase.length > 0 && (
        <section className="mx-auto mt-10 max-w-[1280px] px-5">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-1">
            <div>
              <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">
                {paid.length ? "Included with Native+" : "Capes that move"}
              </h2>
              <p className="mt-1.5 text-mute">
                {paid.length
                  ? "Every paid cape, plus every new one we release."
                  : "Paid capes join your locker automatically as they launch."}
              </p>
            </div>
            <Link
              href="/download"
              className="text-[14.5px] font-semibold underline underline-offset-4 hover:opacity-70"
            >
              See them all in the launcher
            </Link>
          </div>
          <PlusCapes items={showcase} />
        </section>
      )}

      {/* Cosmetics */}
      {cosmetics.length > 0 && (
        <section className="mx-auto mt-16 max-w-[1280px] px-5">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-1">
            <div>
              <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">Every cosmetic, free</h2>
              <p className="mt-1.5 text-mute">Hats, glasses, wings, backpacks and shoes. All of them while you’re a member, and every new one we make.</p>
            </div>
            <Link href="/download" className="text-[14.5px] font-semibold underline underline-offset-4 hover:opacity-70">See them all in the launcher</Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {cosmetics.slice(0, 12).map((it) => (
              <li key={it.id}>
                <div className="st-card flex flex-col items-center p-3 text-center">
                  <MyShot item={it} className="cutout-sm h-[120px] w-[120px] object-contain" />
                  <span className="mt-2 block w-full truncate text-[13.5px] font-bold">{it.name}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">Included</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mx-auto max-w-[1080px] px-5">
        {/* Perks */}
        <section className="mt-24">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">
            What you get
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map(({ icon: I, title, body }) => (
              <li key={title} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-2">
                  <I className="h-5 w-5" />
                </span>
                <p className="mt-5 text-[17px] font-bold tracking-tight">
                  {title}
                </p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Plans */}
        <section id="plans" className="mt-24 scroll-mt-24">
          <div className="flex items-center gap-4">
            <PlusMark size={44} />
            <div>
              <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">
                Pick a plan
              </h2>
              <p className="text-mute">
                Same perks on both. Yearly saves you about 30%.
              </p>
            </div>
          </div>
          <PlusPlans />
        </section>

        {/* Compare */}
        <section className="mt-24">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">
            Free vs Native+
          </h2>
          <div className="card mt-8 overflow-x-auto p-0">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-dim">
                    Feature
                  </th>
                  <th className="w-[160px] px-6 py-4 text-center text-[13px] font-semibold uppercase tracking-wider text-dim">
                    Free
                  </th>
                  <th className="w-[160px] px-6 py-4 text-center text-[13px] font-bold uppercase tracking-wider">
                    Native<span className="text-gold">+</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([f, a, b]) => (
                  <tr key={f} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 text-[15px] font-medium">{f}</td>
                    <td className="px-6 py-4 text-center">
                      <Cell v={a} />
                    </td>
                    <td className="bg-surface-2/50 px-6 py-4 text-center">
                      <Cell v={b} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">
            Questions
          </h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {faq.map(([q, a]) => (
              <div key={q} className="grid gap-2 py-5 sm:grid-cols-[300px_1fr]">
                <dt className="font-semibold">{q}</dt>
                <dd className="text-mute">{a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[14px] text-dim">
            Prices are in US dollars; tax may be added at checkout depending on
            where you live. By subscribing you agree to the{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-fg"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/refunds"
              className="underline underline-offset-2 hover:text-fg"
            >
              Refund Policy
            </Link>
            . Native+ renews automatically until you cancel.
          </p>
        </section>

        {/* CTA */}
        <section className="card relative mt-24 overflow-hidden px-8 py-14 text-center">
          <div className="relative">
            <PlusMark size={64} className="mx-auto" />
            <h2 className="mt-6 text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold tracking-tight">
              Wear every cape. Keep Native free.
            </h2>
            <p className="mx-auto mt-3 max-w-[480px] text-mute">
              Joining takes a minute, and your capes and crown show up in the
              launcher right away.
            </p>
            <a
              href="#plans"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-inv px-7 text-[15px] font-semibold text-inv-fg transition hover:opacity-85"
            >
              <Crown className="h-4 w-4" /> Get Native+
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
