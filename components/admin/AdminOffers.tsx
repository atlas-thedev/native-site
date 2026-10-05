"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Shared } from "./AdminApp";
import CapePicker from "./CapePicker";
import { Badge, Btn, Empty, Field, Panel, Toggle, adm, fmtDate, fromLocalInput, input, toLocalInput, useAction, usd } from "./ui";
import type { SiteDoc } from "./types";

const blank = { title: "", description: "", percent: 20, itemIds: [] as string[], startsAt: null as number | null, endsAt: null as number | null, banner: true, enabled: true };

export default function AdminOffers({ doc, setDoc, items }: Shared) {
  const [f, setF] = useState(blank);
  const { busy, run } = useAction();
  if (!doc) return null;
  const now = Date.now();
  const sellable = items.filter((i) => !i.exclusive);
  const name = (id: string) => items.find((i) => i.id === id)?.name ?? id;
  const create = () => run("create", async () => { setDoc(await adm<SiteDoc>("POST", "site/offers", f)); setF(blank); }, "Offer created.");
  const patch = (id: string, body: object, ok: string) => run(id, async () => setDoc(await adm<SiteDoc>("PATCH", `site/offers/${id}`, body)), ok);
  const del = (id: string) => confirm("Delete this offer?") && run(id, async () => setDoc(await adm<SiteDoc>("DELETE", `site/offers/${id}`)), "Offer deleted.");
  const state = (o: (typeof doc.settings.offers)[number]) => !o.enabled ? "Paused" : o.startsAt && o.startsAt > now ? "Scheduled" : o.endsAt && o.endsAt <= now ? "Ended" : "Live";

  return (
    <div className="flex flex-col gap-6">
      <Panel title="New offer" sub="A % discount on every cape or on selected capes. The best live offer applies at checkout and shows on the site with the old price struck through."
        actions={<Btn busy={busy === "create"} onClick={create} disabled={f.title.trim().length < 2}><Plus className="h-4 w-4" /> Create offer</Btn>}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Title"><input className={input} maxLength={60} placeholder="Launch week sale" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label={`Discount · ${f.percent}% off (${usd(1.99)} → ${usd(Math.max(0.5, Math.round(1.99 * (100 - f.percent)) / 100))})`}>
            <input type="range" min={1} max={90} value={f.percent} onChange={(e) => setF({ ...f, percent: Number(e.target.value) })} className="mt-3 accent-[var(--fg)]" />
          </Field>
          <Field label="Starts (optional)"><input type="datetime-local" className={input} value={toLocalInput(f.startsAt)} onChange={(e) => setF({ ...f, startsAt: fromLocalInput(e.target.value) })} /></Field>
          <Field label="Ends (optional)"><input type="datetime-local" className={input} value={toLocalInput(f.endsAt)} onChange={(e) => setF({ ...f, endsAt: fromLocalInput(e.target.value) })} /></Field>
          <Field label="Description (optional)"><input className={input} maxLength={200} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="flex flex-col gap-2.5">
            <Toggle on={f.banner} onChange={(v) => setF({ ...f, banner: v })} label="Show in the announcement bar" />
            <Toggle on={f.enabled} onChange={(v) => setF({ ...f, enabled: v })} label="Enabled" />
          </div>
        </div>
        <p className="mb-2.5 mt-6 text-[13px] font-semibold text-mute">Capes {f.itemIds.length ? `(${f.itemIds.length} selected)` : "(none selected = every cape)"}</p>
        <CapePicker items={sellable} value={f.itemIds} onChange={(v) => setF({ ...f, itemIds: v })} />
      </Panel>

      <Panel title="Offers">
        {doc.settings.offers.length ? (
          <ul className="flex flex-col gap-3">
            {doc.settings.offers.map((o) => {
              const st = state(o);
              return (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-bg p-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[16px] font-bold">{o.title} <Badge solid={st === "Live"}>{st}</Badge></p>
                    <p className="mt-1 text-[13.5px] text-mute">−{o.percent}% · {o.itemIds?.length ? o.itemIds.map(name).join(", ") : "every cape"} · {o.startsAt ? `from ${fmtDate(o.startsAt)}` : "now"} → {o.endsAt ? fmtDate(o.endsAt) : "no end"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Btn variant="ghost" busy={busy === o.id} onClick={() => patch(o.id, { enabled: !o.enabled }, o.enabled ? "Offer paused." : "Offer enabled.")}>{o.enabled ? "Pause" : "Enable"}</Btn>
                    <Btn variant="danger" onClick={() => del(o.id)} title="Delete"><Trash2 className="h-4 w-4" /></Btn>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <Empty>No offers yet. Create one above.</Empty>}
      </Panel>
    </div>
  );
}
