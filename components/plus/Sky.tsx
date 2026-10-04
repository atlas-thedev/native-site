const CLOUDS = [
  { size: 11, left: "4%", top: 70, delay: -14, dur: 90 },
  { size: 16, left: "28%", top: 26, delay: -52, dur: 120 },
  { size: 9, left: "52%", top: 120, delay: -33, dur: 80 },
  { size: 14, left: "72%", top: 46, delay: -6, dur: 105 },
  { size: 10, left: "90%", top: 150, delay: -71, dur: 95 },
];

/** Pixel clouds drifting over a slanted ground stripe — same as the launcher Store. */
export default function Sky() {
  return (
    <div className="sky pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {CLOUDS.map((c, i) => (
        <span key={i} className="sky-cloud" style={{ fontSize: c.size, left: c.left, top: c.top, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }} />
      ))}
      <svg className="sky-ground" viewBox="0 0 1200 112" preserveAspectRatio="none">
        <polygon points="0,4 1200,74 1200,90 0,20" className="is-top" />
        <polygon points="0,20 1200,90 1200,96 0,26" className="is-edge" />
        <polygon points="0,26 1200,96 1200,112 0,112" className="is-base" />
      </svg>
    </div>
  );
}
