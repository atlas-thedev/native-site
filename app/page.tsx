import Community from "@/components/Community";
import CrashCard from "@/components/CrashCard";
import DownloadCards from "@/components/DownloadCards";
import FAQ from "@/components/FAQ";
import FinalCta from "@/components/FinalCta";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import LaunchPanel from "@/components/LaunchPanel";
import More from "@/components/More";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import Tour from "@/components/Tour";
import VersionsRail from "@/components/VersionsRail";
import JsonLd from "@/components/JsonLd";
import { getAvailability } from "@/lib/server/releases";
import { getLatestMinecraft } from "@/lib/server/mojang";
import { faqs } from "@/lib/site";
import { getCatalog } from "@/lib/server/store";
import { getSiteConfig } from "@/lib/server/siteConfig";
import DownloadGate from "@/components/launch/DownloadGate";

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
      <Features />
      <LaunchPanel />
      <Community />
      <CrashCard />
      <Tour />
      <VersionsRail latest={mc} />
      <More />
      <section id="download" className="mx-auto max-w-[1280px] px-5 py-24">
        <div className="mb-14 text-center">
          <Reveal>
            <p className="eyebrow">Download</p>
          </Reveal>
          <SplitText
            text="Get Native for your system"
            className="mx-auto mt-5 text-[clamp(2.2rem,4.8vw,3.8rem)] font-extrabold leading-[1.02] tracking-[-0.04em]"
          />
        </div>
        <DownloadGate>
          <DownloadCards version={a.version} avail={a.platforms} />
        </DownloadGate>
      </section>
      <FAQ />
      <FinalCta />
    </>
  );
}
