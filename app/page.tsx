import FAQ from "@/components/FAQ";
import VersionsRail from "@/components/VersionsRail";
import JsonLd from "@/components/JsonLd";
import DownloadCta from "@/components/home/DownloadCta";
import FloatingWidgets from "@/components/home/FloatingWidgets";
import DownloadGate from "@/components/launch/DownloadGate";
import SectionHead from "@/components/v2/SectionHead";
import HomeHero from "@/components/v2/home/HomeHero";
import { BigCta, GoFurther, Locker } from "@/components/v2/home/Sections";
import { Explainer, Highlights, Included, LauncherGrid } from "@/components/v2/home/Laby";
import { getAvailability } from "@/lib/server/releases";
import { getLatestMinecraft } from "@/lib/server/mojang";
import { faqs } from "@/lib/site";
import { getCatalog } from "@/lib/server/store";
import { outfitOf } from "@/lib/outfit";
import type { Wearing } from "@/lib/store";
import { getSiteConfig } from "@/lib/server/siteConfig";

export const revalidate = 60;

/** How many Minecraft releases exist (for the stats row). */
async function releaseCount(): Promise<number> {
  try {
    const r = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest_v2.json", { next: { revalidate: 86400 } });
    if (!r.ok) return 80;
    const m = (await r.json()) as { versions: { type: string }[] };
    const n = m.versions.filter((v) => v.type === "release").length;
    return n > 0 ? Math.floor(n / 10) * 10 : 80;
  } catch {
    return 80;
  }
}

export default async function Home() {
  const [a, mc, cfg, catalog, versions] = await Promise.all([
    getAvailability(),
    getLatestMinecraft(),
    getSiteConfig(),
    getCatalog(),
    releaseCount(),
  ]);
  const all = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])].filter((i) => !i.hidden);
  const byId = new Map(all.map((i) => [i.id, i]));
  const mascot = outfitOf({ wearing: { hats: "cyber-hood", hand: "witch-broom", shoes: "street-sneakers" } as Wearing }, all).worn;
  const capes = (catalog?.items ?? []).filter((i) => !i.hidden);
  const showcase = [...capes.filter((i) => i.featured), ...capes.filter((i) => !i.featured)];
  const pre = cfg.launch.prelaunch;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <HomeHero mascot={mascot} />
      <Included items={all.length} versions={versions} />
      <Highlights />
      <LauncherGrid />
      <Locker items={showcase} />
      <VersionsRail latest={mc} />
      <Explainer versions={versions} />
      <GoFurther />
      <section id="download" className="v-wrap pb-[clamp(80px,10vw,150px)]">
        <SectionHead index="(06)" label="Download" title="Get Native" />
        <DownloadGate>
          <DownloadCta version={a.version} avail={a.platforms} />
        </DownloadGate>
      </section>
      <FAQ />
      <BigCta pre={pre} />
      <FloatingWidgets />
    </>
  );
}
