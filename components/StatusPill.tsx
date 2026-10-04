"use client";

import { useEffect, useState } from "react";

export default function StatusPill() {
  const [s, setS] = useState<{ ok: boolean; ms: number | null } | null>(null);
  useEffect(() => {
    let dead = false;
    const run = () => fetch("/api/status", { cache: "no-store" }).then((r) => r.json()).then((d) => !dead && setS(d)).catch(() => !dead && setS({ ok: false, ms: null }));
    run();
    const id = setInterval(run, 60000);
    return () => { dead = true; clearInterval(id); };
  }, []);
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-line bg-surface py-2 pl-4 pr-5 text-[14px]" role="status" aria-live="polite">
      <span className={`h-2.5 w-2.5 rounded-full ${s === null ? "bg-dim" : s.ok ? "bg-fg" : "border-2 border-fg"}`} style={s === null ? { animation: "pulse-soft 1.4s ease-in-out infinite" } : undefined} />
      <span className="font-semibold">{s === null ? "Checking Native services…" : s.ok ? "All Native services are online" : "Native services are unreachable"}</span>
      {s?.ok && s.ms !== null && <span className="font-mono text-[12px] text-dim">{s.ms} ms</span>}
    </div>
  );
}
