import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionHead from "@/components/v2/SectionHead";
import Marquee from "@/components/v2/Marquee";
import PartnerCard from "./PartnerCard";
import type { Partner } from "@/lib/partners";

/** Home page: the spotlight partner card, a ticker of every partner and a link to /partners. */
export default function PartnersSection({ partners, index }: { partners: Partner[]; index: string }) {
  if (!partners.length) return null;
  const spotlight = partners.find((p) => p.tier === "featured") ?? partners[0];
  const others = partners.filter((p) => p.id !== spotlight.id).slice(0, 2);
  return (
    <section id="partners" className="v-section !pt-0">
      <div className="v-wrap">
        <SectionHead
          index={index}
          label="Partners"
          title="Built with friends"
          sub="The hosts, servers and creators who help keep Native fast and free."
        />
        <PartnerCard partner={spotlight} size="hero" />
        {others.length > 0 && (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {others.map((p, i) => <PartnerCard key={p.id} partner={p} index={i + 1} />)}
          </div>
        )}
        <div className="mt-8 flex justify-end">
          <Link href="/partners" className="v-btn">All partners <ArrowUpRight /></Link>
        </div>
      </div>
      {partners.length > 0 && (
        <Marquee
          className="is-outline is-sm mt-[clamp(48px,6vw,90px)]"
          items={[...partners.map((p) => p.name), "Native Client", "Partner with us"]}
          speed={30}
        />
      )}
    </section>
  );
}
