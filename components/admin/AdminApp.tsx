"use client";

import { BarChart3, FlaskConical, Gift, Megaphone, Rocket, Shirt, Tag, Ticket, Users, Vote } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ToastHost, adm } from "./ui";
import type { AdminItem, SiteDoc } from "./types";
import Overview from "./Overview";
import AdminLaunch from "./AdminLaunch";
import AdminSite from "./AdminSite";
import AdminOffers from "./AdminOffers";
import AdminPolls from "./AdminPolls";
import AdminCapes from "./AdminCapes";
import AdminUsers from "./AdminUsers";
import AdminCodes from "./AdminCodes";
import AdminBeta from "./AdminBeta";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "launch", label: "Launch", icon: Rocket },
  { id: "site", label: "Maintenance & banner", icon: Megaphone },
  { id: "offers", label: "Offers", icon: Tag },
  { id: "votes", label: "Votes", icon: Vote },
  { id: "beta", label: "Beta testers", icon: FlaskConical },
  { id: "capes", label: "Capes", icon: Shirt },
  { id: "users", label: "Users", icon: Users },
  { id: "codes", label: "Codes & gifts", icon: Ticket },
] as const;
type Tab = (typeof TABS)[number]["id"];

export type Shared = { doc: SiteDoc | null; setDoc: (d: SiteDoc) => void; items: AdminItem[]; setItems: (i: AdminItem[]) => void; reload: () => Promise<void> };

export default function AdminApp({ name }: { name: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [doc, setDoc] = useState<SiteDoc | null>(null);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [err, setErr] = useState("");

  const reload = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([adm<SiteDoc & { ok: boolean }>("GET", "site"), adm<{ items: AdminItem[] }>("GET", "store/items")]);
      setDoc(d);
      setItems(s.items ?? []);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t load the dashboard.");
    }
  }, []);

  useEffect(() => {
    const h = window.location.hash.replace("#", "") as Tab;
    if (TABS.some((t) => t.id === h)) setTab(h);
    reload();
  }, [reload]);
  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    window.scrollTo({ top: 0 });
  };

  const shared: Shared = { doc, setDoc, items, setItems, reload };
  const live = doc?.config;
  return (
    <ToastHost>
      <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em]">Native control room</h1>
            <p className="mt-2 text-mute">Signed in as {name}.</p>
          </div>
          {live && (
            <div className="flex flex-wrap gap-2 text-[12.5px] font-semibold">
              <span className={`rounded-full px-3 py-1 ${live.launch.prelaunch ? "bg-inv text-inv-fg" : "border border-line"}`}>{live.launch.prelaunch ? "Pre-launch" : "Launched"}</span>
              {live.maintenance.enabled && <span className="rounded-full bg-inv px-3 py-1 text-inv-fg">Maintenance ON</span>}
              {live.launch.lockStore && <span className="rounded-full border border-line px-3 py-1">Store locked</span>}
              {live.launch.lockDownloads && <span className="rounded-full border border-line px-3 py-1">Downloads locked</span>}
              {live.offers.length > 0 && <span className="rounded-full border border-line px-3 py-1">{live.offers.length} live offer{live.offers.length > 1 ? "s" : ""}</span>}
              <Link href="/" className="rounded-full border border-line px-3 py-1 hover:bg-surface-2">View site ↗</Link>
            </div>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label="Admin sections" className="lg:sticky lg:top-24 lg:self-start">
            <ul className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col">
              {TABS.map((t) => (
                <li key={t.id}>
                  <button onClick={() => go(t.id)} aria-current={tab === t.id ? "page" : undefined}
                    className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-2xl px-4 py-2.5 text-left text-[14.5px] font-semibold transition ${tab === t.id ? "bg-inv text-inv-fg" : "text-mute hover:bg-surface-2 hover:text-fg"}`}>
                    <t.icon className="h-4 w-4" /> {t.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-6 hidden items-center gap-2 px-4 text-[12.5px] text-dim lg:flex"><Gift className="h-3.5 w-3.5" /> Changes go live within ~15s.</p>
          </nav>

          <main className="min-w-0">
            {err && <p role="alert" className="mb-5 rounded-2xl border border-fg px-4 py-3 text-[14px] font-semibold">{err}</p>}
            {!doc && !err ? (
              <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-28 animate-pulse rounded-[20px] bg-surface" />)}</div>
            ) : tab === "overview" ? <Overview {...shared} />
              : tab === "launch" ? <AdminLaunch {...shared} />
              : tab === "site" ? <AdminSite {...shared} />
              : tab === "offers" ? <AdminOffers {...shared} />
              : tab === "votes" ? <AdminPolls />
              : tab === "beta" ? <AdminBeta {...shared} />
              : tab === "capes" ? <AdminCapes {...shared} />
              : tab === "users" ? <AdminUsers items={items} />
              : <AdminCodes items={items} />}
          </main>
        </div>
      </div>
    </ToastHost>
  );
}
