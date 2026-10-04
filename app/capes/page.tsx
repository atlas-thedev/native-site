import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import CapeGallery from "@/components/capes/CapeGallery";
import { readSession } from "@/lib/server/session";
import { getCatalog, getMine } from "@/lib/server/store";
import { breadcrumb, pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Capes",
  description: "Browse every Native cape — animated and classic. Preview them in 3D, add them to your locker and wear them in the launcher and in game.",
  path: "/capes",
});

export default async function CapesPage() {
  const [catalog, s] = await Promise.all([getCatalog(), readSession()]);
  const mine = s ? await getMine(s.token) : null;
  const items = catalog?.items ?? [];
  const animated = items.filter((i) => i.animated).length;
  const owners = items.reduce((n, i) => n + (i.owners ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-16 sm:pt-24">
      <JsonLd data={breadcrumb([{ name: "Capes", path: "/capes" }])} />
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Native capes</p>
          <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[1] tracking-[-0.045em]">Capes that move.</h1>
          <p className="mt-5 max-w-[580px] text-lg text-mute">Every Native cape in one place. Preview in 3D, add to your locker and wear it — in the launcher and in game. Most are free — paid capes are a one-off buy or included with Native+.</p>
        </div>
        <div className="flex flex-col items-end gap-4">
          {items.length > 0 && <dl className="flex gap-8 text-right">
            {[["Capes", items.length], ["Animated", animated], ["In lockers", owners]].map(([k, v]) => (
              <div key={k}>
                <dd className="text-[28px] font-extrabold tracking-tight">{Number(v).toLocaleString()}</dd>
                <dt className="text-[12.5px] font-semibold uppercase tracking-wider text-dim">{k}</dt>
              </div>
            ))}
          </dl>}
          {s ? (
            <Link href="/account" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[14.5px] font-semibold transition hover:bg-surface-2">Your locker</Link>
          ) : (
            <Link href="/register" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[14.5px] font-semibold transition hover:bg-surface-2">Create a free account</Link>
          )}
        </div>
      </header>
      <CapeGallery items={items} signedIn={!!s} owned={mine?.owned ?? []} equipped={mine?.equipped ?? null} />
    </div>
  );
}
