import type { Partner } from "@/lib/partners";

/** "native × AUREX": the two marks side by side, on a transparent background. */
export default function Lockup({ partner, size }: { partner: Partner; size?: number }) {
  const actualSize = size ?? (partner.logoSize ? Math.min(64, Math.max(24, Math.round(partner.logoSize * 0.6))) : 30);
  const word = partner.name.replace(/\s+(hosting|host|network|studios?|gg)$/i, "");
  return (
    <span className="np-lockup" style={{ ["--np-size" as string]: `${actualSize}px`, ["--np-accent" as string]: partner.accent, ...(partner.logoBg ? { ["--np-logo-bg" as string]: partner.logoBg } : {}) }}>
      <span className="np-lockup-mark">
        <img src="/brand/icon.png" alt="" width={actualSize} height={actualSize} className="logo-img" />
        <span>native</span>
      </span>
      <span className="np-lockup-x" aria-hidden>×</span>
      <span className={`np-lockup-mark is-partner is-logo-${partner.logoStyle ?? "plain"}`}>
        <img src={partner.logo} alt="" width={actualSize} height={actualSize} />
        {partner.showName !== false && <span>{word}</span>}
      </span>
      <span className="sr-only">Native × {partner.name}</span>
    </span>
  );
}
