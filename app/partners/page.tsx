import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import Lockup from "@/components/partners/Lockup";
import { getPartners } from "@/lib/server/partners";
import { storyFor } from "@/lib/partners";
import { breadcrumb, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 60;
export const metadata = pageMeta({
  title: "Partners",
  description: "Native Client has partnered with Aurex Hosting, Sri Lanka’s #1 game hosting provider. Minecraft servers from LKR 400 a month, around 60 ms from Colombo.",
  path: "/partners",
});

export default async function PartnersPage() {
  const partners = await getPartners();
  const partner = partners.find((p) => p.tier === "featured") ?? partners[0];
  const others = partners.filter((p) => p.id !== partner?.id);

  if (!partner) {
    return (
      <div className="np-page v-wrap">
        <section className="np-hero">
          <h1 className="np-h1">Partners</h1>
          <p className="np-lead">New partners are on the way.</p>
        </section>
      </div>
    );
  }

  const story = storyFor(partner);
  const style = {
    ["--np-accent" as string]: partner.accent,
    ["--np-accent-2" as string]: partner.accent2,
    ...(partner.buttonColor ? { ["--np-btn" as string]: partner.buttonColor } : {}),
    ...(partner.buttonText ? { ["--np-btn-text" as string]: partner.buttonText } : {}),
  };

  return (
    <div className="np-page" style={style}>
      <JsonLd data={breadcrumb([{ name: "Partners", path: "/partners" }])} />

      {/* Hero */}
      <section className="np-hero v-wrap">
        <Reveal blur={false} y={12}>
          <Lockup partner={partner} />
        </Reveal>
        <div className="np-hero-grid">
          <Reveal blur={false} delay={0.05}>
            <h1 className="np-h1">
              {story.headline[0]}
              <span className="np-accent">{story.headline[1]}</span>
            </h1>
          </Reveal>
          <Reveal blur={false} delay={0.15} className="np-hero-side">
            <p className="np-lead">{story.intro}</p>
            <div className="np-actions">
              <a href={partner.website} target="_blank" rel="noopener sponsored" className={`np-btn np-pbtn is-${partner.buttonStyle ?? "gradient"}`}>
                {story.cta} <ArrowUpRight className="h-4 w-4" />
              </a>
              {partner.button2Label && partner.button2Url && (
                <a href={partner.button2Url} target="_blank" rel="noopener sponsored" className="np-btn">
                  {partner.button2Label} <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              <Link href="/download" className="np-btn">Download Native</Link>
            </div>
            {story.note && <p className="np-note">{story.note}</p>}
          </Reveal>
        </div>
        {story.heroImage && (
          <Reveal y={30} delay={0.2}>
            <div className="np-shot">
              <img src={story.heroImage} alt={partner.name} />
              {!story.heroImage.includes("banner") && (
                <div className="np-shot-over">
                  <Lockup partner={partner} size={64} />
                  {partner.tagline && <p>{partner.tagline}</p>}
                </div>
              )}
            </div>
          </Reveal>
        )}
      </section>

      {/* Split */}
      {story.split.body && (
        <section className="np-section v-wrap">
          <div className="np-split">
            {story.split.image && <img className="np-split-bg" src={story.split.image} alt="" aria-hidden />}
            <h2 className="np-h2">{story.split.title}</h2>
            <p className="np-body">{story.split.body}</p>
          </div>
        </section>
      )}

      {/* Features */}
      {story.features.items.length > 0 && (
        <section className="np-section v-wrap">
          <h2 className="np-h2">{story.features.title}</h2>
          <div className="np-features">
            {story.features.items.map((item, i) => (
              <Reveal key={item.title} blur={false} y={16} delay={i * 0.06} className="np-feature">
                <span className="np-feature-tick"><Check className="h-3.5 w-3.5" /></span>
                <h3>{item.title}</h3>
                {item.body && <p>{item.body}</p>}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Media rows */}
      {story.rows.map((row, i) => (
        <section key={row.title} className="np-section v-wrap">
          <div className={`np-row ${i % 2 ? "is-flip" : ""}`}>
            <Reveal y={20} className="np-row-media">
              <img src={row.image} alt="" />
            </Reveal>
            <div className="np-row-copy">
              <h2 className="np-h2">{row.title}</h2>
              <p className="np-body">{row.body}</p>
            </div>
          </div>
        </section>
      ))}

      {/* FAQ */}
      {story.faq.length > 0 && (
        <section className="np-section v-wrap">
          <div className="np-split is-top">
            <h2 className="np-h2">FAQ</h2>
            <div className="np-faq">
              {story.faq.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}<Plus className="h-4 w-4" /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* More partners */}
      {others.length > 0 && (
        <section className="np-section v-wrap">
          <h2 className="np-h2">More partners</h2>
          <div className="np-list">
            {others.map((p) => (
              <a key={p.id} href={p.website} target="_blank" rel="noopener sponsored" className="np-list-row">
                <img src={p.logo} alt="" className={`is-logo-${p.logoStyle ?? "plain"}`} style={{ ...(p.logoSize ? { width: Math.min(64, p.logoSize), height: Math.min(64, p.logoSize) } : {}), ...(p.logoBg ? { ["--np-logo-bg" as string]: p.logoBg } : {}) }} />
                <span><strong>{p.name}</strong><small>{p.tagline}</small></span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Become a partner */}
      <section id="become-a-partner" className="np-section v-wrap">
        <div className="np-split">
          <h2 className="np-h2">Work with Native.</h2>
          <div>
            <p className="np-body">Hosting, servers, creators or brands: if you make Minecraft better, we’d like to hear from you. Open a ticket on our Discord and the team will get back to you.</p>
            <div className="np-actions mt-6">
              <a href={site.discord} target="_blank" rel="noreferrer" className="np-btn is-solid">Talk to us on Discord</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
