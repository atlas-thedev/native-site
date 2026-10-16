import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Partner } from "@/lib/partners";

/** A full-width band under the hero, in the partner's colours: "native × AUREX · Official partner". */
export default function PartnerStripe({ partner }: { partner: Partner | null }) {
  if (!partner) return null;
  const word = partner.name.replace(/\s+(hosting|host|network|studios?|gg)$/i, "");
  const note = partner.perks.find((p) => /lkr|\$|from/i.test(p));
  return (
    <section className="np-stripe" style={{ ["--np-accent" as string]: partner.accent, ["--np-accent-2" as string]: partner.accent2 }} aria-label={`Official partner: ${partner.name}`}>
      <div className="np-stripe-inner v-wrap">
        <div className="np-stripe-lockup">
          <span className="np-stripe-native">
            <img src="/brand/icon.png" alt="" width={40} height={40} />
            <span>NATIVE</span>
          </span>
          <span className="np-stripe-x" aria-hidden>×</span>
          <span className="np-stripe-partner">
            <span className="np-stripe-logo" aria-hidden>
              <i className="np-ring" />
              <i className="np-ring is-2" />
              <i className="np-glow" />
              <b className="np-stripe-chip">
                <img src={partner.logo} alt="" width={34} height={34} />
              </b>
            </span>
            <span>{word}</span>
          </span>
        </div>
        <div className="np-stripe-copy">
          <span className="np-stripe-label">Official partner</span>
          <p>{partner.tagline}{note ? ` Servers ${note.replace(/^from/i, "from")}.` : ""}</p>
        </div>
        <div className="np-stripe-actions">
          <a href={partner.website} target="_blank" rel="noopener sponsored" className="np-stripe-btn is-solid">
            {partner.cta || "Visit"} <ArrowUpRight className="h-4 w-4" />
          </a>
          <Link href="/partners" className="np-stripe-btn">Learn more</Link>
        </div>
      </div>
    </section>
  );
}
