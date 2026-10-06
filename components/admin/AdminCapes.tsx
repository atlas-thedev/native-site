"use client";

import { ExternalLink, Plus, Trash2, Upload, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CapeStrip from "../CapeStrip";
import type { Shared } from "./AdminApp";
import type { AdminItem } from "./types";
import { SLOT_NAMES, isCosmetic } from "@/lib/store";
import { Badge, Btn, Empty, Field, Panel, Toggle, adm, fileToBase64, fmtDate, input, textarea, useAction, usd } from "./ui";

type Owner = { userId: string; username: string | null; acquiredAt: number; source: string };

export function Row({ it, onSaved }: { it: AdminItem; onSaved: (items: AdminItem[]) => void }) {
  const [price, setPrice] = useState(String(it.price));
  const [owners, setOwners] = useState<Owner[] | null>(null);
  const [grantTo, setGrantTo] = useState("");
  const { busy, run } = useAction();
  const cosmetic = isCosmetic(it);
  const patch = (body: object, key: string, ok: string) => run(key, async () => onSaved((await adm<{ items: AdminItem[] }>("PATCH", `store/items/${it.id}`, body)).items), ok);
  const loadOwners = () => run("owners", async () => setOwners((await adm<{ owners: Owner[] }>("GET", `store/items/${it.id}/owners`)).owners));
  const grant = () => run("grant", async () => {
    const d = await adm<{ owners: Owner[]; items: AdminItem[] }>("POST", `store/items/${it.id}/grant`, { username: grantTo.trim() });
    setOwners(d.owners); onSaved(d.items); setGrantTo("");
  }, `${it.name} given to ${grantTo}.`);
  const del = () => confirm(`Delete ${it.name}? Everyone who owns it loses it.`) && run("del", async () => onSaved((await adm<{ items: AdminItem[] }>("DELETE", `store/items/${it.id}`)).items), cosmetic ? "Cosmetic deleted." : "Cape deleted.");

  return (
    <li className="rounded-2xl border border-line bg-bg p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className={`dots flex shrink-0 items-center justify-center rounded-xl ${cosmetic ? "h-20 w-20" : "h-24 w-[74px]"}`}>
          {cosmetic ? <img src={it.stillUrl} alt={it.name} className="h-[80%] w-[80%] object-contain [image-rendering:pixelated]" /> : <CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={48} label={it.name} />}
        </div>
        <div className="min-w-[180px] flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-[16px] font-bold">{it.name}
            {cosmetic && it.slot && <Badge>{SLOT_NAMES[it.slot]}</Badge>}{cosmetic && it.motion && <Badge>Moves</Badge>}{it.animated && <Badge>Animated</Badge>}{it.featured && <Badge solid>Featured</Badge>}{it.hidden && <Badge>Hidden</Badge>}{it.exclusive && <Badge>Event</Badge>}
          </p>
          <p className="mt-0.5 text-[13px] text-mute">{it.id} · {it.owners ?? 0} owners · {it.exclusive ? "never sold" : it.price > 0 ? usd(it.price) : "free"}{it.salePrice != null ? ` (on sale ${usd(it.salePrice)})` : ""}</p>
        </div>
        {!it.exclusive && (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-mute">$</span>
            <input aria-label="Price in USD" type="number" min={0} max={99.99} step={0.01} className={`${input} h-10 w-24`} value={price} onChange={(e) => setPrice(e.target.value)} />
            <Btn variant="ghost" busy={busy === "price"} disabled={Number(price) === it.price} onClick={() => patch({ price: Number(price) }, "price", "Price saved.")}>Save</Btn>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn variant="ghost" busy={busy === "f"} onClick={() => patch({ featured: !it.featured }, "f", it.featured ? "Unfeatured." : "Featured.")}>{it.featured ? "Unfeature" : "Feature"}</Btn>
        <Btn variant="ghost" busy={busy === "h"} onClick={() => patch({ hidden: !it.hidden }, "h", it.hidden ? "Visible in the store." : "Hidden from the store.")}>{it.hidden ? "Show" : "Hide"}</Btn>
        <Btn variant="ghost" busy={busy === "x"} onClick={() => patch({ exclusive: !it.exclusive }, "x", "Saved.")}>{it.exclusive ? "Make buyable" : "Make event-only"}</Btn>
        <Btn variant="ghost" busy={busy === "owners"} onClick={loadOwners}><Users className="h-4 w-4" /> Owners</Btn>
        <Link href={cosmetic ? `/cosmetics?item=${it.id}` : `/cloaks/${it.id}`} target="_blank" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-[14px] font-semibold hover:bg-surface-2"><ExternalLink className="h-4 w-4" /> View</Link>
        <Btn variant="danger" busy={busy === "del"} onClick={del} title="Delete"><Trash2 className="h-4 w-4" /></Btn>
      </div>
      {owners && (
        <div className="mt-4 rounded-xl border border-line p-3">
          <div className="flex flex-wrap gap-2">
            <input className={`${input} h-10 max-w-[240px]`} placeholder="Give to username…" value={grantTo} onChange={(e) => setGrantTo(e.target.value)} />
            <Btn busy={busy === "grant"} disabled={!grantTo.trim()} onClick={grant}>Give {cosmetic ? "it" : "cape"}</Btn>
          </div>
          {owners.length ? (
            <ul className="mt-3 max-h-56 divide-y divide-line overflow-auto text-[13.5px]">
              {owners.map((o) => <li key={o.userId} className="flex justify-between py-1.5"><span className="font-semibold">{o.username ?? o.userId}</span><span className="text-dim">{o.source} · {fmtDate(o.acquiredAt)}</span></li>)}
            </ul>
          ) : <p className="mt-3 text-[13px] text-mute">Nobody owns it yet.</p>}
        </div>
      )}
    </li>
  );
}

const blank = { name: "", description: "", tags: "", price: "1.99", animated: true, frames: "24", fps: "12", featured: false, hidden: false, exclusive: false };

export default function AdminCapes({ items: all, setItems, reload }: Shared) {
  const items = all.filter((i) => !isCosmetic(i));
  const [bulk, setBulk] = useState("1.99");
  const [f, setF] = useState(blank);
  const [strip, setStrip] = useState<File | null>(null);
  const [still, setStill] = useState<File | null>(null);
  const { busy, run } = useAction();
  const setAll = () => confirm(`Set every buyable cape to ${usd(Number(bulk))}?`) && run("bulk", async () => {
    const d = await adm<{ changed: number }>("POST", "site/prices", { price: Number(bulk) });
    await reload();
    return d;
  }, `Prices updated to ${usd(Number(bulk))}.`);
  const create = () => run("create", async () => {
    if (!still) throw new Error(f.animated ? "Add the first-frame PNG." : "Add the cape PNG.");
    if (f.animated && !strip) throw new Error("Add the frame strip PNG.");
    const body = {
      name: f.name, description: f.description, tags: f.tags, price: Number(f.price) || 0, featured: f.featured, hidden: f.hidden, exclusive: f.exclusive,
      animated: f.animated, frames: Number(f.frames), fps: Number(f.fps),
      still: await fileToBase64(still), ...(f.animated && strip ? { strip: await fileToBase64(strip) } : {}),
    };
    const d = await adm<{ items: AdminItem[] }>("POST", "store/items", body);
    setItems(d.items); setF(blank); setStrip(null); setStill(null);
  }, "Cape added to the store.");

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Pricing" sub="Every buyable cape at one price. Event-only capes are never sold. Offers discount on top of this.">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Price (USD)"><input type="number" min={0} max={99.99} step={0.01} className={`${input} w-32`} value={bulk} onChange={(e) => setBulk(e.target.value)} /></Field>
          <Btn busy={busy === "bulk"} onClick={setAll}>Set all capes to {usd(Number(bulk))}</Btn>
        </div>
      </Panel>

      <Panel title="Add a cape" actions={<Btn busy={busy === "create"} disabled={f.name.trim().length < 2} onClick={create}><Plus className="h-4 w-4" /> Add cape</Btn>}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name"><input className={input} maxLength={40} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Price (USD, 0 = free)"><input type="number" min={0} step={0.01} className={input} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
          <Field label="Description"><textarea className={textarea} maxLength={200} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="flex flex-col gap-3">
            <Field label="Tags (comma separated)"><input className={input} placeholder="animated, cute" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
            <Toggle on={f.animated} onChange={(v) => setF({ ...f, animated: v })} label="Animated cape" hint="Upload a vertical frame strip + its first frame." />
          </div>
          <div className="flex flex-col gap-3">
            {f.animated && (
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-3 hover:border-fg">
                <Upload className="h-4 w-4" /><span className="text-[14px] font-semibold">{strip ? strip.name : "Frame strip PNG (all frames stacked)"}</span>
                <input type="file" accept="image/png" className="sr-only" onChange={(e) => setStrip(e.target.files?.[0] ?? null)} />
              </label>
            )}
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-3 hover:border-fg">
              <Upload className="h-4 w-4" /><span className="text-[14px] font-semibold">{still ? still.name : f.animated ? "First frame PNG" : "Cape PNG"}</span>
              <input type="file" accept="image/png" className="sr-only" onChange={(e) => setStill(e.target.files?.[0] ?? null)} />
            </label>
            {f.animated && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Frames"><input type="number" min={2} max={256} className={input} value={f.frames} onChange={(e) => setF({ ...f, frames: e.target.value })} /></Field>
                <Field label="FPS"><input type="number" min={1} max={30} className={input} value={f.fps} onChange={(e) => setF({ ...f, fps: e.target.value })} /></Field>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <Toggle on={f.featured} onChange={(v) => setF({ ...f, featured: v })} label="Featured" />
            <Toggle on={f.hidden} onChange={(v) => setF({ ...f, hidden: v })} label="Hidden (draft)" />
            <Toggle on={f.exclusive} onChange={(v) => setF({ ...f, exclusive: v })} label="Event-only (given by admins, never sold)" />
          </div>
        </div>
      </Panel>

      <Panel title={`Capes (${items.length})`}>
        {items.length ? <ul className="flex flex-col gap-3">{items.map((it) => <Row key={`${it.id}-${it.price}-${it.hidden}-${it.featured}-${it.exclusive}`} it={it} onSaved={setItems} />)}</ul> : <Empty>No capes yet.</Empty>}
      </Panel>
    </div>
  );
}
