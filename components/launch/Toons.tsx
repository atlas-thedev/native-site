/**
 * Hand-drawn style cartoon characters for the launch hero. Pure SVG + CSS animation,
 * ink outlines in the site's own black / white palette so they work in both themes.
 * Animations live in globals.css (.toon-*) and stop for prefers-reduced-motion.
 */
type P = { className?: string };
const ink = { stroke: "var(--fg)", strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const paper = "var(--bg)";
const tint = "color-mix(in srgb, var(--fg) 14%, var(--bg))";

/** Nate, the Native cube: bounces on a grass block, waves, blinks, cape flapping. */
export function Mascot({ className }: P) {
  return (
    <svg viewBox="0 0 220 250" className={className} aria-hidden>
      <ellipse className="toon-shadow" cx="110" cy="236" rx="70" ry="7" fill="var(--fg)" opacity=".12" />
      {/* grass block */}
      <g>
        <rect x="40" y="168" width="140" height="62" rx="6" fill={paper} {...ink} />
        <path d="M40 186 V174 a6 6 0 0 1 6 -6 H174 a6 6 0 0 1 6 6 V186 H168 V196 H156 V186 H136 V200 H124 V186 H100 V194 H88 V186 H66 V198 H54 V186 Z" fill="var(--fg)" />
        <rect x="70" y="210" width="10" height="8" fill={tint} />
        <rect x="140" y="206" width="12" height="8" fill={tint} />
        <rect x="110" y="216" width="8" height="6" fill={tint} />
      </g>
      <g className="toon-bounce">
        {/* cape */}
        <path className="toon-cape" d="M70 92 L150 92 L166 176 Q150 168 134 178 Q118 168 102 178 Q86 168 70 176 Z" fill={tint} {...ink} />
        {/* feet */}
        <rect x="78" y="150" width="22" height="16" rx="5" fill={paper} {...ink} />
        <rect x="120" y="150" width="22" height="16" rx="5" fill={paper} {...ink} />
        {/* body */}
        <rect x="60" y="62" width="100" height="96" rx="18" fill={paper} {...ink} />
        {/* left arm */}
        <rect x="44" y="104" width="20" height="34" rx="9" fill={paper} {...ink} />
        {/* waving arm */}
        <g className="toon-wave">
          <rect x="156" y="70" width="20" height="38" rx="9" fill={paper} {...ink} />
        </g>
        {/* face */}
        <g className="toon-blink">
          <rect x="84" y="92" width="11" height="16" rx="5" fill="var(--fg)" />
          <rect x="125" y="92" width="11" height="16" rx="5" fill="var(--fg)" />
          <rect x="87" y="94" width="4" height="5" rx="2" fill={paper} />
          <rect x="128" y="94" width="4" height="5" rx="2" fill={paper} />
        </g>
        <ellipse cx="78" cy="120" rx="8" ry="5" fill={tint} />
        <ellipse cx="142" cy="120" rx="8" ry="5" fill={tint} />
        <path d="M98 120 Q110 134 122 120" fill="none" {...ink} />
        {/* antenna sprout */}
        <path d="M110 62 V44" fill="none" {...ink} />
        <path className="toon-leaf" d="M110 46 Q122 30 136 38 Q124 52 110 46 Z" fill="var(--fg)" />
      </g>
    </svg>
  );
}

/** A slime that hops with squash and stretch. */
export function Slime({ className }: P) {
  return (
    <svg viewBox="0 0 120 130" className={className} aria-hidden>
      <ellipse className="toon-slime-shadow" cx="60" cy="122" rx="34" ry="5" fill="var(--fg)" opacity=".14" />
      <g className="toon-hop">
        <rect x="18" y="44" width="84" height="74" rx="16" fill={tint} {...ink} />
        <rect x="36" y="62" width="48" height="40" rx="8" fill={paper} stroke="var(--fg)" strokeWidth="3" strokeDasharray="6 5" />
        <g className="toon-blink">
          <rect x="42" y="70" width="10" height="12" rx="3" fill="var(--fg)" />
          <rect x="68" y="70" width="10" height="12" rx="3" fill="var(--fg)" />
        </g>
        <rect x="54" y="90" width="12" height="5" rx="2.5" fill="var(--fg)" />
        <rect x="26" y="50" width="12" height="6" rx="3" fill={paper} opacity=".9" />
      </g>
    </svg>
  );
}

/** A blocky rocket warming up for launch day. */
export function Rocket({ className }: P) {
  return (
    <svg viewBox="0 0 160 280" className={className} aria-hidden>
      <g className="toon-smoke">
        <circle cx="60" cy="250" r="14" fill={tint} stroke="var(--fg)" strokeWidth="3" />
        <circle cx="96" cy="256" r="11" fill={tint} stroke="var(--fg)" strokeWidth="3" />
        <circle cx="80" cy="266" r="9" fill={tint} stroke="var(--fg)" strokeWidth="3" />
      </g>
      <g className="toon-hover">
        <g className="toon-flame">
          <path d="M62 196 Q80 262 98 196 Z" fill={paper} {...ink} />
          <path d="M70 198 Q80 236 90 198 Z" fill="var(--fg)" />
        </g>
        {/* fins */}
        <path d="M50 150 L22 194 L54 188 Z" fill="var(--fg)" {...ink} />
        <path d="M110 150 L138 194 L106 188 Z" fill="var(--fg)" {...ink} />
        {/* body */}
        <path d="M80 16 Q118 50 116 120 L112 196 H48 L44 120 Q42 50 80 16 Z" fill={paper} {...ink} />
        <path d="M58 54 Q80 30 102 54" fill="none" stroke="var(--fg)" strokeWidth="3" strokeLinecap="round" />
        {/* window with a tiny pilot */}
        <circle cx="80" cy="100" r="22" fill={tint} {...ink} />
        <rect x="68" y="90" width="24" height="22" rx="6" fill={paper} stroke="var(--fg)" strokeWidth="3" />
        <g className="toon-blink">
          <rect x="73" y="96" width="4" height="7" rx="2" fill="var(--fg)" />
          <rect x="83" y="96" width="4" height="7" rx="2" fill="var(--fg)" />
        </g>
        <rect x="58" y="150" width="44" height="10" rx="3" fill="var(--fg)" />
        <text x="80" y="181" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="800" fontSize="18" fill="var(--fg)">N</text>
      </g>
    </svg>
  );
}

/** A bee buzzing about with flapping wings. */
export function Bee({ className }: P) {
  return (
    <svg viewBox="0 0 80 64" className={className} aria-hidden>
      <g className="toon-wings">
        <ellipse cx="34" cy="16" rx="11" ry="14" fill={paper} {...ink} strokeWidth={3} />
        <ellipse cx="50" cy="18" rx="9" ry="12" fill={paper} {...ink} strokeWidth={3} />
      </g>
      <rect x="14" y="24" width="52" height="32" rx="14" fill={paper} {...ink} strokeWidth={3} />
      <rect x="30" y="25" width="8" height="30" fill="var(--fg)" />
      <rect x="46" y="25" width="8" height="30" fill="var(--fg)" />
      <path d="M66 40 L76 40" {...ink} strokeWidth={3} />
      <rect x="20" y="33" width="5" height="7" rx="2" fill="var(--fg)" />
    </svg>
  );
}

/** A pixel cloud. */
export function Cloud({ className }: P) {
  return (
    <svg viewBox="0 0 120 48" className={className} aria-hidden>
      <path d="M24 44 H104 V36 H116 V24 H96 V12 H72 V4 H44 V16 H28 V28 H8 V44 Z" fill={paper} stroke="var(--fg)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/** A floating pixel diamond. */
export function Gem({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M14 6 H34 L44 18 L24 44 L4 18 Z" fill={tint} {...ink} strokeWidth={3} />
      <path d="M4 18 H44 M14 6 L20 18 L24 44 L28 18 L34 6" fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinejoin="round" />
      <rect x="12" y="10" width="5" height="4" fill={paper} />
    </svg>
  );
}

/** A four point sparkle. */
export function Sparkle({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="var(--fg)" />
    </svg>
  );
}

/** The whole cast, laid out around the countdown. Decorative only. */
export default function ToonScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Cloud className="toon-drift absolute left-[4%] top-[9%] hidden w-[110px] opacity-80 sm:block sm:w-[140px]" />
      <Cloud className="toon-drift-slow absolute right-[6%] top-[5%] hidden w-[120px] opacity-70 sm:block" />
      <Cloud className="toon-drift absolute right-[30%] top-[2%] hidden w-[80px] opacity-50 lg:block [animation-delay:-14s]" />
      <Sparkle className="toon-twinkle absolute left-[18%] top-[30%] w-4" />
      <Sparkle className="toon-twinkle absolute right-[20%] top-[24%] w-5 [animation-delay:-.8s]" />
      <Sparkle className="toon-twinkle absolute left-[42%] top-[6%] hidden w-3 sm:block [animation-delay:-1.6s]" />
      <Sparkle className="toon-twinkle absolute right-[40%] bottom-[18%] hidden w-4 lg:block [animation-delay:-2.2s]" />
      <Gem className="toon-float absolute left-[9%] top-[44%] hidden w-11 lg:block" />
      <Gem className="toon-float absolute right-[11%] top-[48%] hidden w-8 md:block [animation-delay:-2s]" />
      <div className="toon-buzz absolute left-[24%] top-[16%] hidden sm:block">
        <Bee className="w-14" />
      </div>
      <Mascot className="absolute bottom-0 left-[-30px] w-[150px] sm:left-[2%] sm:w-[190px] lg:left-[4%] lg:w-[230px]" />
      <Slime className="absolute bottom-1 left-[22%] hidden w-[78px] md:block lg:left-[19%]" />
      <Rocket className="absolute bottom-0 right-[-24px] w-[110px] sm:right-[3%] sm:w-[140px] lg:right-[6%] lg:w-[170px]" />
    </div>
  );
}
