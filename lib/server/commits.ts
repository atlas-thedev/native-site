import { REPO, ghHeaders } from "./config";
import { rebrand } from "./brand";

export type Commit = {
  sha: string;
  title: string;
  body: string;
  kind: "feat" | "fix" | "release" | "other";
  author: string;
  date: string;
};

type GhCommit = { sha: string; commit: { message: string; author: { name: string; date: string } | null } };

export function classify(title: string): Commit["kind"] {
  const t = title.trim();
  if (/^release\b/i.test(t) || /^v?\d+\.\d+\.\d+/.test(t)) return "release";
  if (/^(fix|bug|hotfix|patch|resolve|repair)/i.test(t)) return "fix";
  if (/^(feat|add|new|improve|support|implement|introduce|offline|enable|unlock|redesign|rework|update|upgrade|premium)/i.test(t)) return "feat";
  return "other";
}

const clean = (s: string) =>
  rebrand(s)
    .replace(/https?:\/\/(www\.)?github\.com\S*/gi, "")
    .replace(/\(#\d+\)/g, "")
    .replace(/\bgithub\b/gi, "")
    .replace(/[ \t]{2,}/g, " ").replace(/[ \t]+$/gm, "")
    .trim();

export const COMMITS_REPO = process.env.NATIVE_COMMITS_REPO ?? (REPO === "atlas-thedev/native-client-releases" ? "atlas-thedev/native-client" : REPO);

const hasSinhala = (s: string) => /[\u0D80-\u0DFF]/.test(s);

/** One page of the main-branch history. Returns hasMore when another page exists. */
export async function getCommits(page = 1, perPage = 30): Promise<{ commits: Commit[]; hasMore: boolean }> {
  try {
    const r = await fetch(`https://api.github.com/repos/${COMMITS_REPO}/commits?sha=main&per_page=${perPage}&page=${page}`, { headers: ghHeaders(), next: { revalidate: 600 } });
    if (!r.ok) return { commits: [], hasMore: false };
    const list = (await r.json()) as GhCommit[];
    const commits = list
      .filter((c) => !hasSinhala(c.commit.message) && !hasSinhala(c.commit.author?.name || ""))
      .map((c) => {
        const [first, ...rest] = c.commit.message.split("\n");
        const title = clean(first) || "Update";
        return {
          sha: c.sha.slice(0, 7),
          title,
          body: clean(rest.join("\n")).slice(0, 1600),
          kind: classify(title),
          author: c.commit.author?.name ?? "Native",
          date: c.commit.author?.date ?? "",
        } satisfies Commit;
      });
    return { commits, hasMore: list.length === perPage };
  } catch {
    return { commits: [], hasMore: false };
  }
}
