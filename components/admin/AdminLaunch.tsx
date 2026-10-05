"use client";

import { Rocket, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { Shared } from "./AdminApp";
import CapePicker from "./CapePicker";
import Countdown from "../launch/Countdown";
import { Btn, Field, Panel, Toggle, adm, fromLocalInput, input, textarea, toLocalInput, useAction } from "./ui";
import type { SiteDoc, Settings } from "./types";

export default function AdminLaunch({ doc, setDoc, items }: Shared) {
  const [l, setL] = useState<Settings["launch"] | null>(doc?.settings.launch ?? null);
  const { busy, run } = useAction();
  useEffect(() => setL(doc?.settings.launch ?? null), [doc]);
  if (!l || !doc) return null;
  const set = <K extends keyof Settings["launch"]>(k: K, v: Settings["launch"][K]) => setL({ ...l, [k]: v });
  const save = (patch: Partial<Settings["launch"]>, key: string, ok: string) => run(key, async () => setDoc(await adm<SiteDoc>("POST", "site", { launch: patch })), ok);
  const dirty = JSON.stringify(l) !== JSON.stringify(doc.settings.launch);
  const live = doc.config.launch;
  const sellable = items.filter((i) => !i.exclusive);

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Launch status" sub={live.prelaunch ? "The site is in pre-launch mode: countdown hero, sign-ups and founder capes." : "Native is live. The countdown is gone and the store and downloads are open."}
        actions={live.prelaunch ? (
          <Btn busy={busy === "now"} onClick={() => confirm("Launch Native now? The store and downloads unlock for everyone.") && save({ prelaunch: false }, "now", "Native is launched! 🚀")}><Rocket className="h-4 w-4" /> Launch now</Btn>
        ) : (
          <Btn variant="ghost" busy={busy === "back"} onClick={() => save({ prelaunch: true }, "back", "Back in pre-launch mode.")}><RotateCcw className="h-4 w-4" /> Back to pre-launch</Btn>
        )}>
        {live.prelaunch && (
          <div className="dots flex flex-col items-center rounded-2xl border border-line py-6">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-dim">Live countdown</p>
            <Countdown at={live.at} size="sm" className="mt-3" />
          </div>
        )}
      </Panel>

      <Panel title="Countdown & locks" actions={<Btn disabled={!dirty} busy={busy === "save"} onClick={() => save(l, "save", "Launch settings saved.")}>Save changes</Btn>}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Launch date & time" hint={`Your time zone (${Intl.DateTimeFormat().resolvedOptions().timeZone}). The countdown ends here and everything unlocks automatically.`}>
            <input type="datetime-local" className={input} value={toLocalInput(l.at)} onChange={(e) => set("at", fromLocalInput(e.target.value) ?? l.at)} />
          </Field>
          <div className="flex flex-col gap-2.5">
            <Toggle on={l.prelaunch} onChange={(v) => set("prelaunch", v)} label="Pre-launch mode" hint="Countdown hero and launch messaging." />
            <Toggle on={l.lockStore} onChange={(v) => set("lockStore", v)} label="Lock the store until launch" hint="No buying or claiming capes / Native+ (admins can still test)." />
            <Toggle on={l.lockDownloads} onChange={(v) => set("lockDownloads", v)} label="Lock downloads until launch" hint="Download buttons turn into sign-up buttons." />
          </div>
          <Field label="Hero headline"><input className={input} maxLength={80} value={l.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
          <Field label="Hero sub-line"><textarea className={textarea} maxLength={200} value={l.subline} onChange={(e) => set("subline", e.target.value)} /></Field>
        </div>
      </Panel>

      <Panel title="Founder cape" sub="Accounts created before launch pick ONE of these for free (up to 6). Everyone else buys them." actions={<Btn disabled={!dirty} busy={busy === "save2"} onClick={() => save(l, "save2", "Founder capes saved.")}>Save changes</Btn>}>
        <div className="mb-4"><Toggle on={l.founderPick} onChange={(v) => set("founderPick", v)} label="Free founder cape for pre-launch accounts" /></div>
        <CapePicker items={sellable} value={l.founderCapes} onChange={(v) => set("founderCapes", v)} max={6} />
      </Panel>
    </div>
  );
}
