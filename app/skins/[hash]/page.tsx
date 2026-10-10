import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Users } from "lucide-react";
import ItemHead from "@/components/store/ItemHead";
import SkinHead from "@/components/SkinHead";
import SkinStage from "@/components/skins/SkinStage";
import LikeButton from "@/components/skins/LikeButton";
import SkinDownload from "@/components/skins/SkinDownload";
import { getSkin } from "@/lib/server/profiles";
import { ago, day } from "@/lib/profiles";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ hash: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { hash } = await params;
  const s = await getSkin(hash);
  const who = s?.wearers[0]?.name;
  return pageMeta({
    title: s ? `Skin${who ? ` worn by ${who}` : ""}` : "Skin not found",
    description: s ? `Minecraft skin${who ? ` worn by ${who}` : ""}${s.wearers.length > 1 ? ` and ${s.wearers.length - 1} more` : ""}. Preview it in 3D and download it.` : "This skin isn't in the Native skin library.",
    path: `/skins/${hash}`,
    noindex: !s,
  });
}

export default async function SkinPage({ params }: Params) {
  const { hash } = await params;
  const s = await getSkin(hash);
  if (!s) notFound();
  const who = s.wearers[0]?.name ?? "skin";

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-8 sm:pt-10">
      <ItemHead trail={[{ label: "Skins", href: "/skins" }, { label: `#${s.hash.slice(0, 8)}` }]} back="/skins" />
      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="st-panel relative min-h-[520px] overflow-hidden !bg-black">
          <SkinStage skin={s.url} model={s.model} />
        </div>
        <div className="st-panel flex flex-col p-6">
          <div className="flex flex-wrap items-center gap-2">
            {s.source === "mojang" ? <span className="st-tag">Minecraft skin</span> : <span className="st-tag">Native skin</span>}
            <span className="st-tag">{s.model === "slim" ? "Slim arms" : "Classic arms"}</span>
          </div>
          <h1 className="mt-4 break-all font-mono text-[clamp(1.2rem,2.4vw,1.6rem)] font-extrabold tracking-tight">#{s.hash.slice(0, 16)}</h1>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {([
              [Users, "Worn by", String(s.wearers.length)],
              [Calendar, "First seen", day(s.firstSeen)],
              [Clock, "Last seen", ago(s.lastSeen)],
            ] as const).map(([Icon, k, v]) => (
              <div key={k} className="rounded-[8px] border-2 border-line bg-black/20 p-3 shadow-[inset_0_2px_0_rgb(0_0_0/0.3)]">
                <dt className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-dim"><Icon className="h-3.5 w-3.5" />{k}</dt>
                <dd className="mt-1 text-[18px] font-extrabold leading-tight tracking-tight">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <LikeButton hash={s.hash} initial={s.likes} />
            <SkinDownload url={s.url} name={`${who}-${s.hash.slice(0, 8)}`} />
          </div>
          <div className="st-sep mt-7 pt-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-dim">Players who wore this skin</h2>
            {s.wearers.length ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {s.wearers.map((w) => (
                  <li key={w.name}>
                    <Link href={`/u/${encodeURIComponent(w.name)}`} className="flex items-center gap-3 rounded-[8px] border-2 border-line bg-surface px-3 py-2.5 transition hover:border-fg/40">
                      <SkinHead skin={s.url} name={w.name} size={30} className="rounded-[4px]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold">{w.name}</span>
                        <span className="block text-[12px] text-dim">{w.native ? "Native" : "Minecraft"} · {ago(w.lastSeen)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-[14px] text-mute">Nobody wears it right now.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
