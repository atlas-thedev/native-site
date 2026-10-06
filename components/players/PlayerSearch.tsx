import { Search } from "lucide-react";

/** Plain GET form: works without JavaScript, and the page redirects when the name matches exactly. */
export default function PlayerSearch({ q, className = "" }: { q?: string; className?: string }) {
  return (
    <form action="/players" method="get" role="search" className={`st-search ${className}`}>
      <Search aria-hidden className="h-4 w-4 shrink-0 text-dim" />
      <input name="q" defaultValue={q} placeholder="Search a player name…" aria-label="Search players" autoComplete="off" spellCheck={false} maxLength={32} />
      <button type="submit" className="pxb is-sm"><span className="pxb-face">Search</span></button>
    </form>
  );
}
