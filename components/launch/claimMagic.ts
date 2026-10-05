"use client";

/**
 * The founder-cape claim moment: the page dims, the cape starts to glow, a little light gathers,
 * pops out and floats along a curved path, trailing fairy dust, to your name in the navbar,
 * which lights up when it lands. Then the darkness lifts.
 *
 * Pure canvas + rAF, no deps. Stays in the site's black / white palette (white light on darkness).
 */

type Opts = {
  /** Shown under the cape while the light gathers, e.g. "Toon Blaze is yours". */
  caption?: string;
  /** Called the moment the light reaches the navbar (swap the UI to "claimed" here). */
  onArrive?: () => void;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; star: boolean; spin: number; rot: number; twinkle: number };
type Ring = { x: number; y: number; t: number; max: number; r: number };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

function visibleTarget(): Element | null {
  const all = Array.from(document.querySelectorAll("[data-claim-target]"));
  return all.find((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  }) ?? null;
}

const center = (el: Element | null, fallback: { x: number; y: number }) => {
  if (!el) return { ...fallback, w: 60, h: 40 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
};

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.quadraticCurveTo(Math.cos(a - Math.PI / 4) * s * 0.18, Math.sin(a - Math.PI / 4) * s * 0.18, Math.cos(a) * s, Math.sin(a) * s);
  }
  ctx.quadraticCurveTo(Math.cos(-Math.PI / 4) * s * 0.18, Math.sin(-Math.PI / 4) * s * 0.18, s, 0);
  ctx.fill();
  ctx.restore();
}

export function playClaimMagic(from: Element | null, opts: Opts = {}): Promise<void> {
  return new Promise((resolve) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glowTarget = () => {
      const t = visibleTarget();
      if (!t) return;
      t.classList.remove("claim-glow");
      void (t as HTMLElement).offsetWidth;
      t.classList.add("claim-glow");
      window.setTimeout(() => t.classList.remove("claim-glow"), 2600);
    };
    if (reduce || !from) {
      opts.onArrive?.();
      glowTarget();
      window.dispatchEvent(new CustomEvent("native:claimed"));
      return resolve();
    }

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", zIndex: "2147483000", pointerEvents: "auto", cursor: "default" });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    // Timeline (ms)
    const DIM = 650, CHARGE_END = 1750, FLY_END = 3350, LIFT_START = 3700, END = 4700;
    const parts: Particle[] = [];
    const rings: Ring[] = [];
    let arrived = false;
    let popped = false;
    let lastSpawn = 0;
    const t0 = performance.now();
    let prev = t0;
    let orb = { x: 0, y: 0 };
    let path: { a: { x: number; y: number }; c1: { x: number; y: number }; c2: { x: number; y: number }; b: { x: number; y: number } } | null = null;

    const spawn = (x: number, y: number, n: number, spread: number, speed: number, up = 0) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.35 + Math.random() * 0.65);
        parts.push({
          x: x + (Math.random() - 0.5) * spread, y: y + (Math.random() - 0.5) * spread,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v - up,
          life: 0, max: 0.7 + Math.random() * 1.1, size: 1 + Math.random() * 2.6,
          star: Math.random() < 0.38, spin: (Math.random() - 0.5) * 6, rot: Math.random() * 6, twinkle: Math.random() * 10,
        });
      }
    };

    const bez = (t: number) => {
      const p = path!;
      const u = 1 - t;
      return {
        x: u * u * u * p.a.x + 3 * u * u * t * p.c1.x + 3 * u * t * t * p.c2.x + t * t * t * p.b.x,
        y: u * u * u * p.a.y + 3 * u * u * t * p.c1.y + 3 * u * t * t * p.c2.y + t * t * t * p.b.y,
      };
    };

    const hole = (x: number, y: number, r: number, strength: number) => {
      if (r <= 0 || strength <= 0) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${strength})`);
      g.addColorStop(0.55, `rgba(0,0,0,${strength * 0.7})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };
    const halo = (x: number, y: number, r: number, a: number) => {
      if (r <= 0 || a <= 0) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.25, `rgba(255,255,255,${a * 0.45})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(safety);
      window.removeEventListener("resize", size);
      html.style.overflow = prevOverflow;
      canvas.remove();
      if (!arrived) { arrived = true; glowTarget(); opts.onArrive?.(); window.dispatchEvent(new CustomEvent("native:claimed")); }
      resolve();
    };
    const frame = (now: number) => {
      if (done) return;
      try { step(now); } catch (e) { console.error(e); finish(); }
    };
    const step = (now: number) => {
      const ms = now - t0;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const src = center(from, { x: W / 2, y: H / 2 });
      const dst = center(visibleTarget(), { x: W - 70, y: 36 });

      // darkness: in, hold, out
      const dark = 0.84 * easeOut(seg(ms, 0, DIM)) * (1 - easeInOut(seg(ms, LIFT_START, END)));
      const charge = easeInOut(seg(ms, DIM * 0.6, CHARGE_END));
      const fly = easeInOut(seg(ms, CHARGE_END, FLY_END));

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = `rgba(0,0,0,${dark})`;
      ctx.fillRect(0, 0, W, H);

      // light holes: the cape stays lit, the travelling light lights up what it passes, the name glows on arrival
      ctx.globalCompositeOperation = "destination-out";
      const capeR = Math.max(src.w, src.h) * (0.75 + charge * 0.25);
      hole(src.x, src.y, capeR, 0.95 * (1 - fly * 0.85));
      if (ms > CHARGE_END) {
        if (!path) {
          const a = { x: src.x, y: src.y };
          const b = { x: dst.x, y: dst.y };
          const lift = Math.min(260, Math.max(120, Math.abs(a.y - b.y) * 0.5));
          path = { a, c1: { x: a.x - (b.x - a.x) * 0.35, y: a.y - lift }, c2: { x: b.x + (a.x - b.x) * 0.15 - 40, y: b.y + lift * 1.3 }, b };
        }
        path.b = { x: dst.x, y: dst.y };
        orb = bez(fly);
        hole(orb.x, orb.y, 150, 0.55 * (arrived ? 0 : 1));
      }
      const landed = seg(ms, FLY_END, FLY_END + 500);
      if (ms > FLY_END) hole(dst.x, dst.y, Math.max(dst.w, 60) * (0.9 + easeOut(landed) * 0.6), 0.95);

      // light
      ctx.globalCompositeOperation = "lighter";
      // charging glow + spiralling motes on the cape
      if (ms < CHARGE_END + 200) {
        const pulse = 0.5 + 0.5 * Math.sin(ms / 90);
        halo(src.x, src.y, capeR * (0.6 + charge * 0.7), 0.18 + charge * (0.45 + pulse * 0.15));
        if (ms > DIM * 0.5 && ms < CHARGE_END && now - lastSpawn > 28) {
          lastSpawn = now;
          const a = Math.random() * Math.PI * 2;
          const r = capeR * (0.9 + Math.random() * 0.5);
          parts.push({ x: src.x + Math.cos(a) * r, y: src.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 1.4 + Math.sin(a) * 60, vy: -Math.sin(a) * r * 1.4 - Math.cos(a) * 60, life: 0, max: 0.6, size: 1.2 + Math.random() * 1.6, star: Math.random() < 0.3, spin: 3, rot: a, twinkle: Math.random() * 10 });
        }
      }
      // pop
      if (ms > CHARGE_END && !popped) {
        popped = true;
        rings.push({ x: src.x, y: src.y, t: 0, max: 0.7, r: capeR * 1.4 });
        spawn(src.x, src.y, 46, 10, 260, 40);
      }
      // the travelling light + fairy dust
      if (path && !arrived) {
        const k = 1 - Math.abs(fly - 0.5) * 2; // strongest mid-flight
        const pop = easeOut(seg(ms, CHARGE_END, CHARGE_END + 260));
        halo(orb.x, orb.y, 70 + k * 30, 0.55 * pop);
        halo(orb.x, orb.y, 16, 1 * pop);
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.beginPath(); ctx.arc(orb.x, orb.y, Math.max(0, pop * (4.5 + Math.sin(ms / 60) * 0.6)), 0, Math.PI * 2); ctx.fill();
        // dust: more mid-flight, drifting down with gravity
        const n = 2 + Math.round(k * 4);
        for (let i = 0; i < n; i++) {
          parts.push({ x: orb.x + (Math.random() - 0.5) * 10, y: orb.y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 40 + 10, life: 0, max: 0.8 + Math.random() * 1.2, size: 0.8 + Math.random() * 2.4, star: Math.random() < 0.3, spin: (Math.random() - 0.5) * 6, rot: Math.random() * 6, twinkle: Math.random() * 10 });
        }
        if (ms >= FLY_END) {
          arrived = true;
          rings.push({ x: dst.x, y: dst.y, t: 0, max: 0.9, r: Math.max(90, dst.w * 1.3) });
          rings.push({ x: dst.x, y: dst.y, t: -0.12, max: 0.9, r: Math.max(140, dst.w * 1.9) });
          spawn(dst.x, dst.y, 70, 8, 320, 30);
          glowTarget();
          opts.onArrive?.();
          window.dispatchEvent(new CustomEvent("native:claimed"));
        }
      }
      if (arrived) halo(dst.x, dst.y, Math.max(dst.w, 70) * 1.2, 0.5 * (1 - landed) + 0.12);

      // rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.t += dt;
        const p = clamp01(r.t / r.max);
        if (r.t < 0) continue;
        ctx.strokeStyle = `rgba(255,255,255,${(1 - p) * 0.8})`;
        ctx.lineWidth = 2.5 * (1 - p) + 0.5;
        ctx.beginPath(); ctx.arc(r.x, r.y, Math.max(0, r.r * easeOut(p)), 0, Math.PI * 2); ctx.stroke();
        if (p >= 1) rings.splice(i, 1);
      }
      // particles
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life >= p.max) { parts.splice(i, 1); continue; }
        p.vx *= Math.pow(0.18, dt); p.vy = p.vy * Math.pow(0.18, dt) + 70 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
        const fade = 1 - p.life / p.max;
        const tw = 0.55 + 0.45 * Math.sin(p.twinkle + p.life * 14);
        ctx.fillStyle = `rgba(255,255,255,${fade * tw})`;
        if (p.star) drawStar(ctx, p.x, p.y, p.size * 2.6, p.rot);
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2); ctx.fill(); }
      }

      // caption
      if (opts.caption) {
        const a = seg(ms, DIM, DIM + 400) * (1 - seg(ms, CHARGE_END + 600, CHARGE_END + 1200));
        if (a > 0) {
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.font = `800 22px ${getComputedStyle(document.body).fontFamily || "system-ui, sans-serif"}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const y = Math.min(H - 40, src.y + capeR + 18) + (1 - a) * 8;
          ctx.fillText(opts.caption, src.x, y);
        }
      }

      if (ms < END || parts.length) requestAnimationFrame(frame);
      else finish();
    };
    const safety = window.setTimeout(finish, 9000);
    requestAnimationFrame(frame);
  });
}
