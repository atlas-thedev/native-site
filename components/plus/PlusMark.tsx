/** The Native N with the gold Native+ plus, as shown in the launcher. */
export default function PlusMark({ size = 56, className = "" }: { size?: number; className?: string }) {
  const plus = Math.round(size * 0.42);
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }} aria-label="Native+" role="img">
      <span className="logo-mark absolute inset-0 text-fg" style={{ width: size * 0.86, height: size * 0.86, top: size * 0.14 }} />
      <span
        className="plus-gold absolute right-0 top-0 grid place-items-center rounded-[28%] font-black leading-none"
        style={{ width: plus, height: plus, fontSize: plus * 0.9, boxShadow: `0 0 0 ${Math.max(2, size / 24)}px var(--bg)` }}
      >
        +
      </span>
    </span>
  );
}
