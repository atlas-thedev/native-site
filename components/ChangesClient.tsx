"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Commit } from "@/lib/server/commits";

type Kind = "all" | "feat" | "fix" | "release";
const chips: { id: Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "feat", label: "Features" },
  { id: "fix", label: "Fixes" },
  { id: "release", label: "Releases" },
];

const day = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const time = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default function ChangesClient({ initial, hasMore: more, shippedAt }: { initial: Commit[]; hasMore: boolean; shippedAt: string | null }) {
  const [items, setItems] = useState(initial);
  const [hasMore, setHasMore] = useState(more);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const [kind, setKind] = useState<Kind>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const loadMore = async () => {
    setBusy(true);
    setErr(false);
    try {
      const r = await fetch(`/api/changes?page=${page + 1}`);
      const d = (await r.json()) as { commits: Commit[]; hasMore: boolean };
      setItems((v) => [...v, ...d.commits.filter((c) => !v.some((x) => x.sha === c.sha))]);
      setHasMore(d.hasMore);
      setPage((p) => p + 1);
    } catch {
      setErr(true);
    }
    setBusy(false);
  };

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((c) => (kind === "all" || c.kind === kind) && (!s || c.title.toLowerCase().includes(s) || c.body.toLowerCase().includes(s) || c.author.toLowerCase().includes(s)));
  }, [items, kind, q]);

  const groups = useMemo(() => {
    const out: { key: string; items: Commit[]; unreleased: boolean }[] = [];
    for (const c of shown) {
      const key = day(c.date);
      let g = out[out.length - 1];
      if (!g || g.key !== key) out.push((g = { key, items: [], unreleased: !!shippedAt && +new Date(c.date) > +new Date(shippedAt) }));
      g.items.push(c);
    }
    return out;
  }, [shown, shippedAt]);

  const firstShipped = groups.findIndex((g) => !g.unreleased);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter changes" className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c.id} role="tab" aria-selected={kind === c.id} onClick={() => setKind(c.id)} className={`rounded-full border px-4 py-1.5 text-[13.5px] font-medium transition ${kind === c.id ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute hover:bg-surface-2 hover:text-fg"}`}>
              {c.label}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-[280px]">
          <span className="sr-only">Search changes</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search changes" className="field !h-11 !rounded-full !pl-11 text-[14.5px]" />
        </label>
      </div>

      <div className="mt-10 space-y-12">
        {groups.map((g, gi) => (
          <div key={g.key}>
            {gi === 0 && g.unreleased && <Divider>Coming in the next release</Divider>}
            {gi === firstShipped && firstShipped > 0 && <Divider>Shipped</Divider>}
            <h3 className="mb-4 font-mono text-[12px] uppercase tracking-[0.18em] text-dim">{g.key}</h3>
            <ul className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-surface">
              {g.items.map((c) => {
                const exp = open === c.sha;
                const has = c.body.length > 0;
                return (
                  <li key={c.sha}>
                    <button onClick={() => has && setOpen(exp ? null : c.sha)} aria-expanded={has ? exp : undefined} className={`flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6 ${has ? "cursor-pointer hover:bg-surface" : "cursor-default"}`}>
                      <span className={`mt-0.5 w-[74px] shrink-0 rounded-full border px-2.5 py-0.5 text-center font-mono text-[10.5px] uppercase tracking-wider ${c.kind === "release" ? "border-transparent bg-inv text-inv-fg" : "border-line text-mute"}`}>
                        {c.kind === "other" ? "change" : c.kind === "feat" ? "feature" : c.kind}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15.5px] font-semibold leading-snug tracking-tight">{c.title}</span>
                        <span className="mt-1 block text-[13px] text-dim">
                          {c.author} · {time(c.date)} · <span className="font-mono">{c.sha}</span>
                        </span>
                      </span>
                      {has && <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-dim transition-transform ${exp ? "rotate-180" : ""}`} />}
                    </button>
                    <AnimatePresence initial={false}>
                      {exp && has && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                          <pre className="whitespace-pre-wrap break-words px-5 pb-5 pl-[calc(1.25rem+74px+1rem)] font-sans text-[14px] leading-relaxed text-mute sm:pl-[calc(1.5rem+74px+1rem)]">{c.body}</pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">{items.length === 0 ? "The change log can’t be loaded right now. Please check back soon." : "No changes match your filter."}</p>
        )}
      </div>

      {hasMore && (
        <div className="mt-10 text-center">
          <button onClick={loadMore} disabled={busy} className="inline-flex h-12 items-center rounded-full border border-line px-7 text-[15px] font-semibold transition hover:bg-surface-2 disabled:opacity-50">
            {busy ? "Loading…" : err ? "Try again" : "Load older changes"}
          </button>
        </div>
      )}
    </div>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4 text-[13px] font-semibold">
      <span className="rounded-full bg-inv px-3 py-1 text-inv-fg">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
