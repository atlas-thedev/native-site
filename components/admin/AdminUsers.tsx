"use client";

import { Crown, LogOut, Search, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AdminItem } from "./types";
import { Badge, Btn, Empty, Panel, adm, fmtDate, input, useAction } from "./ui";

type U = { id: string; email: string; username: string; isAdmin: boolean; createdAt: number; status: string; lastSeen: number | null; friendCount: number; badges: string[] };
type Detail = { id: string; username: string; owned: { id: string; acquiredAt: number; source: string }[]; equipped: string | null };

function UserRow({ u, items, onChange }: { u: U; items: AdminItem[]; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<Detail | null>(null);
  const [give, setGive] = useState("");
  const [days, setDays] = useState("30");
  const { busy, run } = useAction();
  const load = () => run("load", async () => setD((await adm<{ user: Detail }>("GET", `store/users/${u.id}`)).user));
  const toggle = () => { setOpen(!open); if (!open && !d) load(); };
  const cape = (itemId: string, action: string, ok: string) => run(`${action}-${itemId}`, async () => setD((await adm<{ user: Detail }>("POST", `store/users/${u.id}/capes`, { itemId, action })).user), ok);
  const name = (id: string) => items.find((i) => i.id === id)?.name ?? id;

  return (
    <li className="rounded-2xl border border-line bg-bg">
      <button onClick={toggle} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left">
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-[15.5px] font-bold">{u.username} {u.isAdmin && <Badge solid>Admin</Badge>} <span className={`h-2 w-2 rounded-full ${u.status === "offline" ? "bg-line" : "bg-fg"}`} title={u.status} /></span>
          <span className="block truncate text-[13px] text-mute">{u.email} · joined {fmtDate(u.createdAt)}</span>
        </span>
        <span className="text-[13px] text-dim">{open ? "Close" : "Manage"}</span>
      </button>
      {open && (
        <div className="border-t border-line p-4">
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" busy={busy === "admin"} onClick={() => confirm(`${u.isAdmin ? "Remove" : "Give"} admin access ${u.isAdmin ? "from" : "to"} ${u.username}?`) && run("admin", async () => { await adm("POST", `users/${u.id}/admin`, { isAdmin: !u.isAdmin }); onChange(); }, "Saved.")}><Shield className="h-4 w-4" /> {u.isAdmin ? "Remove admin" : "Make admin"}</Btn>
            <Btn variant="ghost" busy={busy === "out"} onClick={() => confirm(`Sign ${u.username} out everywhere?`) && run("out", () => adm("POST", `users/${u.id}/sessions/revoke`), "Signed out everywhere.")}><LogOut className="h-4 w-4" /> Sign out everywhere</Btn>
            <span className="inline-flex items-center gap-2">
              <input aria-label="Days of Native+" type="number" min={1} className={`${input} h-10 w-20`} value={days} onChange={(e) => setDays(e.target.value)} />
              <Btn variant="ghost" busy={busy === "plus"} onClick={() => run("plus", () => adm("POST", "billing/plus", { username: u.username, days: Number(days), note: "Admin gift" }), `${days} days of Native+ given.`)}><Crown className="h-4 w-4" /> Gift Native+</Btn>
            </span>
          </div>
          <p className="mb-2 mt-5 text-[13px] font-semibold text-mute">Capes</p>
          {!d ? <Empty>Loading…</Empty> : (
            <>
              {d.owned.length ? (
                <ul className="flex flex-wrap gap-2">
                  {d.owned.map((o) => (
                    <li key={o.id} className="inline-flex items-center gap-2 rounded-full border border-line py-1 pl-3 pr-1 text-[13px]">
                      <b>{name(o.id)}</b><span className="text-dim">{o.source}{d.equipped === o.id ? " · worn" : ""}</span>
                      <button onClick={() => cape(o.id, "revoke", "Cape removed.")} className="rounded-full px-2 py-0.5 text-[12px] font-semibold text-mute hover:bg-surface-2 hover:text-fg">Remove</button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-[13px] text-mute">No capes.</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <select aria-label="Cape to give" className={`${input} h-10 max-w-[240px]`} value={give} onChange={(e) => setGive(e.target.value)}>
                  <option value="">Give a cape…</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <Btn disabled={!give} busy={busy?.startsWith("grant")} onClick={() => cape(give, "grant", `${name(give)} given.`)}>Give</Btn>
                <Btn variant="ghost" disabled={!give} busy={busy?.startsWith("equip")} onClick={() => cape(give, "equip", `${name(give)} put on.`)}>Give & wear</Btn>
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export default function AdminUsers({ items }: { items: AdminItem[] }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ users: U[]; total: number; totalPages: number } | null>(null);
  const load = useCallback((query: string, p: number) => {
    adm<{ users: U[]; total: number; totalPages: number }>("GET", `users?query=${encodeURIComponent(query)}&page=${p}&pageSize=25`).then(setData).catch(() => setData({ users: [], total: 0, totalPages: 1 }));
  }, []);
  useEffect(() => {
    const t = setTimeout(() => load(q, page), 250);
    return () => clearTimeout(t);
  }, [q, page, load]);
  return (
    <Panel title={`Users${data ? ` (${data.total.toLocaleString()})` : ""}`}>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
        <input className={`${input} pl-10`} placeholder="Search username, email or id…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>
      {!data ? <Empty>Loading…</Empty> : data.users.length ? (
        <>
          <ul className="flex flex-col gap-2.5">{data.users.map((u) => <UserRow key={u.id} u={u} items={items} onChange={() => load(q, page)} />)}</ul>
          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-[14px]">
              <Btn variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Btn>
              <span className="text-mute">Page {page} of {data.totalPages}</span>
              <Btn variant="ghost" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Btn>
            </div>
          )}
        </>
      ) : <Empty>No users found.</Empty>}
    </Panel>
  );
}
