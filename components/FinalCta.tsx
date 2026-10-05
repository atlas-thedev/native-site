"use client";

import Button from "./Button";
import SplitText from "./SplitText";
import Reveal from "./Reveal";
import { Apple, Linux, Windows } from "./icons";
import { site } from "@/lib/site";
import { useLaunch } from "./launch/LaunchContext";

export default function FinalCta() {
  const { launch } = useLaunch();
  const pre = launch.lockDownloads;
  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-24 pt-8">
      <div className="dots rounded-[28px] border border-line px-6 py-20 text-center sm:py-24">
        <span className="logo-mark mx-auto mb-8 block h-14 w-14" aria-hidden />
        <SplitText
          text={pre ? "Be there on day one" : "Start using Native today"}
          className="mx-auto max-w-[900px] text-balance text-[clamp(2.6rem,6.4vw,5.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em]"
        />
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-[520px] text-lg text-mute">{pre ? "Make your free account now and grab a founder cape before launch." : "Free to download. Built for Windows, macOS and Linux."}</p>
        </Reveal>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={pre ? "/register?next=/founder" : "/download"} size="lg">{pre ? "Create your account" : "Get started"}</Button>
          <Button href={site.discord} variant="ghost" size="lg" external>Join the Discord</Button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-4 text-dim">
          <Windows className="h-5 w-5" /> <Apple className="h-5 w-5" /> <Linux className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
