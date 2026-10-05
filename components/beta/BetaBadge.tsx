/** The Super Beta Tester badge with a slow sheen and a few drifting sparks. */
export default function BetaBadge({ size = 40, still = false, className = "" }: { size?: number; still?: boolean; className?: string }) {
  return (
    <span className={`beta-badge ${still ? "is-still" : ""} ${className}`} style={{ width: size, height: size }} role="img" aria-label="Super Beta Tester badge">
      <img src="/badges/super-beta-tester.png" alt="" width={size} height={size} className="beta-badge-img" draggable={false} />
      <span className="beta-badge-sheen" aria-hidden />
      {!still && size >= 56 && (
        <span aria-hidden>
          <i className="beta-spark" style={{ left: "8%", top: "26%", animationDelay: "-0.4s" }} />
          <i className="beta-spark" style={{ right: "4%", top: "14%", animationDelay: "-1.6s" }} />
          <i className="beta-spark" style={{ right: "10%", bottom: "18%", animationDelay: "-2.5s" }} />
        </span>
      )}
    </span>
  );
}
