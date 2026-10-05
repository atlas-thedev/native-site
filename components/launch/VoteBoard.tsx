"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Crown, Loader2, Vote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Countdown from "./Countdown";
import { Bee, Slime, Sparkle } from "./Toons";
import type { Poll } from "@/lib/launch";

const pct = (n: number | null, total: number | null) => (n == null || !total ? 0 : Math.round((n / total) * 100));

function PollCard({ poll, signedIn, onChange }: { poll: Poll; signedIn: boolean; onChange: (p: Poll) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const open = poll.status === "open";
  const top = poll.showResults ? Math.max(...poll.options.map((o) => o.votes ?? 0)) : -1;

  const vote = async (optionId: string) => {
    if (!signedIn) return void (window.location.href = "/login?next=/vote");
    setBusy(optionId);
    setErr("");
    try {
      const r = await fetch("/api/polls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pollId: poll.id, optionId }) });
      const d = await r.json().catch(() => ({}));
      if (d.signIn) return void (window.location.href = "/login?next=/vote");
      if (!d.ok) throw new Error(d.error || "Couldn’t vote.");
      onChange(d.poll);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t vote.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="card p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[640px]">
          <p className="flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-wider text-dim">
            <span className={`h-2 w-2 rounded-full ${open ? "bg-fg [animation:pulse-soft_1.4s_infinite]" : "bg-dim"}`} /> {open ? "Voting open" : "Voting closed"}
            {poll.total != null && <span>· {poll.total.toLocaleString()} {poll.total === 1 ? "vote" : "votes"}</span>}
          </p>
          <h2 className="mt-3 text-[clamp(1.7rem,3.4vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">{poll.title}</h2>
          {poll.description && <p className="mt-2 text-mute">{poll.description}</p>}
        </div>
        {open && poll.endsAt && (
          <div className="flex flex-col items-end">
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">Closes in</p>
            <Countdown at={poll.endsAt} size="sm" className="mt-2" />
          </div>
        )}
      </header>

      <ul className={`mt-8 grid gap-4 ${poll.options.length === 2 ? "sm:grid-cols-2" : poll.options.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {poll.options.map((o) => {
          const mine = poll.myVote === o.id;
          const p = pct(o.votes, poll.total);
          const win = !open && poll.showResults && (o.votes ?? 0) === top && top > 0;
          return (
            <li key={o.id} className={`relative flex flex-col overflow-hidden rounded-[22px] border transition ${mine ? "border-fg" : "border-line"} bg-surface`}>
              <div className="dots relative flex aspect-[4/3] items-center justify-center">
                {o.image ? (
                  <img src={o.image} alt="" className="cutout-sm max-h-[80%] max-w-[80%] object-contain [image-rendering:pixelated]" />
                ) : (
                  <span className="text-[64px] font-extrabold tracking-tight text-dim">{o.label.slice(0, 1)}</span>
                )}
                {win && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-inv px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-inv-fg"><Crown className="h-3.5 w-3.5" /> Winner</span>}
                {mine && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-inv px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-inv-fg"><Check className="h-3.5 w-3.5" strokeWidth={3} /> Your vote</span>}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-[18px] font-extrabold tracking-tight">{o.label}</p>
                {o.description && <p className="mt-1 text-[14px] text-mute">{o.description}</p>}
                {poll.showResults && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[13px] font-semibold"><span>{p}%</span><span className="text-dim">{(o.votes ?? 0).toLocaleString()}</span></div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-2">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-fg" />
                    </div>
                  </div>
                )}
                <div className="mt-auto pt-4">
                  {open && (
                    <button
                      onClick={() => vote(o.id)}
                      disabled={!!busy || mine}
                      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14.5px] font-semibold transition disabled:opacity-70 ${mine ? "border border-line" : "bg-inv text-inv-fg hover:opacity-85"}`}
                    >
                      {busy === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : mine ? <Check className="h-4 w-4" /> : <Vote className="h-4 w-4" />}
                      {mine ? "Voted" : poll.myVote ? `Switch to ${o.label}` : signedIn ? `Vote ${o.label}` : "Sign in to vote"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <AnimatePresence>{err && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert" className="mt-4 text-[14px] font-semibold">{err}</motion.p>}</AnimatePresence>
      {open && !poll.showResults && <p className="mt-5 text-[13.5px] text-dim">{poll.results === "after_close" ? "Results are revealed when voting closes." : "Vote to see the results."}</p>}
      {!signedIn && open && <p className="mt-5 text-[13.5px] text-dim">One Native account, one vote. <Link href="/register?next=/vote" className="font-semibold text-fg underline underline-offset-4">Create a free account</Link></p>}
    </article>
  );
}

/** Community votes: pick the next capes (and anything else the team asks). */
export default function VoteBoard({ initial, signedIn }: { initial: Poll[]; signedIn: boolean }) {
  const [polls, setPolls] = useState(initial);
  const openCount = polls.filter((p) => p.status === "open").length;
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-32 pt-14 sm:pt-20">
      <header className="relative mb-12 overflow-hidden rounded-[28px] border border-line px-6 py-14 text-center">
        <div className="dots pointer-events-none absolute inset-0" aria-hidden />
        <Slime className="pointer-events-none absolute -bottom-2 left-4 hidden w-[90px] sm:block" />
        <div className="toon-buzz pointer-events-none absolute left-[10%] top-6 hidden sm:block"><Bee className="w-12" /></div>
        <Sparkle className="toon-twinkle pointer-events-none absolute right-[12%] top-10 w-5" />
        <div className="relative">
          <p className="eyebrow">Community vote</p>
          <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[1] tracking-[-0.045em]">You pick what’s next.</h1>
          <p className="mx-auto mt-5 max-w-[560px] text-lg text-mute">Vote on the next Native capes and features. One account, one vote — the winner gets made.</p>
          <p className="mt-6 text-[13.5px] font-semibold text-dim">{openCount ? `${openCount} ${openCount === 1 ? "vote is" : "votes are"} open right now` : "No votes open right now"}</p>
        </div>
      </header>
      {polls.length ? (
        <div className="flex flex-col gap-6">
          {polls.map((p) => (
            <PollCard key={p.id} poll={p} signedIn={signedIn} onChange={(n) => setPolls((all) => all.map((x) => (x.id === n.id ? n : x)))} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <p className="text-[22px] font-extrabold tracking-tight">The first vote is coming soon.</p>
          <p className="mt-2 max-w-[440px] text-mute">Join the Discord or check back — you’ll help decide the next Native cape.</p>
        </div>
      )}
    </div>
  );
}
