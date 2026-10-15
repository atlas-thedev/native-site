import type { Partner } from "@/lib/partners";

/** "native × AUREX": the two marks side by side, on a transparent background. */
export default function Lockup({ partner, size = 30 }: { partner: Partner; size?: number }) {
  const word = partner.name.replace(/\s+(hosting|host|network|studios?|gg)$/i, "");
  return (
    <span className="np-lockup" style={{ ["--np-size" as string]: `${size}px`, ["--np-accent" as string]: partner.accent }}>
      <span className="np-lockup-mark">
        <img src="/brand/icon.png" alt="" width={size} height={size} className="logo-img" />
        <span>native</span>
      </span>
      <span className="np-lockup-x" aria-hidden>×</span>
      <span className="np-lockup-mark is-partner">
        <img src={partner.logo} alt="" width={size} height={size} />
        <span>{word}</span>
      </span>
      <span className="sr-only">Native × {partner.name}</span>
    </span>
  );
}
