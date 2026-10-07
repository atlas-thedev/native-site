"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Clock,
  Crown,
  ExternalLink,
  Bug,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Btn,
  Empty,
  Field,
  Panel,
  Stat,
  Toggle,
  adm,
  fmtDate,
  fromLocalInput,
  input,
  textarea,
  toLocalInput,
  useAction,
} from "./ui";
import type { Shared } from "./AdminApp";
import AdminBetaUpdates from "./AdminBetaUpdates";
import type { BetaAnswers } from "@/lib/launch";

type Status = "pending" | "approved" | "waitlist" | "rejected";
type App = {
  id: string;
  status: Status;
  answers: BetaAnswers;
  createdAt: number;
  updatedAt: number;
  reviewedAt: number | null;
  note: string | null;
  userId: string;
  username: string;
  email: string | null;
  accountCreatedAt: number | null;
  badges: string[];
  reviewedBy: string | null;
};
type Counts = Record<Status | "all", number>;
type Resp = {
  applications: App[];
  counts: Counts;
  open: boolean;
  settings: { open: boolean; closesAt: number | null; maxTesters: number };
};

const FILTERS: [Status | "all", string][] = [
  ["pending", "To review"],
  ["approved", "Accepted"],
  ["waitlist", "Waitlist"],
  ["rejected", "Rejected"],
  ["all", "All"],
];
const LABEL: Record<Status, string> = {
  pending: "Pending",
  approved: "Accepted",
  waitlist: "Waitlist",
  rejected: "Rejected",
};
const PLATFORM: Record<string, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

/** Review Super Beta Tester applications. Accepting grants the badge, cape and lifetime Native+; anything else takes them back. */
export default function AdminBeta({ doc, setDoc }: Shared) {
  const [filter, setFilter] = useState<Status | "all">("pending");
  const [q, setQ] = useState("");
  const [data, setData] = useState<Resp | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { busy, run } = useAction();

  const load = useCallback(async () => {
    const d = await adm<Resp>(
      "GET",
      `beta?status=${filter}&q=${encodeURIComponent(q)}`,
    );
    setData(d);
    setSel((s) =>
      s && d.applications.some((a) => a.id === s)
        ? s
        : (d.applications[0]?.id ?? null),
    );
  }, [filter, q]);
  useEffect(() => {
    const t = setTimeout(
      () => {
        load().catch(() => {});
      },
      q ? 250 : 0,
    );
    return () => clearTimeout(t);
  }, [load, q]);

  const cur = useMemo(
    () => data?.applications.find((a) => a.id === sel) ?? null,
    [data, sel],
  );
  useEffect(() => {
    setNote(cur?.note ?? "");
  }, [cur?.id, cur?.note]);

  const decide = (status: Status) =>
    cur &&
    run(
      status,
      async () => {
        const r = await adm<{ application: App; counts: Counts }>(
          "PATCH",
          `beta/${cur.id}`,
          { status, note },
        );
        setData(
          (d) =>
            d && {
              ...d,
              counts: r.counts,
              applications:
                filter === "all" || filter === status
                  ? d.applications.map((a) =>
                      a.id === r.application.id ? r.application : a,
                    )
                  : d.applications.filter((a) => a.id !== r.application.id),
            },
        );
        if (filter !== "all" && filter !== status) {
          const rest = data?.applications.filter((a) => a.id !== cur.id) ?? [];
          setSel(rest[0]?.id ?? null);
        }
      },
      status === "approved"
        ? `${cur.username} is a Super Beta Tester now. Badge, cape and Native+ granted.`
        : status === "rejected"
          ? `${cur.username} rejected.`
          : status === "waitlist"
            ? `${cur.username} waitlisted.`
            : "Moved back to pending.",
    );
  const remove = () =>
    cur &&
    confirm(
      `Delete ${cur.username}’s application?${cur.status === "approved" ? " Their beta perks will be taken back." : ""}`,
    ) &&
    run(
      "del",
      async () => {
        const r = await adm<{ counts: Counts }>("DELETE", `beta/${cur.id}`);
        setData(
          (d) =>
            d && {
              ...d,
              counts: r.counts,
              applications: d.applications.filter((a) => a.id !== cur.id),
            },
        );
        setSel(null);
      },
      "Application deleted.",
    );

  const beta = doc?.settings.beta ??
    data?.settings ?? { open: true, closesAt: null, maxTesters: 0 };
  const saveBeta = (patch: Partial<typeof beta>) =>
    run(
      "beta-settings",
      async () => {
        const d = await adm<NonNullable<Shared["doc"]>>("POST", "site", {
          beta: patch,
        });
        setDoc(d);
        await load();
      },
      "Beta settings saved.",
    );

  const c = data?.counts;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="To review"
          value={c?.pending ?? "–"}
          hint={
            data
              ? data.open
                ? "Applications open"
                : "Applications closed"
              : undefined
          }
        />
        <Stat
          label="Super Beta Testers"
          value={c?.approved ?? "–"}
          hint={beta.maxTesters ? `of ${beta.maxTesters} spots` : "No limit"}
        />
        <Stat label="Waitlist" value={c?.waitlist ?? "–"} />
        <Stat
          label="All applications"
          value={c?.all ?? "–"}
          hint={c ? `${c.rejected} rejected` : undefined}
        />
      </div>

      <AdminBetaUpdates />

      <Panel
        title="Applications"
        sub="Accept to give the Super Beta Tester badge, cape and Native+ forever. Rejecting or waitlisting an accepted tester takes them back."
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {FILTERS.map(([id, l]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition ${filter === id ? "bg-inv text-inv-fg" : "border border-line text-mute hover:text-fg"}`}
            >
              {l}
              {c && (
                <span
                  className={`rounded-full px-1.5 text-[11.5px] ${filter === id ? "bg-inv-fg/15" : "bg-surface-2"}`}
                >
                  {c[id]}
                </span>
              )}
            </button>
          ))}
          <label className="relative ml-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
            <input
              className={`${input} h-9 pl-9 text-[14px]`}
              placeholder="Search name, Discord, answers…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>

        {!data ? (
          <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
        ) : !data.applications.length ? (
          <Empty>
            {filter === "pending"
              ? "Inbox zero. No applications waiting."
              : "Nothing here."}
          </Empty>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
            <ul className="flex max-h-[680px] flex-col gap-1.5 overflow-y-auto pr-1">
              {data.applications.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => setSel(a.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${sel === a.id ? "border-fg bg-bg" : "border-transparent hover:bg-bg"}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-[14px] font-extrabold uppercase">
                      {a.username.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[14.5px] font-bold">
                          {a.username}
                        </span>
                        {a.status !== "pending" && (
                          <Badge solid={a.status === "approved"}>
                            {LABEL[a.status]}
                          </Badge>
                        )}
                      </span>
                      <span className="block truncate text-[12.5px] text-dim">
                        {a.answers.discord} ·{" "}
                        {PLATFORM[a.answers.platform] ?? "–"} ·{" "}
                        {a.answers.hours >= 40 ? "40+" : a.answers.hours}h/wk
                      </span>
                    </span>
                    <span className="shrink-0 text-[11.5px] text-dim">
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <AnimatePresence mode="wait">
              {cur && (
                <motion.article
                  key={cur.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-[20px] border border-line bg-bg p-5 sm:p-6"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-[22px] font-extrabold tracking-tight">
                        {cur.username}{" "}
                        <Badge solid={cur.status === "approved"}>
                          {LABEL[cur.status]}
                        </Badge>
                      </h3>
                      <p className="mt-1 text-[13px] text-mute">
                        {cur.email ?? "no email"} · account since{" "}
                        {fmtDate(cur.accountCreatedAt)}
                      </p>
                      <p className="text-[13px] text-mute">
                        Applied {fmtDate(cur.createdAt)}
                        {cur.updatedAt !== cur.createdAt
                          ? ` · edited ${fmtDate(cur.updatedAt)}`
                          : ""}
                      </p>
                      {cur.reviewedAt && (
                        <p className="text-[13px] text-mute">
                          Reviewed {fmtDate(cur.reviewedAt)}
                          {cur.reviewedBy ? ` by ${cur.reviewedBy}` : ""}
                        </p>
                      )}
                    </div>
                  </header>

                  <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {[
                      ["Discord", cur.answers.discord],
                      ["Age", cur.answers.age || "–"],
                      ["Platform", PLATFORM[cur.answers.platform] ?? "–"],
                      ["Time zone", cur.answers.timezone || "–"],
                      ["PC", cur.answers.specs || "–"],
                      [
                        "Hours a week",
                        cur.answers.hours >= 40
                          ? "40+"
                          : String(cur.answers.hours),
                      ],
                      ["Versions", cur.answers.versions.join(", ") || "–"],
                      ["Plays", cur.answers.playstyle.join(", ") || "–"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">
                          {k}
                        </dt>
                        <dd className="mt-0.5 break-words text-[14.5px] font-medium">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">
                        Why they want in
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">
                        {cur.answers.why}
                      </p>
                    </div>
                    {cur.answers.experience && (
                      <div>
                        <p className="text-[11.5px] font-semibold uppercase tracking-wider text-dim">
                          Testing experience
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">
                          {cur.answers.experience}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t border-line pt-5">
                    <Field
                      label="Note to the player"
                      hint="Shown to them on the beta page with the decision."
                    >
                      <textarea
                        className={`${textarea} min-h-[70px]`}
                        maxLength={400}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Welcome aboard! Check Discord for the testers channel."
                      />
                    </Field>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Btn
                        onClick={() => decide("approved")}
                        busy={busy === "approved"}
                        disabled={!!busy || cur.status === "approved"}
                      >
                        <Check className="h-4 w-4" /> Accept
                      </Btn>
                      <Btn
                        variant="ghost"
                        onClick={() => decide("waitlist")}
                        busy={busy === "waitlist"}
                        disabled={!!busy || cur.status === "waitlist"}
                      >
                        <Clock className="h-4 w-4" /> Waitlist
                      </Btn>
                      <Btn
                        variant="ghost"
                        onClick={() => decide("rejected")}
                        busy={busy === "rejected"}
                        disabled={!!busy || cur.status === "rejected"}
                      >
                        <X className="h-4 w-4" /> Reject
                      </Btn>
                      {cur.status !== "pending" && (
                        <Btn
                          variant="ghost"
                          onClick={() => decide("pending")}
                          busy={busy === "pending"}
                          disabled={!!busy}
                        >
                          Back to pending
                        </Btn>
                      )}
                      {cur.note !== (note || null) &&
                        cur.status !== "pending" && (
                          <Btn
                            variant="ghost"
                            onClick={() => decide(cur.status)}
                            busy={busy === cur.status}
                            disabled={!!busy}
                          >
                            Save note
                          </Btn>
                        )}
                      <Btn
                        variant="danger"
                        onClick={remove}
                        busy={busy === "del"}
                        disabled={!!busy}
                        className="ml-auto"
                        title="Delete application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Btn>
                    </div>
                    {cur.status === "approved" && (
                      <p className="mt-4 flex items-center gap-2 text-[13px] text-mute">
                        <Crown className="h-4 w-4" /> Has the Super Beta Tester
                        badge, cape and lifetime Native+.
                      </p>
                    )}
                  </div>
                </motion.article>
              )}
            </AnimatePresence>
          </div>
        )}
      </Panel>

      <Panel
        title="Program settings"
        sub="Open or close applications. Existing applications can always be reviewed."
        actions={
          <Btn
            variant={beta.open ? "danger" : "primary"}
            onClick={() => saveBeta({ open: !beta.open })}
            busy={busy === "beta-settings"}
          >
            {beta.open ? (
              <>
                <X className="h-4 w-4" /> Close applications
              </>
            ) : (
              <>
                <Bug className="h-4 w-4" /> Open applications
              </>
            )}
          </Btn>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Toggle
            on={beta.open}
            onChange={(v) => saveBeta({ open: v })}
            label="Accept applications"
            hint={
              beta.open
                ? "The form is live on /beta"
                : "The form shows “closed”"
            }
            disabled={busy === "beta-settings"}
          />
          <Field
            label="Close automatically at"
            hint="Leave empty to keep it open."
          >
            <input
              type="datetime-local"
              className={input}
              defaultValue={toLocalInput(beta.closesAt)}
              onBlur={(e) => {
                const v = fromLocalInput(e.target.value);
                if (v !== beta.closesAt) saveBeta({ closesAt: v });
              }}
            />
          </Field>
          <Field
            label="Max Super Beta Testers"
            hint="0 = no limit. The form closes when it’s full."
          >
            <input
              type="number"
              min={0}
              className={input}
              defaultValue={beta.maxTesters || 0}
              onBlur={(e) => {
                const v = Math.max(0, Number(e.target.value) || 0);
                if (v !== beta.maxTesters) saveBeta({ maxTesters: v });
              }}
            />
          </Field>
        </div>
        <a
          href="/beta"
          target="_blank"
          className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-mute hover:text-fg"
        >
          <Bug className="h-4 w-4" /> Open the beta page{" "}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Panel>
    </div>
  );
}
