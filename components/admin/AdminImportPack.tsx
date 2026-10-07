"use client";

import { FolderUp, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CosmeticViewer from "../cosmetics/CosmeticViewer";
import type { AdminItem } from "./types";
import { Btn, Field, Panel, Toggle, adm, input, useAction } from "./ui";
import { COSMETIC_SLOTS, SIDED_SLOTS, SLOT_NAMES, type CosmeticSlot, type Side } from "@/lib/store";

type Opt = { on: boolean; name: string; slot: CosmeticSlot; side: Side; scale: string; ox: string; oy: string; oz: string };
type Found = { id: string; name: string; slot: CosmeticSlot; side: Side | null; kind: string };
type Lib = typeof import("@/lib/ncmImport");

/** A store thumbnail for an imported piece: the same worn shot the store draws, on the default skin. Null if it can't be drawn. */
async function thumbFor(id: string, model: unknown, png: Uint8Array): Promise<string | null> {
  const texture = URL.createObjectURL(new Blob([png as BlobPart], { type: "image/png" }));
  try {
    const { wornShot } = await import("@/lib/wornShot");
    const url: string | null = await wornShot({ item: { id: `import:${id}` }, asset: { model, texture }, skinUrl: "/skins/steve.png", model: "default" });
    return url ? url.replace(/^data:image\/png;base64,/, "") : null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(texture);
  }
}

const toB64 = (u8: Uint8Array) => {
  let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
};

/** Drop an ItemsAdder / Nexo / Oraxen / ModelEngine / HMCCosmetics pack: finds its cosmetics, previews them and imports the ones you pick. */
export default function AdminImportPack({ setItems }: { setItems: (items: AdminItem[]) => void }) {
  const lib = useRef<Lib | null>(null);
  const files = useRef<Record<string, Uint8Array> | null>(null);
  const [found, setFound] = useState<Found[]>([]);
  const [opts, setOpts] = useState<Record<string, Opt>>({});
  const [notes, setNotes] = useState<string[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ modelUrl: string; textureUrl: string; info: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [publish, setPublish] = useState(false);
  const { busy, run } = useAction();

  const load = (f: File | null) => run("read", async () => {
    if (!f) return;
    setErr(null); setFound([]); setPreview(null); setSel(null);
    lib.current ||= await import("@/lib/ncmImport");
    files.current = await lib.current.readZip(await f.arrayBuffer());
    const d = lib.current.discover(files.current) as unknown as { entries: Found[]; notes: string[] };
    setFound(d.entries); setNotes(d.notes);
    setOpts(Object.fromEntries(d.entries.map((e) => [e.id, { on: true, name: e.name, slot: e.slot, side: (e.side ?? "right") as Side, scale: "1", ox: "0", oy: "0", oz: "0" }])));
    if (!d.entries.length) throw new Error("No cosmetics found in that pack.");
    setSel(d.entries[0].id);
  }, "Pack read.");

  const optsFor = (id: string) => {
    const o = opts[id];
    return { slot: o.slot, side: o.side, scale: Number(o.scale) || 1, offset: [Number(o.ox) || 0, Number(o.oy) || 0, Number(o.oz) || 0] };
  };
  const convert = (id: string) => lib.current!.convert(files.current!, found.find((e) => e.id === id)!, optsFor(id));

  // live preview of the picked entry, re-baked when its settings change
  const o = sel ? opts[sel] : null;
  const key = sel && o ? `${sel}|${o.slot}|${o.side}|${o.scale}|${o.ox}|${o.oy}|${o.oz}` : "";
  useEffect(() => {
    if (!sel || !files.current || !lib.current) return;
    let dead = false;
    const t = setTimeout(async () => {
      try {
        const r = await convert(sel);
        if (dead) return;
        const modelUrl = URL.createObjectURL(new Blob([JSON.stringify(r.model)], { type: "application/json" }));
        const textureUrl = URL.createObjectURL(new Blob([r.png as BlobPart], { type: "image/png" }));
        setErr(null);
        setPreview({ modelUrl, textureUrl, info: `${r.info.parts} parts · ${r.info.cubes} cubes · ${r.info.size[0]}×${r.info.size[1]} texture` });
      } catch (e) { if (!dead) { setPreview(null); setErr(e instanceof Error ? e.message : String(e)); } }
    }, 250);
    return () => { dead = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const worn = useMemo(() => (preview && sel && o ? [{ id: sel, modelUrl: preview.modelUrl, textureUrl: preview.textureUrl, slot: o.slot, side: SIDED_SLOTS.includes(o.slot) ? o.side : null }] : []), [preview, sel, o]);

  const importAll = () => run("import", async () => {
    const chosen = found.filter((e) => opts[e.id]?.on);
    if (!chosen.length) throw new Error("Tick at least one cosmetic.");
    let last: AdminItem[] | null = null;
    for (const e of chosen) {
      const r = await convert(e.id);
      // without a thumbnail the store would show the raw texture atlas
      const thumb = await thumbFor(e.id, r.model, r.png);
      const d = await adm<{ items: AdminItem[] }>("POST", "store/items", {
        kind: "cosmetic", slot: opts[e.id].slot, name: opts[e.id].name.trim() || e.name, description: "", tags: "", price: 0,
        featured: false, hidden: !publish, exclusive: false, model: JSON.stringify(r.model), texture: toB64(r.png), ...(thumb ? { thumb } : {}),
      });
      last = d.items;
    }
    if (last) setItems(last);
  }, `Imported. ${publish ? "They're live in the store." : "They're hidden drafts: unhide them when ready."}`);

  const set = (id: string, patch: Partial<Opt>) => setOpts((p) => ({ ...p, [id]: { ...p[id], ...patch } }));

  return (
    <Panel title="Import a plugin pack" sub="Drop an ItemsAdder, Nexo, Oraxen, ModelEngine or HMCCosmetics pack (.zip). Native finds the cosmetics, converts their models and textures and shows them here before anything is added." actions={<Btn busy={busy === "import"} disabled={!found.length} onClick={importAll}><Plus className="h-4 w-4" /> Import selected</Btn>}>
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-3 hover:border-fg">
        <FolderUp className="h-4 w-4 shrink-0" /><span className="truncate text-[14px] font-semibold">{busy === "read" ? "Reading…" : found.length ? `${found.length} cosmetics found. Drop another pack to replace` : "Choose a pack .zip"}</span>
        <input type="file" accept=".zip,application/zip" className="sr-only" onChange={(e) => load(e.target.files?.[0] ?? null)} />
      </label>
      {notes.length > 0 && <ul className="mt-3 list-disc pl-5 text-[13px] text-dim">{notes.map((n) => <li key={n}>{n}</li>)}</ul>}
      {found.length > 0 && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            {found.map((e) => {
              const v = opts[e.id];
              if (!v) return null;
              return (
                <div key={e.id} onClick={() => setSel(e.id)} className={`flex cursor-pointer flex-wrap items-center gap-3 rounded-2xl border px-3.5 py-2.5 ${sel === e.id ? "border-fg" : "border-line"}`}>
                  <input type="checkbox" checked={v.on} onChange={(ev) => set(e.id, { on: ev.target.checked })} onClick={(ev) => ev.stopPropagation()} className="h-4 w-4" />
                  <input className={`${input} !h-9 min-w-0 flex-1`} value={v.name} maxLength={40} onChange={(ev) => set(e.id, { name: ev.target.value })} onClick={(ev) => ev.stopPropagation()} />
                  <select className={`${input} !h-9 w-auto`} value={v.slot} onChange={(ev) => set(e.id, { slot: ev.target.value as CosmeticSlot })} onClick={(ev) => ev.stopPropagation()}>
                    {COSMETIC_SLOTS.map((s) => <option key={s} value={s}>{SLOT_NAMES[s]}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative h-[360px] overflow-hidden rounded-2xl border border-line bg-surface-2">
              <CosmeticViewer skin="/skins/steve.png" model="default" cape={null} worn={worn} walk={false} spin focus={o?.slot ?? null} />
            </div>
            <p className="text-[12.5px] text-dim">{err ? <span className="text-red-500">{err}</span> : preview?.info ?? "Converting…"}</p>
            {sel && o && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Scale"><input className={input} type="number" step={0.05} min={0.1} value={o.scale} onChange={(e) => set(sel, { scale: e.target.value })} /></Field>
                <Field label="Offset X"><input className={input} type="number" step={0.5} value={o.ox} onChange={(e) => set(sel, { ox: e.target.value })} /></Field>
                <Field label="Offset Y"><input className={input} type="number" step={0.5} value={o.oy} onChange={(e) => set(sel, { oy: e.target.value })} /></Field>
                <Field label="Offset Z"><input className={input} type="number" step={0.5} value={o.oz} onChange={(e) => set(sel, { oz: e.target.value })} /></Field>
                {SIDED_SLOTS.includes(o.slot) && (
                  <Field label="Default side">
                    <select className={input} value={o.side} onChange={(e) => set(sel, { side: e.target.value as Side })}>
                      <option value="left">{o.slot === "hand" ? "Left hand" : "Left"}</option>
                      <option value="right">{o.slot === "hand" ? "Right hand" : "Right"}</option>
                    </select>
                  </Field>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-4"><Toggle on={publish} onChange={setPublish} label="Publish immediately (otherwise imported as hidden drafts)" /></div>
    </Panel>
  );
}
