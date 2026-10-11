/** An endless ticker of words (CSS only), split by a small separator. */
export default function Marquee({ items, speed = 38, reverse = false, className = "", sep = "✦" }: { items: string[]; speed?: number; reverse?: boolean; className?: string; sep?: string }) {
  const row = (
    <div className="v-marquee-row" aria-hidden>
      {items.map((t, i) => (
        <span key={i} className="v-marquee-item">
          {t}
          <i>{sep}</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`v-marquee ${className}`} style={{ ["--dur" as string]: `${speed}s`, ["--dir" as string]: reverse ? "reverse" : "normal" }}>
      <span className="sr-only">{items.join(", ")}</span>
      <div className="v-marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}
