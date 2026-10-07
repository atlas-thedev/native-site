"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Download,
  ExternalLink,
  FlaskConical,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Btn, Empty, Panel, Stat, Toggle, adm, fmtDate, input, useAction } from "./ui";

type Mode = "on" | "auto" | "off";
type Tester = {
  userId: string;
  username: string;
  accepted: boolean;
  mode: Mode;
  active: boolean;
  note: string | null;
  addedAt: number | null;
  addedBy: string | null;
  lastVersion: string | null;
  lastPlatform: string | null;
  lastSeenAt: number | null;
};
type Rel = {
  version: string;
  name?: string;
  url?: string;
  publishedAt?: string | number | null;
  downloads?: number;
} | null;
type Resp = {
  config: { enabled: boolean; includeAccepted: boolean };
  releases?: { stable: Rel; beta: Rel };
  testers: Tester[];
  stats?: { active: number; seen7d: number; onBeta: number };
};

const PLATFORM: Record<string, string> = { win32: "Windows", darwin: "macOS", linux: "Linux" };
const ago = (ms: number | null) => {
  if (!ms) return "Never";
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(ms);
};
const relDate = (v: string | number | null | undefined) =>
  v ? fmtDate(typeof v === "number" ? v : new Date(v).getTime()) : "";

export default function AdminBetaUpdates() {
  const { busy, run } = useAction();
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [q, setQ] = useState("");
  const [show, setShow] = useState<"all" | "active" | "off">("all");

  const load = useCallback(async () => {
    try {
      setData(await adm<Resp>("GET", "beta/testers"));
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load beta testers.");
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const cfg = data?.config;
  const setCfg = (patch: Partial<Resp["config"]>, msg: string) =>
    run("cfg", async () => {
      await adm("POST", "beta/updates", patch);
      await load();
    }, msg);

  const add = () => {
    const u = name.trim().replace(/^@/, "");
    if (!u) return;
    run("add", async () => {
      await adm("POST", "beta/testers", { username: u, note: note.trim() || undefined });
      setName("");
      setNote("");
      await load();
    }, `${u} now gets beta updates.`);
  };
  const setMode = (t: Tester, enabled: boolean | null, msg: string) =>
    run(`m:${t.userId}`, async () => {
      await adm("PATCH", `beta/testers/${encodeURIComponent(t.userId)}`, { enabled });
      await load();
    }, msg);
  const remove = (t: Tester) =>
    run(`d:${t.userId}`, async () => {
      await adm("DELETE", `beta/testers/${encodeURIComponent(t.userId)}`);
      await load();
    }, `${t.username} removed from beta updates.`);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data?.testers || []).filter(
      (t) =>
        (!s || t.username.toLowerCase().includes(s)) &&
        (show === "all" || (show === "active" ? t.active : !t.active)),
    );
  }, [data, q, show]);

  const beta = data?.releases?.beta;
  const stable = data?.releases?.stable;
  const total = data?.testers.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Beta updates"
          value={cfg ? (cfg.enabled ? "On" : "Off") : "–"}
          hint={cfg ? (cfg.enabled ? "Testers get pre-releases" : "Everyone stays on stable") : undefined}
        />
        <Stat
          label="Active testers"
          value={data?.stats?.active ?? "–"}
          hint={data ? `${total} on the list` : undefined}
        />
        <Stat
          label="Running a beta"
          value={data?.stats?.onBeta ?? "–"}
          hint={data?.stats ? `${data.stats.seen7d} launched in 7 days` : undefined}
        />
        <Stat
          label="Latest beta"
          value={beta ? <span className="text-[22px]">v{beta.version}</span> : "None"}
          hint={stable ? `Stable is v${stable.version}` : undefined}
        />
      </div>

      <Panel
        title="Beta updates"
        sub="Pre-releases (made with release.bat → Beta) only reach the people below. Everyone else keeps getting stable updates."
        actions={
          <Btn variant="ghost" onClick={() => run("reload", load)} busy={busy === "reload"}>
            <RotateCcw className="h-4 w-4" /> Refresh
          </Btn>
        }
      >
        {err && <p className="mb-4 rounded-xl border border-line px-3 py-2 text-[13px] text-mute">{err}</p>}
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            on={!!cfg?.enabled}
            disabled={!cfg || busy === "cfg"}
            onChange={(v) => setCfg({ enabled: v }, v ? "Beta updates turned on." : "Beta updates paused — everyone is on stable.")}
            label="Send beta updates"
            hint="Master switch. Off moves every tester back to stable on their next update check."
          />
          <Toggle
            on={!!cfg?.includeAccepted}
            disabled={!cfg || busy === "cfg"}
            onChange={(v) => setCfg({ includeAccepted: v }, v ? "Accepted Super Beta Testers now get beta updates." : "Only manually added testers get beta updates.")}
            label="Include accepted Super Beta Testers"
            hint="Everyone you accept in Applications below joins automatically."
          />
        </div>

        {(beta || stable) && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[["Beta", beta], ["Stable", stable]].map(([l, r]) => {
              const rel = r as Rel;
              return (
                <div key={l as string} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-dim">{l as string} release</p>
                    <p className="mt-0.5 truncate text-[15px] font-semibold">
                      {rel ? `v${rel.version}` : "None yet"}
                      {rel?.publishedAt ? <span className="ml-2 text-[12.5px] font-normal text-mute">{relDate(rel.publishedAt)}</span> : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[13px] text-mute">
                    {typeof rel?.downloads === "number" && (
                      <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{rel.downloads}</span>
                    )}
                    {rel?.url && (
                      <a href={rel.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-fg">
                        GitHub <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Beta testers" sub="Add anyone by username, or switch individual people on and off. “Auto” follows their beta application.">
        <form
          className="mb-5 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <input className={`${input} sm:max-w-[260px]`} placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={input} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <Btn type="submit" busy={busy === "add"} disabled={!name.trim()} className="shrink-0">
            <UserPlus className="h-4 w-4" /> Add tester
          </Btn>
        </form>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["all", "active", "off"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setShow(id)}
              className={`h-9 rounded-full px-3.5 text-[13.5px] font-semibold transition ${show === id ? "bg-inv text-inv-fg" : "border border-line text-mute hover:text-fg"}`}
            >
              {id === "all" ? "All" : id === "active" ? "Getting betas" : "Paused"}
            </button>
          ))}
          <div className="relative ml-auto w-full sm:w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
            <input className={`${input} h-9 pl-9 text-[14px]`} placeholder="Search testers" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {!data ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[62px] animate-pulse rounded-2xl border border-line bg-bg" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <Empty>{total ? "No testers match." : "No beta testers yet. Add someone above or accept applications below."}</Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {list.map((t) => {
                const onBetaBuild = !!t.lastVersion && t.lastVersion.includes("-");
                return (
                  <motion.li
                    key={t.userId}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-bg px-4 py-3 ${t.active ? "" : "opacity-70"}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${t.active ? "bg-inv text-inv-fg" : "bg-surface-2 text-mute"}`}>
                      <FlaskConical className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                        {t.username}
                        {t.active ? <Badge solid>Beta</Badge> : <Badge>Stable</Badge>}
                        {t.accepted && <Badge>Accepted</Badge>}
                        {t.mode === "on" && !t.accepted && <Badge>Added</Badge>}
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] text-mute">
                        {t.lastVersion ? `v${t.lastVersion}${onBetaBuild ? " (beta)" : ""}` : "Not seen yet"}
                        {t.lastPlatform ? ` · ${PLATFORM[t.lastPlatform] || t.lastPlatform}` : ""}
                        {` · ${ago(t.lastSeenAt)}`}
                        {t.note ? ` · ${t.note}` : ""}
                        {t.addedBy ? ` · added by ${t.addedBy}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-full border border-line p-1">
                      {(["on", "auto", "off"] as const)
                        .filter((m) => m !== "auto" || t.accepted)
                        .map((m) => (
                          <button
                            key={m}
                            disabled={busy === `m:${t.userId}` || t.mode === m}
                            onClick={() =>
                              setMode(
                                t,
                                m === "on" ? true : m === "off" ? false : null,
                                m === "on" ? `${t.username} gets beta updates.` : m === "off" ? `${t.username} paused (stable only).` : `${t.username} follows their application.`,
                              )
                            }
                            className={`h-7 rounded-full px-3 text-[12.5px] font-semibold transition ${t.mode === m ? "bg-inv text-inv-fg" : "text-mute hover:text-fg"}`}
                          >
                            {m === "on" ? "On" : m === "off" ? "Off" : "Auto"}
                          </button>
                        ))}
                    </div>
                    {!t.accepted && (
                      <Btn variant="danger" className="h-9 w-9 px-0" title="Remove" busy={busy === `d:${t.userId}`} onClick={() => remove(t)}>
                        {busy !== `d:${t.userId}` && <Trash2 className="h-4 w-4" />}
                      </Btn>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </Panel>
    </div>
  );
}
