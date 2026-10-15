import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Lockup from "./Lockup";
import Reveal from "@/components/Reveal";
import type { Partner } from "@/lib/partners";

/** Home page: one quiet, transparent banner announcing the partnership. */
export default function PartnersSection({ partners }: { partners: Partner[] }) {
  const partner = partners.find((p) => p.tier === "featured") ?? partners[0];
  if (!partner) return null;
  return (
    <section id="partners" className="v-wrap pb-[clamp(60px,8vw,120px)]">
      <Reveal blur={false} y={16}>
        <div className="np-banner" style={{ ["--np-accent" as string]: partner.accent }}>
          <div className="np-banner-copy">
            <Lockup partner={partner} size={26} />
            <p className="np-banner-title">
              We’ve partnered with <span className="np-accent">{partner.name}</span>
            </p>
            <p className="np-banner-sub">{partner.tagline} {partner.perks.slice(-1)[0] ? `${partner.perks.slice(-1)[0]}.` : ""}</p>
          </div>
          <div className="np-banner-actions">
            <Link href="/partners" className="np-btn is-solid">Learn more</Link>
            <a href={partner.website} target="_blank" rel="noopener sponsored" className="np-btn">
              Visit {partner.name.split(" ")[0]} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
