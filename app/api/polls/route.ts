import { NextResponse } from "next/server";
import { api, clearSession, readSession, upstreamHeaders } from "@/lib/server/session";

export const dynamic = "force-dynamic";
const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  const s = await readSession();
  const r = await api("/v1/polls", { method: "GET", headers: upstreamHeaders(req, s ? { Authorization: `Bearer ${s.token}` } : {}) });
  return json({ ok: r.ok, signedIn: !!s, polls: Array.isArray(r.data.polls) ? r.data.polls : [] }, r.ok ? 200 : 502);
}

/** { pollId, optionId } casts (or changes) your vote. */
export async function POST(req: Request) {
  const s = await readSession();
  if (!s) return json({ ok: false, error: "Sign in to vote.", signIn: true }, 401);
  let body: { pollId?: unknown; optionId?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }
  const pollId = String(body.pollId ?? "").replace(/[^a-f0-9]/g, "").slice(0, 24);
  if (!pollId) return json({ ok: false, error: "Pick a vote." }, 400);
  const r = await api(`/v1/polls/${pollId}/vote`, {
    method: "POST",
    headers: upstreamHeaders(req, { Authorization: `Bearer ${s.token}` }),
    body: JSON.stringify({ optionId: String(body.optionId ?? "").slice(0, 24) }),
  });
  if (r.status === 401) {
    await clearSession();
    return json({ ok: false, error: "Your session expired. Sign in again.", signIn: true }, 401);
  }
  if (!r.ok) return json({ ok: false, error: String(r.data.error || "Couldn’t vote.") }, r.status >= 400 ? r.status : 400);
  return json({ ok: true, poll: r.data.poll });
}
