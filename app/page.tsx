import FAQ from "@/components/FAQ";
import VersionsRail from "@/components/VersionsRail";
import JsonLd from "@/components/JsonLd";
import DownloadCta from "@/components/home/DownloadCta";
import FloatingWidgets from "@/components/home/FloatingWidgets";
import DownloadGate from "@/components/launch/DownloadGate";
import Marquee from "@/components/v2/Marquee";
import SectionHead from "@/components/v2/SectionHead";
import HomeHero, { ShowReel } from "@/components/v2/home/HomeHero";
import { BigCta, FeatureIndex, GoFurther, Locker, Spreads, Statement } from "@/components/v2/home/Sections";
import { getAvailability } from "@/lib/server/releases";
import { getLatestMinecraft } from "@/lib/server/mojang";
import { faqs } from "@/lib/site";
import { getCatalog } from "@/lib/server/store";
import { getSiteConfig } from "@/lib/server/siteConfig";

export const revalidate = 60;

export default async function Home() {
  const [a, mc, cfg, catalog] = await Promise.all([
    getAvailability(),
    getLatestMinecraft(),
    getSiteConfig(),
    getCatalog(),
  ]);
  const all = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])].filter((i) => !i.hidden);
  const byId = new Map(all.map((i) => [i.id, i]));
  const founder = cfg.launch.founderCapes.map((id) => byId.get(id)).filter((i) => !!i);
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
      <HomeHero founder={founder} />
      <Marquee items={["Instances", "Mods", "Modpacks", "Skins", "Capes", "Relay chat", "Crash fixer", "Every version"]} />
      <Statement items={all.length} />
      <ShowReel />
      <FeatureIndex />
      <Spreads />
      <Marquee className="is-outline" reverse speed={46} items={["Wear something rare", "Animated capes", "Cosmetics", "3D locker"]} />
      <div className="pt-[clamp(84px,11vw,170px)]">
        <Locker items={showcase} />
      </div>
      <VersionsRail latest={mc} />
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
