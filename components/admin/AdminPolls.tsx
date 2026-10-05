"use client";

import { ImagePlus, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Poll } from "@/lib/launch";
import { Badge, Btn, Empty, Field, Panel, adm, fileToBase64, fmtDate, fromLocalInput, input, textarea, toLocalInput, useAction } from "./ui";

type Opt = { label: string; description: string; image: string | null; preview: string | null };
const newOpt = (): Opt => ({ label: "", description: "", image: null, preview: null });
const blank = () => ({ title: "", description: "", kind: "cape", results: "after_vote", status: "open", endsAt: Date.now() + 7 * 86_400_000 as number | null, options: [newOpt(), newOpt(), newOpt()] });

export default function AdminPolls() {
  const [polls, setPolls] = useState<Poll[] | null>(null);
  const [f, setF] = useState(blank);
  const { busy, run } = useAction();
  useEffect(() => {
    adm<{ polls: Poll[] }>("GET", "polls").then((d) => setPolls(d.polls)).catch(() => setPolls([]));
  }, []);
  const setOpt = (i: number, patch: Partial<Opt>) => setF({ ...f, options: f.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) });
  const pickImage = async (i: number, file: File | undefined) => {
    if (!file) return;
    if (file.type !== "image/png") return alert("Use a PNG image.");
    if (file.size > 5 * 1024 * 1024) return alert("Images must be under 5 MB.");
    setOpt(i, { image: await fileToBase64(file), preview: URL.createObjectURL(file) });
  };
  const create = () =>
    run("create", async () => {
      const d = await adm<{ polls: Poll[] }>("POST", "polls", { ...f, options: f.options.map(({ label, description, image }) => ({ label, description, image })) });
      setPolls(d.polls);
      setF(blank());
    }, "Vote created.");
  const patch = (id: string, body: object, ok: string) => run(id, async () => setPolls((await adm<{ polls: Poll[] }>("PATCH", `polls/${id}`, body)).polls), ok);
  const del = (id: string) => confirm("Delete this vote and all its votes?") && run(id, async () => setPolls((await adm<{ polls: Poll[] }>("DELETE", `polls/${id}`)).polls), "Vote deleted.");

  return (
    <div className="flex flex-col gap-6">
      <Panel title="New community vote" sub="Like the Minecraft mob vote: players pick one option (they can switch while it’s open). Great for choosing the next cape."
        actions={<Btn busy={busy === "create"} onClick={create} disabled={f.title.trim().length < 3 || f.options.filter((o) => o.label.trim()).length < 2}><Plus className="h-4 w-4" /> Create vote</Btn>}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Title"><input className={input} maxLength={80} placeholder="Which cape should we make next?" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Closes at" hint="Leave empty to keep it open until you close it."><input type="datetime-local" className={input} value={toLocalInput(f.endsAt)} onChange={(e) => setF({ ...f, endsAt: fromLocalInput(e.target.value) })} /></Field>
          <Field label="Description (optional)"><textarea className={textarea} maxLength={500} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Type">
              <select className={input} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
                <option value="cape">Cape</option><option value="feature">Feature</option><option value="other">Other</option>
              </select>
            </Field>
            <Field label="Results">
              <select className={input} value={f.results} onChange={(e) => setF({ ...f, results: e.target.value })}>
                <option value="after_vote">After voting</option><option value="always">Always</option><option value="after_close">When closed</option>
              </select>
            </Field>
            <Field label="Publish">
              <select className={input} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
                <option value="open">Open now</option><option value="draft">Draft</option>
              </select>
            </Field>
          </div>
        </div>
        <p className="mb-3 mt-6 text-[13px] font-semibold text-mute">Options (2 to 8). Add a PNG concept image for each cape.</p>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {f.options.map((o, i) => (
            <li key={i} className="relative flex gap-3 rounded-2xl border border-line bg-bg p-3">
              <label className="dots flex h-24 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line hover:border-fg" title="Upload PNG">
                {o.preview ? <img src={o.preview} alt="" className="h-full w-full object-contain [image-rendering:pixelated]" /> : <ImagePlus className="h-5 w-5 text-dim" />}
                <input type="file" accept="image/png" className="sr-only" onChange={(e) => pickImage(i, e.target.files?.[0])} />
              </label>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input className={input} maxLength={40} placeholder={`Option ${i + 1}`} value={o.label} onChange={(e) => setOpt(i, { label: e.target.value })} />
                <input className={`${input} h-9 text-[13.5px]`} maxLength={200} placeholder="Short description" value={o.description} onChange={(e) => setOpt(i, { description: e.target.value })} />
              </div>
              {f.options.length > 2 && (
                <button onClick={() => setF({ ...f, options: f.options.filter((_, j) => j !== i) })} aria-label="Remove option" className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-bg text-mute hover:text-fg"><X className="h-3.5 w-3.5" /></button>
              )}
            </li>
          ))}
          {f.options.length < 8 && (
            <li><button onClick={() => setF({ ...f, options: [...f.options, newOpt()] })} className="flex h-full min-h-[120px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-[14px] font-semibold text-mute hover:border-fg hover:text-fg"><Plus className="h-4 w-4" /> Add option</button></li>
          )}
        </ul>
      </Panel>

      <Panel title="All votes">
        {!polls ? <Empty>Loading…</Empty> : polls.length ? (
          <ul className="flex flex-col gap-4">
            {polls.map((p) => {
              const total = p.total ?? 0;
              const st = p.rawStatus === "draft" ? "Draft" : p.status === "open" ? "Open" : "Closed";
              return (
                <li key={p.id} className="rounded-2xl border border-line bg-bg p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-[17px] font-bold">{p.title} <Badge solid={st === "Open"}>{st}</Badge> <Badge>{p.kind}</Badge></p>
                      <p className="mt-1 text-[13px] text-mute">{total} vote{total === 1 ? "" : "s"} · closes {p.endsAt ? fmtDate(p.endsAt) : "manually"} · results {p.results.replace("_", " ")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {st !== "Open" && <Btn variant="ghost" busy={busy === p.id} onClick={() => patch(p.id, { status: "open", ...(p.endsAt && p.endsAt < Date.now() ? { endsAt: Date.now() + 7 * 86_400_000 } : {}) }, "Vote is open.")}>{st === "Draft" ? "Publish" : "Reopen"}</Btn>}
                      {st === "Open" && <Btn variant="ghost" busy={busy === p.id} onClick={() => patch(p.id, { status: "closed" }, "Vote closed.")}>Close now</Btn>}
                      <Btn variant="ghost" onClick={() => confirm("Reset all votes on this poll?") && patch(p.id, { resetVotes: true }, "Votes reset.")} title="Reset votes"><RotateCcw className="h-4 w-4" /></Btn>
                      <Btn variant="danger" onClick={() => del(p.id)} title="Delete"><Trash2 className="h-4 w-4" /></Btn>
                    </div>
                  </div>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {p.options.map((o) => {
                      const pc = total ? Math.round(((o.votes ?? 0) / total) * 100) : 0;
                      return (
                        <li key={o.id} className="flex items-center gap-3">
                          {o.image ? <img src={o.image} alt="" className="h-10 w-10 rounded-lg border border-line object-contain [image-rendering:pixelated]" /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-[14px] font-bold text-dim">{o.label[0]}</span>}
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between text-[13.5px] font-semibold"><span className="truncate">{o.label}</span><span className="text-mute">{o.votes ?? 0} · {pc}%</span></div>
                            <div className="mt-1 h-2 rounded-full bg-surface-2"><div className="h-full rounded-full bg-fg" style={{ width: `${pc}%` }} /></div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        ) : <Empty>No votes yet. Create the first one above and it shows on /vote.</Empty>}
      </Panel>
    </div>
  );
}
