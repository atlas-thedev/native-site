"use client";

import { useEffect, useState } from "react";
import type { Shared } from "./AdminApp";
import { Btn, Field, Panel, Toggle, adm, fromLocalInput, input, textarea, toLocalInput, useAction } from "./ui";
import type { SiteDoc, Settings } from "./types";

export default function AdminSite({ doc, setDoc }: Shared) {
  const [m, setM] = useState<Settings["maintenance"] | null>(doc?.settings.maintenance ?? null);
  const [a, setA] = useState<Settings["announcement"] | null>(doc?.settings.announcement ?? null);
  const { busy, run } = useAction();
  useEffect(() => {
    setM(doc?.settings.maintenance ?? null);
    setA(doc?.settings.announcement ?? null);
  }, [doc]);
  if (!m || !a || !doc) return null;
  const post = (body: object, key: string, ok: string) => run(key, async () => setDoc(await adm<SiteDoc>("POST", "site", body)), ok);

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Maintenance mode" sub="Covers the whole website with a maintenance screen. Admins can still browse (and the sign-in page stays open)."
        actions={<Btn busy={busy === "m"} onClick={() => post({ maintenance: m }, "m", m.enabled ? "Maintenance is ON." : "Maintenance settings saved.")}>Save</Btn>}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Toggle on={m.enabled} onChange={(v) => setM({ ...m, enabled: v })} label="Maintenance mode" hint={m.enabled ? "Visitors see the maintenance screen." : "The site is open."} />
            <Field label="Back by (optional)" hint="Shows a small countdown on the maintenance screen.">
              <input type="datetime-local" className={input} value={toLocalInput(m.until)} onChange={(e) => setM({ ...m, until: fromLocalInput(e.target.value) })} />
            </Field>
          </div>
          <Field label="Message"><textarea className={textarea} maxLength={280} value={m.message} onChange={(e) => setM({ ...m, message: e.target.value })} /></Field>
        </div>
        {doc.settings.maintenance.enabled && (
          <div className="mt-4"><Btn variant="ghost" busy={busy === "off"} onClick={() => post({ maintenance: { enabled: false } }, "off", "Maintenance is OFF. The site is open.")}>Turn off now</Btn></div>
        )}
      </Panel>

      <Panel title="Announcement bar" sub="The thin bar above the navigation. When it’s off, the bar shows a live offer, the launch countdown or the latest version."
        actions={<Btn busy={busy === "a"} onClick={() => post({ announcement: a }, "a", "Announcement saved.")}>Save</Btn>}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Toggle on={a.enabled} onChange={(v) => setA({ ...a, enabled: v })} label="Show my announcement" />
            <Field label="Text"><input className={input} maxLength={160} placeholder="Server event this Saturday at 8pm!" value={a.text} onChange={(e) => setA({ ...a, text: e.target.value })} /></Field>
          </div>
          <div className="flex flex-col gap-3">
            <Field label="Button label (optional)"><input className={input} maxLength={30} placeholder="Learn more" value={a.cta} onChange={(e) => setA({ ...a, cta: e.target.value })} /></Field>
            <Field label="Button link (optional)" hint="A site path like /vote or a full https:// link."><input className={input} maxLength={300} placeholder="/vote" value={a.href} onChange={(e) => setA({ ...a, href: e.target.value })} /></Field>
          </div>
        </div>
        {a.text && (
          <div className="mt-5 rounded-xl border border-line bg-bg px-4 py-2.5 text-center text-[13px] text-mute">
            Preview: {a.text} {a.href && <span className="ml-2 rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-fg">{a.cta || "Learn more"} →</span>}
          </div>
        )}
      </Panel>
    </div>
  );
}
