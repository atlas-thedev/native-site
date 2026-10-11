import { ArrowRight, Search } from "lucide-react";

/** Plain GET form: works without JavaScript, and the page redirects when the name matches exactly. */
export default function PlayerSearch({ q, className = "", big = false }: { q?: string; className?: string; big?: boolean }) {
  if (big)
    return (
      <form action="/players" method="get" role="search" className={`v-bigsearch ${className}`}>
        <Search aria-hidden className="h-[clamp(22px,3vw,40px)] w-[clamp(22px,3vw,40px)] shrink-0 text-dim" />
        <input name="q" defaultValue={q} placeholder="Search a player…" aria-label="Search players" autoComplete="off" spellCheck={false} maxLength={32} />
        <button type="submit" className="v-btn is-solid shrink-0" aria-label="Search">
          <span className="hidden sm:inline">Search</span> <ArrowRight />
        </button>
      </form>
    );
  return (
    <form action="/players" method="get" role="search" className={`st-search ${className}`}>
      <Search aria-hidden className="h-4 w-4 shrink-0 text-dim" />
      <input name="q" defaultValue={q} placeholder="Search a player name…" aria-label="Search players" autoComplete="off" spellCheck={false} maxLength={32} />
      <button type="submit" className="pxb is-sm"><span className="pxb-face">Search</span></button>
    </form>
  );
}
