"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Crown, Loader2, Lock, Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Countdown from "./Countdown";
import Sky from "../plus/Sky";
import type { Poll } from "@/lib/launch";

const pct = (n: number | null, total: number | null) => (n == null || !total ? 0 : Math.round((n / total) * 100));
const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

function Option({ poll, o, busy, onVote, signedIn }: { poll: Poll; o: Poll["options"][number]; busy: string | null; onVote: (id: string) => void; signedIn: boolean }) {
  const open = poll.status === "open";
  const mine = poll.myVote === o.id;
  const p = pct(o.votes, poll.total);
  const top = poll.showResults ? Math.max(...poll.options.map((x) => x.votes ?? 0)) : -1;
  const leading = poll.showResults && top > 0 && (o.votes ?? 0) === top;
  const clickable = open && !mine && !busy;

  return (
    <li>
      <button
        type="button"
        onClick={() => clickable && onVote(o.id)}
        disabled={!open || !!busy}
        aria-pressed={mine}
        className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border text-left transition duration-300 ${mine ? "border-fg bg-surface-2" : "border-line bg-surface"} ${clickable ? "hover:-translate-y-1 hover:border-fg/40" : ""} disabled:cursor-default`}
      >
        <div className={`dots relative flex items-center justify-center ${!o.image ? "aspect-[5/2]" : poll.options.length === 2 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          {o.image ? (
            <img src={o.image} alt="" className="cutout-sm max-h-[78%] max-w-[78%] object-contain transition duration-500 [image-rendering:pixelated] group-hover:scale-105" />
          ) : (
            <span className="text-[64px] font-extrabold tracking-tight text-dim">{o.label.slice(0, 1)}</span>
          )}
          <div className="absolute inset-x-3 top-3 flex justify-between gap-2">
            {leading ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-inv px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-inv-fg">
                {open ? <Trophy className="h-3 w-3" /> : <Crown className="h-3 w-3" />} {open ? "Leading" : "Winner"}
              </span>
            ) : <span />}
            {mine && (
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-bg/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
                <Check className="h-3 w-3" strokeWidth={3} /> Your pick
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[18px] font-extrabold tracking-tight">{o.label}</p>
          {o.description && <p className="mt-1 text-[14px] leading-relaxed text-mute">{o.description}</p>}
          {poll.showResults && (
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-[13px] font-semibold">
                <span className="text-[15px] font-extrabold tabular-nums">{p}%</span>
                <span className="text-dim tabular-nums">{plural(o.votes ?? 0, "vote", "votes")}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className={`h-full rounded-full ${mine || leading ? "bg-fg" : "bg-fg/45"}`} />
              </div>
            </div>
          )}
          {open && <span className="min-h-5 flex-1" />}
          {open && (
            <span className={`flex h-11 items-center justify-center gap-2 rounded-full text-[14.5px] font-semibold transition ${mine ? "border border-line text-mute" : "bg-inv text-inv-fg group-hover:opacity-90"}`}>
              {busy === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : mine ? <Check className="h-4 w-4" /> : null}
              {mine ? "You voted for this" : !signedIn ? "Sign in to vote" : poll.myVote ? "Switch my vote" : "Vote for this"}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}

function PollCard({ poll, signedIn, onChange }: { poll: Poll; signedIn: boolean; onChange: (p: Poll) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const open = poll.status === "open";

  const vote = async (optionId: string) => {
    if (!signedIn) return void (window.location.href = "/login?next=/vote");
    setBusy(optionId);
    setErr("");
    const before = poll;
    // show the pick straight away, then settle on what the server says
    onChange({ ...poll, myVote: optionId });
    try {
      const r = await fetch("/api/polls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pollId: poll.id, optionId }) });
      const d = await r.json().catch(() => ({}));
      if (d.signIn) return void (window.location.href = "/login?next=/vote");
      if (!d.ok) throw new Error(d.error || "That vote didn’t go through. Try again.");
      onChange(d.poll);
    } catch (e) {
      onChange(before);
      setErr(e instanceof Error ? e.message : "That vote didn’t go through. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const cols = poll.options.length === 2 ? "sm:grid-cols-2" : poll.options.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  const note = !open
    ? null
    : !signedIn
      ? "One Native account gets one vote."
      : !poll.showResults
        ? poll.results === "after_close"
          ? "Results show up when voting closes."
          : "Vote and the results show up right away."
        : poll.myVote
          ? "Changed your mind? Pick another one any time before it closes."
          : null;

  return (
    <article className="card p-6 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[640px]">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] font-semibold uppercase tracking-wider text-dim">
            <span className={`h-2 w-2 rounded-full ${open ? "bg-fg [animation:pulse-soft_1.4s_infinite]" : "bg-dim"}`} />
            {open ? "Voting open" : "Voting closed"}
            {poll.total != null && <span>· {plural(poll.total, "vote", "votes")}</span>}
          </p>
          <h3 className="mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">{poll.title}</h3>
          {poll.description && <p className="mt-2 leading-relaxed text-mute">{poll.description}</p>}
        </div>
        {open && poll.endsAt && (
          <div className="flex flex-col items-start sm:items-end">
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">Closes in</p>
            <Countdown at={poll.endsAt} size="sm" className="mt-2" />
          </div>
        )}
      </header>

      <ul className={`mt-8 grid gap-4 ${cols}`}>
        {poll.options.map((o) => (
          <Option key={o.id} poll={poll} o={o} busy={busy} onVote={vote} signedIn={signedIn} />
        ))}
      </ul>

      <AnimatePresence>
        {err && (
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-5 rounded-2xl border border-fg px-4 py-3 text-[14px] font-semibold">
            {err}
          </motion.p>
        )}
      </AnimatePresence>
      {note && (
        <p className="mt-5 flex items-center gap-2 text-[13.5px] text-dim">
          {!poll.showResults && <Lock className="h-3.5 w-3.5" />}
          {note}
          {!signedIn && (
            <Link href="/register?next=/vote" className="font-semibold text-fg underline underline-offset-4">
              Create a free account
            </Link>
          )}
        </p>
      )}
    </article>
  );
}

/** Community votes: the open ones first, then the results of the old ones. Refreshes on its own. */
export default function VoteBoard({ initial, signedIn }: { initial: Poll[]; signedIn: boolean }) {
  const [polls, setPolls] = useState(initial);
  const live = polls.filter((p) => p.status === "open");
  const past = polls.filter((p) => p.status !== "open");
  const update = useCallback((n: Poll) => setPolls((all) => all.map((x) => (x.id === n.id ? n : x))), []);

  useEffect(() => {
    if (!live.length) return;
    const t = setInterval(async () => {
      if (document.hidden) return;
      try {
        const d = await fetch("/api/polls", { cache: "no-store" }).then((r) => r.json());
        if (Array.isArray(d.polls)) setPolls(d.polls);
      } catch {}
    }, 20000);
    return () => clearInterval(t);
  }, [live.length]);

  const total = live.reduce((n, p) => n + (p.total ?? 0), 0);

  return (
    <div className="pb-32">
      <section className="relative overflow-hidden border-b border-line">
        <Sky />
        <div className="relative mx-auto max-w-[1180px] px-5 pb-36 pt-20 sm:pt-28 lg:pb-44">
          <p className="eyebrow">Community vote</p>
          <h1 className="mt-5 max-w-[760px] text-[clamp(3rem,7.4vw,6rem)] font-extrabold leading-[0.92] tracking-[-0.05em]">You pick what’s next.</h1>
          <p className="mt-6 max-w-[480px] text-[19px] leading-relaxed text-mute">New capes and features go to a vote. Whatever wins is what we make next.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-bg/70 px-4 text-[14px] font-semibold backdrop-blur">
              <span className={`h-2 w-2 rounded-full ${live.length ? "bg-fg [animation:pulse-soft_1.4s_infinite]" : "bg-dim"}`} />
              {live.length ? `${plural(live.length, "vote", "votes")} open` : "Nothing open right now"}
            </span>
            {live.length > 0 && total > 0 && <span className="text-[14px] text-dim">{plural(total, "vote", "votes")} cast so far</span>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-5">
        {live.length > 0 && (
          <section className="mt-12 flex flex-col gap-6">
            {live.map((p) => (
              <PollCard key={p.id} poll={p} signedIn={signedIn} onChange={update} />
            ))}
          </section>
        )}

        {!live.length && (
          <section className="card mt-12 flex flex-col items-center px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2">
              <Trophy className="h-6 w-6" />
            </span>
            <p className="mt-5 text-[22px] font-extrabold tracking-tight">{past.length ? "No vote is open right now." : "The first vote is on its way."}</p>
            <p className="mt-2 max-w-[440px] text-mute">We post new ones in the Discord the moment they open, so that’s the place to hear about it first.</p>
          </section>
        )}

        {past.length > 0 && (
          <section className="mt-24">
            <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-tight">Past results</h2>
            <p className="mt-1.5 text-mute">What the community picked before.</p>
            <div className="mt-8 flex flex-col gap-6">
              {past.map((p) => (
                <PollCard key={p.id} poll={p} signedIn={signedIn} onChange={update} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
