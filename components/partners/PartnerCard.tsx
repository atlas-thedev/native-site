"use client";

import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowUpRight, Check, Copy, Sparkles } from "lucide-react";
import type { Partner } from "@/lib/partners";

const TIER = { featured: "Featured partner", partner: "Partner", sponsor: "Sponsor" } as const;

/** The background motion layer for a preset (all CSS, tuned by --np-speed / --np-intensity). */
function Motion({ animation }: { animation: Partner["animation"] }) {
  if (animation === "none") return null;
  return (
    <div className={`np-motion np-motion-${animation}`} aria-hidden>
      {animation === "aurora" && (<><i /><i /><i /></>)}
      {animation === "orbit" && (<><i /><i /><b /><b /><b /></>)}
      {animation === "glitch" && (<><i /><i /></>)}
      {animation === "float" && Array.from({ length: 16 }, (_, n) => <i key={n} style={{ ["--n" as string]: n }} />)}
      {animation === "shine" && <i />}
      {animation === "pulse" && (<><i /><i /><i /></>)}
      {animation === "grid" && (<><i /><b /></>)}
    </div>
  );
}

/**
 * One partner as a living card: its own colours and motion preset, a 3D tilt and
 * parallax art that follow the pointer, and a spotlight under the cursor.
 */
export default function PartnerCard({ partner, size = "tile", index = 0 }: { partner: Partner; size?: "hero" | "tile"; index?: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const tilt = size === "hero" ? 5 : 9;
  const rx = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), spring);
  const artX = useSpring(useTransform(px, [0, 1], [-26, 26]), spring);
  const artY = useSpring(useTransform(py, [0, 1], [-18, 18]), spring);
  const bgX = useSpring(useTransform(px, [0, 1], [12, -12]), spring);
  const bgY = useSpring(useTransform(py, [0, 1], [8, -8]), spring);
  const mx = useTransform(px, (v) => `${v * 100}%`);
  const my = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(520px circle at ${mx} ${my}, rgba(255,255,255,0.11), transparent 45%)`;

  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const leave = () => { px.set(0.5); py.set(0.5); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(partner.code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* blocked */ }
  };

  const style = {
    ["--np-accent" as string]: partner.accent,
    ["--np-accent2" as string]: partner.accent2,
    ["--np-speed" as string]: String(partner.speed || 1),
    ["--np-intensity" as string]: String((partner.intensity ?? 60) / 100),
  } as React.CSSProperties;
  const perks = partner.perks.slice(0, size === "hero" ? 6 : 3);

  return (
    <motion.article
      ref={ref}
      className={`np-card is-${size} np-anim-${partner.animation}`}
      style={style}
      onPointerMove={move}
      onPointerLeave={leave}
      initial={reduce ? false : { opacity: 0, y: 48, scale: 0.97, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div className="np-inner" style={{ rotateX: rx, rotateY: ry }}>
        {partner.background && (
          <motion.img className="np-bg" src={partner.background} alt="" draggable={false} style={{ x: bgX, y: bgY }} />
        )}
        <div className="np-shade" />
        <Motion animation={partner.animation} />
        <motion.div className="np-glare" style={{ background: glare }} />
        {partner.art && (
          <motion.div className="np-art" style={{ x: artX, y: artY }}>
            <img src={partner.art} alt="" draggable={false} />
          </motion.div>
        )}

        <div className="np-content">
          <div className="np-id">
            <motion.span
              className="np-logo"
              initial={reduce ? false : { rotate: -18, scale: 0.6, opacity: 0 }}
              whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.25 + index * 0.12 }}
            >
              {partner.logo ? <img src={partner.logo} alt={`${partner.name} logo`} /> : <Sparkles className="h-5 w-5" />}
            </motion.span>
            <span className="np-tier">{TIER[partner.tier]}</span>
          </div>
          <h3 className="np-name">{partner.name}</h3>
          {partner.tagline && <p className="np-tagline">{partner.tagline}</p>}
          {size === "hero" && partner.description && <p className="np-desc">{partner.description}</p>}
          {perks.length > 0 && (
            <ul className="np-perks">
              {perks.map((perk, i) => (
                <motion.li
                  key={perk}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.07 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {perk}
                </motion.li>
              ))}
            </ul>
          )}
          <div className="np-actions">
            <a href={partner.website} target="_blank" rel="noopener sponsored" className="np-cta">
              <span>{partner.cta || "Visit"}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
            {partner.code && (
              <button type="button" onClick={copy} className={`np-code ${copied ? "is-copied" : ""}`} title="Copy code">
                <span>Code</span>
                <strong>{partner.code}</strong>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
