import VoteBoard from "@/components/launch/VoteBoard";
import { API_URL } from "@/lib/server/config";
import { readSession } from "@/lib/server/session";
import { pageMeta } from "@/lib/seo";
import type { Poll } from "@/lib/launch";

export const dynamic = "force-dynamic";
export const metadata = pageMeta({
  title: "Community vote",
  description: "Vote on the next Native capes and features. One account, one vote. The community decides what we make next.",
  path: "/vote",
});

export default async function VotePage() {
  const s = await readSession();
  let polls: Poll[] = [];
  try {
    const r = await fetch(`${API_URL}/v1/polls`, { headers: s ? { Authorization: `Bearer ${s.token}` } : {}, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (r.ok) polls = ((await r.json()).polls ?? []) as Poll[];
  } catch {}
  return <VoteBoard initial={polls} signedIn={!!s} />;
}
