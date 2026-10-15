"use client";

import { motion, useReducedMotion } from "motion/react";
import NativeGlyph from "@/components/NativeGlyph";
import type { Partner } from "@/lib/partners";

/** Native in the middle, every partner's logo riding a ring around it. */
export default function PartnerOrbit({ partners }: { partners: Partner[] }) {
  const reduce = useReducedMotion();
  const logos = partners.length ? partners : [];
  const ring = (radius: number, list: Partner[], duration: number, reverse = false) => (
    <motion.div
      className="np-orbit-ring"
      style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius }}
      animate={reduce ? undefined : { rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {list.map((p, i) => {
        const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <motion.a
            key={p.id}
            href={p.website}
            target="_blank"
            rel="noopener sponsored"
            aria-label={p.name}
            className="np-orbit-logo"
            style={{ left: radius + Math.cos(angle) * radius, top: radius + Math.sin(angle) * radius, ["--np-accent" as string]: p.accent }}
            animate={reduce ? undefined : { rotate: reverse ? 360 : -360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
            whileHover={{ scale: 1.18 }}
          >
            <img src={p.logo} alt="" />
          </motion.a>
        );
      })}
    </motion.div>
  );
  const inner = logos.filter((_, i) => i % 2 === 0);
  const outer = logos.filter((_, i) => i % 2 === 1);
  return (
    <div className="np-orbit" aria-hidden={!logos.length}>
      <div className="np-orbit-stage">
      <div className="np-orbit-glow" style={{ ["--np-accent" as string]: logos[0]?.accent ?? "#ffffff" }} />
      <span className="np-orbit-track" style={{ width: 300, height: 300, marginLeft: -150, marginTop: -150 }} />
      <span className="np-orbit-track" style={{ width: 480, height: 480, marginLeft: -240, marginTop: -240 }} />
      {ring(150, inner, 26)}
      {outer.length > 0 && ring(240, outer, 40, true)}
      <motion.span
        className="np-orbit-core"
        initial={reduce ? false : { scale: 0.4, opacity: 0, rotate: -45 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.2 }}
      >
        <NativeGlyph className="h-12 w-12" />
      </motion.span>
      </div>
    </div>
  );
}
