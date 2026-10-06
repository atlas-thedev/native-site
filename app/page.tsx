import Community from "@/components/Community";
import CrashCard from "@/components/CrashCard";
import FAQ from "@/components/FAQ";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import LaunchPanel from "@/components/LaunchPanel";
import Tour from "@/components/Tour";
import VersionsRail from "@/components/VersionsRail";
import JsonLd from "@/components/JsonLd";
import LauncherTabs from "@/components/home/LauncherTabs";
import CustomizeCard from "@/components/home/CustomizeCard";
import PerksCards from "@/components/home/PerksCards";
import DownloadCta from "@/components/home/DownloadCta";
import FloatingWidgets from "@/components/home/FloatingWidgets";
import DownloadGate from "@/components/launch/DownloadGate";
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
  const byId = new Map((catalog?.items ?? []).map((i) => [i.id, i]));
  const founder = cfg.launch.founderCapes
    .map((id) => byId.get(id))
    .filter((i) => !!i);
  return (
    <>
      <Intro />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <Hero founder={founder} />
      <LauncherTabs />
      <CustomizeCard />
      <LaunchPanel />
      <Community />
      <CrashCard />
      <Tour />
      <VersionsRail latest={mc} />
      <PerksCards />
      <section id="download" className="mx-auto max-w-[1280px] px-5 pb-24">
        <DownloadGate>
          <DownloadCta version={a.version} avail={a.platforms} />
        </DownloadGate>
      </section>
      <FAQ />
      <FloatingWidgets />
    </>
  );
}
