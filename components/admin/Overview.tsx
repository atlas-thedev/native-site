"use client";

import { useEffect, useState } from "react";
import type { Shared } from "./AdminApp";
import { Empty, Panel, Stat, adm, fmtDate, usd } from "./ui";

type Core = { overview?: { users: number; onlineUsers: number; activeSessions: number; recentUsers: { id: string; username: string; createdAt: number; status: string; isAdmin: boolean }[] } };
type Bill = { enabled?: boolean; environment?: string; sales?: { count: number; total: number; last30: number; last30Count: number }; plus?: { active: number }; recent?: { transactionId: string; username: string | null; kind: string; itemName: string | null; plan: string | null; amount: number; status: string; createdAt: number }[] };

export default function Overview({ doc }: Shared) {
  const [core, setCore] = useState<Core["overview"] | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  useEffect(() => {
    adm<Core>("GET", "overview").then((d) => setCore(d.overview ?? null)).catch(() => {});
    adm<Bill>("GET", "billing/overview").then(setBill).catch(() => {});
  }, []);
  const o = doc?.overview;
  if (!o) return null;
  const maxDay = Math.max(1, ...o.signups.map((d) => d.count));
  const maxPick = Math.max(1, ...o.founderByCape.map((d) => d.count));
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86_400_000).toISOString().slice(0, 10);
    return { day: d, count: o.signups.find((x) => x.day === d)?.count ?? 0 };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Accounts" value={o.users.toLocaleString()} hint={`${o.newToday} today · ${o.newThisWeek} this week`} />
        <Stat label="Pre-launch sign-ups" value={o.preLaunchUsers.toLocaleString()} hint="Eligible for a founder cape" />
        <Stat label="Founder capes claimed" value={o.founderPicks.toLocaleString()} hint={o.preLaunchUsers ? `${Math.round((o.founderPicks / o.preLaunchUsers) * 100)}% of pre-launch accounts` : undefined} />
        <Stat label="Online now" value={core ? core.onlineUsers.toLocaleString() : "…"} hint={core ? `${core.activeSessions} active sessions` : undefined} />
        <Stat label="Sales (all time)" value={bill?.sales ? usd(bill.sales.total) : "…"} hint={bill?.sales ? `${bill.sales.count} orders · ${usd(bill.sales.last30)} last 30d` : undefined} />
        <Stat label="Native+ members" value={bill?.plus ? bill.plus.active : "…"} hint={bill ? `Payments ${bill.enabled ? "on" : "off"} · ${bill.environment ?? ""}` : undefined} />
        <Stat label="Votes cast" value={o.votes.toLocaleString()} hint={`${o.openPolls} open vote${o.openPolls === 1 ? "" : "s"}`} />
        <Stat label="Live offers" value={doc.config.offers.length} hint={doc.config.offers.map((x) => `${x.title} −${x.percent}%`).join(", ") || "None"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Sign-ups · last 30 days">
          <div className="flex h-40 items-end gap-1" role="img" aria-label="Daily sign-ups for the last 30 days">
            {days.map((d) => (
              <div key={d.day} className="group relative flex-1">
                <div className="w-full rounded-t-md bg-fg/80 transition group-hover:bg-fg" style={{ height: `${Math.max(3, (d.count / maxDay) * 150)}px` }} />
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-inv px-2 py-0.5 text-[11px] font-semibold text-inv-fg group-hover:block">{d.day.slice(5)} · {d.count}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Founder cape picks">
          {o.founderByCape.length ? (
            <ul className="flex flex-col gap-3">
              {o.founderByCape.map((c) => (
                <li key={c.id}>
                  <div className="flex justify-between text-[14px] font-semibold"><span>{c.name}</span><span className="text-mute">{c.count}</span></div>
                  <div className="mt-1 h-2.5 rounded-full bg-surface-2"><div className="h-full rounded-full bg-fg" style={{ width: `${(c.count / maxPick) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <Empty>No founder capes claimed yet.</Empty>}
        </Panel>
        <Panel title="Newest accounts">
          {core?.recentUsers?.length ? (
            <ul className="divide-y divide-line">
              {core.recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2.5 text-[14px]">
                  <span className="font-semibold">{u.username}{u.isAdmin && <span className="ml-2 text-[11px] text-dim">ADMIN</span>}</span>
                  <span className="text-dim">{fmtDate(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Loading…</Empty>}
        </Panel>
        <Panel title="Recent purchases">
          {bill?.recent?.length ? (
            <ul className="divide-y divide-line">
              {bill.recent.slice(0, 8).map((p) => (
                <li key={p.transactionId} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                  <span className="min-w-0 truncate"><b>{p.username ?? "?"}</b> · {p.kind === "plus" ? `Native+ ${p.plan}` : p.itemName ?? "cape"}</span>
                  <span className="shrink-0 text-dim">{usd(p.amount)} · {p.status}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>No purchases yet.</Empty>}
        </Panel>
      </div>
    </div>
  );
}
