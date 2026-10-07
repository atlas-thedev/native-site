"use client";

import { Plus, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import type { Shared } from "./AdminApp";
import { Row } from "./AdminCapes";
import type { AdminItem } from "./types";
import { Btn, Empty, Field, Panel, Toggle, adm, fileToBase64, input, textarea, useAction } from "./ui";
import AdminImportPack from "./AdminImportPack";
import { nameFromFile, thumbFor } from "@/lib/autoThumb";
import { fetchModel } from "../cosmetics/CosmeticViewer";
import { COSMETIC_SLOTS, SLOT_NAMES, isCosmetic, type CosmeticSlot } from "@/lib/store";

const blank = { name: "", description: "", tags: "", price: "", slot: "auto" as CosmeticSlot | "auto", featured: false, hidden: false, exclusive: false };

function Pick({ file, label, accept, onPick }: { file: File | null; label: string; accept: string; onPick: (f: File | null) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-3 hover:border-fg">
      <Upload className="h-4 w-4 shrink-0" /><span className="truncate text-[14px] font-semibold">{file ? file.name : label}</span>
      <input type="file" accept={accept} className="sr-only" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
    </label>
  );
}

/** 3D cosmetics (hats, glasses, back items, shoes, hand items, balloons): NCM v1 model + texture + thumbnail. */
export default function AdminCosmetics({ items: all, setItems }: Shared) {
  const items = all.filter(isCosmetic);
  const [f, setF] = useState(blank);
  const [model, setModel] = useState<File | null>(null);
  const [texture, setTexture] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [slot, setSlot] = useState<"all" | CosmeticSlot>("all");
  const { busy, run } = useAction();
  const create = () => run("create", async () => {
    if (!model) throw new Error("Add the model (.json).");
    if (!texture) throw new Error("Add the texture PNG.");
    const text = await model.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { throw new Error("The model isn’t valid JSON."); }
    const name = f.name.trim() || nameFromFile(model.name);
    const png = new Uint8Array(await texture.arrayBuffer());
    // no thumbnail picked: draw one (the piece worn on the default skin), so the store never shows the texture sheet
    const auto = thumb ? null : await thumbFor(name, json, png);
    const body = {
      kind: "cosmetic", slot: f.slot, name, description: f.description, tags: f.tags,
      ...(f.price.trim() ? { price: Number(f.price) } : {}), // empty = the automatic price
      hidden: f.hidden, exclusive: f.exclusive,
      model: text, texture: await fileToBase64(texture), ...(thumb ? { thumb: await fileToBase64(thumb) } : auto ? { thumb: auto } : {}),
    };
    const d = await adm<{ items: AdminItem[] }>("POST", "store/items", body);
    setItems(d.items); setF(blank); setModel(null); setTexture(null); setThumb(null);
  }, "Cosmetic added: slot, price and preview were set automatically.");
  /** Draws a fresh preview for every cosmetic still showing its flat texture sheet (or all of them). */
  const [fixed, setFixed] = useState<string>("");
  const redraw = (every: boolean) => run("redraw", async () => {
    const todo = items.filter((it) => it.modelUrl && it.textureUrl && (every || !it.stillUrl || it.stillUrl === it.textureUrl));
    let done = 0;
    let latest: AdminItem[] | null = null;
    for (const it of todo) {
      setFixed(`${done}/${todo.length}`);
      const json = await fetchModel(it.modelUrl!);
      const shot = await thumbFor(it.id, json, it.textureUrl!);
      if (!shot) continue;
      const d = await adm<{ items: AdminItem[] }>("PATCH", `store/items/${it.id}`, { thumb: shot });
      latest = d.items; done += 1;
    }
    if (latest) setItems(latest);
    setFixed("");
    if (!todo.length) throw new Error("Every cosmetic already has a preview.");
  }, "Previews redrawn.");
  const shown = slot === "all" ? items : items.filter((i) => i.slot === slot);

  return (
    <div className="flex flex-col gap-6">
      <AdminImportPack setItems={setItems} />
      <Panel title="Add a cosmetic" sub="Drop the NCM v1 model and its texture. Name, slot, price and the store preview are filled in automatically; change anything you like." actions={<Btn busy={busy === "create"} disabled={!model || !texture} onClick={create}><Plus className="h-4 w-4" /> Add cosmetic</Btn>}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name"><input className={input} maxLength={40} placeholder={model ? nameFromFile(model.name) : "From the model file"} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Slot">
            <div className="flex flex-wrap gap-2">
              {(["auto", ...COSMETIC_SLOTS] as const).map((s) => (
                <button key={s} type="button" onClick={() => setF({ ...f, slot: s })} aria-pressed={f.slot === s} className={`h-10 rounded-full border px-4 text-[14px] font-semibold transition ${f.slot === s ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2"}`}>{s === "auto" ? "Auto" : SLOT_NAMES[s]}</button>
              ))}
            </div>
          </Field>
          <Field label="Description"><textarea className={textarea} maxLength={200} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="flex flex-col gap-3">
            <Field label="Tags (comma separated)"><input className={input} placeholder="party, animated" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
            <Field label="Price (USD)"><input type="number" min={1.99} step={0.01} className={input} placeholder="Automatic (1.99 and up)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
          </div>
          <div className="flex flex-col gap-3">
            <Pick file={model} label="Model .json (NCM v1)" accept="application/json,.json" onPick={setModel} />
            <Pick file={texture} label="Texture PNG" accept="image/png" onPick={setTexture} />
            <Pick file={thumb} label="Preview PNG (optional: drawn automatically)" accept="image/png" onPick={setThumb} />
          </div>
          <div className="flex flex-col gap-2.5">
            <Toggle on={f.hidden} onChange={(v) => setF({ ...f, hidden: v })} label="Hidden (draft)" />
            <Toggle on={f.exclusive} onChange={(v) => setF({ ...f, exclusive: v })} label="Event-only (given by admins, never sold)" />
          </div>
        </div>
      </Panel>

      <Panel title={`Cosmetics (${items.length})`} actions={
        <div className="flex flex-wrap gap-1.5">
          <Btn variant="ghost" busy={busy === "redraw"} onClick={() => redraw(false)} title="Draw a store preview for every cosmetic that has none"><Sparkles className="h-4 w-4" /> {fixed ? `Drawing ${fixed}` : "Fix previews"}</Btn>
          {(["all", ...COSMETIC_SLOTS] as const).map((s) => (
            <button key={s} onClick={() => setSlot(s)} aria-pressed={slot === s} className={`h-9 rounded-full border px-3.5 text-[13px] font-semibold transition ${slot === s ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2"}`}>{s === "all" ? "All" : SLOT_NAMES[s]}</button>
          ))}
        </div>
      }>
        {shown.length ? <ul className="flex flex-col gap-3">{shown.map((it) => <Row key={`${it.id}-${it.price}-${it.hidden}-${it.featured}-${it.exclusive}`} it={it} onSaved={setItems} />)}</ul> : <Empty>No cosmetics yet. Add the first one above.</Empty>}
      </Panel>
    </div>
  );
}
