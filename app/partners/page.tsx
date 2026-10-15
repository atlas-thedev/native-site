import Link from "next/link";
import { ArrowUpRight, Handshake, Megaphone, Rocket, Server } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import SectionHead from "@/components/v2/SectionHead";
import SplitText from "@/components/SplitText";
import Marquee from "@/components/v2/Marquee";
import Magnetic from "@/components/v2/Magnetic";
import PartnerCard from "@/components/partners/PartnerCard";
import PartnerOrbit from "@/components/partners/PartnerOrbit";
import { getPartners } from "@/lib/server/partners";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 60;
export const metadata = pageMeta({
  title: "Partners",
  description: "The hosts, servers and creators Native Client works with, including Aurex Hosting, Sri Lanka’s #1 game hosting provider.",
  path: "/partners",
});

const pitch = [
  { Icon: Server, t: "Hosts & servers", d: "Put your brand in front of players the moment they pick where to play." },
  { Icon: Megaphone, t: "Creators", d: "Exclusive capes, codes and drops for your community, worn in game." },
  { Icon: Rocket, t: "Brands", d: "An animated card on playnative.net and inside the launcher, made for you." },
];

export default async function PartnersPage() {
  const partners = await getPartners();
  const featured = partners.filter((p) => p.tier === "featured");
  const rest = partners.filter((p) => p.tier !== "featured");

  return (
    <div className="pb-[clamp(80px,10vw,150px)]">
      <JsonLd data={breadcrumb([{ name: "Partners", path: "/partners" }])} />

      <section className="np-hero v-wrap">
        <div className="np-hero-copy">
          <p className="v-label">Partners · {partners.length || "Soon"}</p>
          <SplitText as="h1" text="Better together" className="v-display mt-6 text-[clamp(3.6rem,10vw,9.5rem)]" stagger={0.08} />
          <p className="mt-7 max-w-[480px] text-[clamp(16px,1.4vw,19px)] leading-relaxed text-mute">
            Native is free because of the people we team up with. Meet the hosts, servers and creators who help keep it fast.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Magnetic>
              <a href="#all" className="v-btn is-solid is-lg">Meet them</a>
            </Magnetic>
            <a href="#become-a-partner" className="v-btn is-lg">Partner with us <ArrowUpRight /></a>
          </div>
        </div>
        <PartnerOrbit partners={partners} />
      </section>

      <Marquee className="is-inv is-sm" items={[...partners.map((p) => p.name), "Partners", "Native Client"]} speed={28} sep="✦" />

      <section id="all" className="v-section v-wrap">
        <SectionHead index="(01)" label="Featured" title="Our partners" />
        {partners.length === 0 && <p className="text-mute">New partners are on the way.</p>}
        <div className="flex flex-col gap-6">
          {featured.map((p, i) => <PartnerCard key={p.id} partner={p} size="hero" index={i} />)}
        </div>
        {rest.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((p, i) => <PartnerCard key={p.id} partner={p} index={i} />)}
          </div>
        )}
      </section>

      <section id="become-a-partner" className="v-wrap">
        <SectionHead index="(02)" label="Work with us" title="Become a partner" sub="Hosting, servers, creators or brands: if you make Minecraft better, we want to hear from you." />
        <div className="grid gap-px overflow-hidden rounded-[16px] border border-line bg-line lg:grid-cols-3">
          {pitch.map(({ Icon, t, d }) => (
            <div key={t} className="flex min-h-[240px] flex-col bg-bg p-7 sm:p-9">
              <Icon className="h-5 w-5" />
              <span className="mt-auto block pt-10 font-[family-name:var(--font-display)] text-[clamp(1.9rem,2.8vw,2.6rem)] uppercase leading-[0.95]">{t}</span>
              <span className="mt-3 block max-w-[340px] text-[15px] leading-relaxed text-mute">{d}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <p className="flex max-w-[460px] items-center gap-3 text-[16px] leading-relaxed text-mute">
            <Handshake className="h-5 w-5 flex-none" />
            Open a ticket on our Discord and the team will get back to you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <a href={site.discord} target="_blank" rel="noreferrer" className="v-btn is-solid is-lg">Talk to us on Discord</a>
            </Magnetic>
            <Link href="/support" className="v-btn is-lg">Support <ArrowUpRight /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
