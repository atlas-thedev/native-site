"use client";

import { Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { AdminItem } from "./types";
import { Btn, Empty, Field, Panel, adm, fmtDate, input, useAction, useToast } from "./ui";

type Code = { code: string; itemId: string; itemName: string | null; maxUses: number; uses: number; expiresAt: number | null; note: string; createdBy: string | null; createdAt: number };
type Gift = { userId: string; username: string | null; expiresAt: number | null; note: string; grantedBy: string | null; createdAt: number };

export default function AdminCodes({ items }: { items: AdminItem[] }) {
  const [codes, setCodes] = useState<Code[] | null>(null);
  const [gifts, setGifts] = useState<Gift[] | null>(null);
  const [f, setF] = useState({ itemId: "", code: "", maxUses: "1", expiresInDays: "", note: "" });
  const [g, setG] = useState({ username: "", days: "30", note: "" });
  const { busy, run } = useAction();
  const toast = useToast();
  useEffect(() => {
    adm<{ codes: Code[] }>("GET", "billing/codes").then((d) => setCodes(d.codes)).catch(() => setCodes([]));
    adm<{ gifts: Gift[] }>("GET", "billing/plus").then((d) => setGifts(d.gifts)).catch(() => setGifts([]));
  }, []);
  const create = () => run("code", async () => {
    const d = await adm<{ code: string; codes: Code[] }>("POST", "billing/codes", { ...f, maxUses: Number(f.maxUses), expiresInDays: Number(f.expiresInDays) || undefined });
    setCodes(d.codes); setF({ ...f, code: "", note: "" });
    navigator.clipboard?.writeText(d.code).catch(() => {});
    return d;
  }, "Code created and copied.");
  const gift = () => run("gift", async () => { setGifts((await adm<{ gifts: Gift[] }>("POST", "billing/plus", { username: g.username.trim(), days: Number(g.days), note: g.note })).gifts); setG({ ...g, username: "" }); }, "Native+ gifted.");

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Redeem codes" sub="A code unlocks one cape. Share it for giveaways, creators or events. Redeemed on the account page."
        actions={<Btn busy={busy === "code"} disabled={!f.itemId} onClick={create}><Plus className="h-4 w-4" /> Create code</Btn>}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Field label="Cape">
            <select className={input} value={f.itemId} onChange={(e) => setF({ ...f, itemId: e.target.value })}>
              <option value="">Choose…</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Code (optional)" hint="Leave empty to generate one."><input className={input} placeholder="LAUNCH-2026" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} /></Field>
          <Field label="Max uses"><input type="number" min={1} className={input} value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value })} /></Field>
          <Field label="Expires in days (optional)"><input type="number" min={1} className={input} value={f.expiresInDays} onChange={(e) => setF({ ...f, expiresInDays: e.target.value })} /></Field>
          <Field label="Note"><input className={input} maxLength={120} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
        </div>
        <div className="mt-5">
          {!codes ? <Empty>Loading…</Empty> : codes.length ? (
            <ul className="divide-y divide-line">
              {codes.map((c) => (
                <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 py-3 text-[14px]">
                  <span className="min-w-0">
                    <button onClick={() => { navigator.clipboard?.writeText(c.code); toast("ok", "Copied."); }} className="inline-flex items-center gap-1.5 font-mono font-bold hover:underline">{c.code} <Copy className="h-3.5 w-3.5 text-dim" /></button>
                    <span className="block text-[12.5px] text-mute">{c.itemName ?? c.itemId} · {c.uses}/{c.maxUses} used · {c.expiresAt ? `expires ${fmtDate(c.expiresAt)}` : "no expiry"}{c.note ? ` · ${c.note}` : ""}</span>
                  </span>
                  <Btn variant="danger" onClick={() => confirm(`Delete ${c.code}?`) && run(c.code, async () => setCodes((await adm<{ codes: Code[] }>("DELETE", `billing/codes/${c.code}`)).codes), "Code deleted.")} title="Delete"><Trash2 className="h-4 w-4" /></Btn>
                </li>
              ))}
            </ul>
          ) : <Empty>No codes yet.</Empty>}
        </div>
      </Panel>

      <Panel title="Native+ gifts" actions={<Btn busy={busy === "gift"} disabled={!g.username.trim()} onClick={gift}><Plus className="h-4 w-4" /> Gift</Btn>}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Username"><input className={input} value={g.username} onChange={(e) => setG({ ...g, username: e.target.value })} /></Field>
          <Field label="Days (0 = forever)"><input type="number" min={0} className={input} value={g.days} onChange={(e) => setG({ ...g, days: e.target.value })} /></Field>
          <Field label="Note"><input className={input} maxLength={120} value={g.note} onChange={(e) => setG({ ...g, note: e.target.value })} /></Field>
        </div>
        <div className="mt-5">
          {!gifts ? <Empty>Loading…</Empty> : gifts.length ? (
            <ul className="divide-y divide-line">
              {gifts.map((x) => (
                <li key={x.userId} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                  <span><b>{x.username ?? x.userId}</b> <span className="text-[12.5px] text-mute">· {x.expiresAt ? `until ${fmtDate(x.expiresAt)}` : "forever"}{x.note ? ` · ${x.note}` : ""}</span></span>
                  <Btn variant="danger" onClick={() => confirm("Remove this gift?") && run(x.userId, async () => setGifts((await adm<{ gifts: Gift[] }>("DELETE", `billing/plus/${x.userId}`)).gifts), "Gift removed.")}><Trash2 className="h-4 w-4" /></Btn>
                </li>
              ))}
            </ul>
          ) : <Empty>No active gifts.</Empty>}
        </div>
      </Panel>
    </div>
  );
}
