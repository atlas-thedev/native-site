"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import SkinViewer from "./SkinViewer";
import { Discord } from "./icons";
import { site } from "@/lib/site";

const skins = [
  { id: "steve", name: "Steve", src: "/skins/steve.png" },
  { id: "alex", name: "Alex", src: "/skins/alex.png" },
  { id: "steve3", name: "Scout", src: "/skins/steve3.png" },
];
const capes = [
  { id: "none", name: "No cape", src: null },
  { id: "founders", name: "Founders", src: "/capes/founders.png" },
  { id: "cherry", name: "Cherry", src: "/capes/cherry-blossom.png" },
  { id: "heart", name: "Heart", src: "/capes/purple-heart.png" },
];

function LockerCard() {
  const [skin, setSkin] = useState(skins[0]);
  const [cape, setCape] = useState(capes[1]);
  return (
    <div className="card flex h-full flex-col p-8">
      <div className="grid flex-1 items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="order-2 sm:order-1">
          <h3 className="text-[26px] font-extrabold tracking-tight">A locker for your look</h3>
          <p className="mt-3 max-w-[340px] text-[15.5px] leading-relaxed text-mute">
            Preview any skin and cape in 3D before you wear it. Keep a wardrobe of favourites that follows your account.
          </p>
          <p className="eyebrow mt-6">Skin</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {skins.map((s) => (
              <button key={s.id} onClick={() => setSkin(s)} className={`rounded-full border px-4 py-1.5 text-[13.5px] font-medium transition ${skin.id === s.id ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`}>
                {s.name}
              </button>
            ))}
          </div>
          <p className="eyebrow mt-5">Cape</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {capes.map((c) => (
              <button key={c.id} onClick={() => setCape(c)} className={`rounded-full border px-4 py-1.5 text-[13.5px] font-medium transition ${cape.id === c.id ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="order-1 flex justify-center sm:order-2">
          <SkinViewer skin={skin.src} cape={cape.src} width={250} height={380} className="cutout-sm" />
        </div>
      </div>
    </div>
  );
}

const convo = [
  { me: false, who: "mira", t: "found a new modpack, want in?" },
  { me: true, who: "you", t: "send it over" },
  { me: false, who: "mira", t: "joining NovaDrift on 1.21.4" },
  { me: true, who: "you", t: "on my way" },
];

function RelayCard() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v >= convo.length ? 1 : v + 1)), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="card flex h-full flex-col p-8">
      <div className="dots flex min-h-[210px] flex-1 flex-col justify-end gap-2.5 rounded-2xl border border-line p-5">
        <AnimatePresence initial={false}>
          {convo.slice(0, n).map((m, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[14.5px] ${m.me ? "self-end bg-inv text-inv-fg" : "self-start border border-line bg-bg text-fg"}`}
            >
              {m.t}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <h3 className="mt-7 text-[26px] font-extrabold tracking-tight">Friends, built in</h3>
      <p className="mt-3 text-[15.5px] leading-relaxed text-mute">
        Relay brings friends, direct messages and group chats into the launcher, with presence that shows who is playing what.
      </p>
      <a href={site.discord} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full border border-line px-5 text-[15px] font-semibold transition hover:bg-surface-2">
        <Discord className="h-[18px] w-[18px]" /> Join our Discord <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

export default function Community() {
  return (
    <section id="community" className="mx-auto max-w-[1280px] px-5 py-16">
      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal blur={false}><LockerCard /></Reveal>
        <Reveal blur={false} delay={0.1}><RelayCard /></Reveal>
      </div>
    </section>
  );
}
