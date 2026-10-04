import { Fragment } from "react";

/** Tiny, safe markdown renderer for release notes (headings, lists, bold, code). Links are shown as plain text. */
function inline(t: string) {
  const parts = t
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? <strong key={i} className="font-semibold text-fg">{p.slice(2, -2)}</strong>
    : p.startsWith("`") ? <code key={i} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em]">{p.slice(1, -1)}</code>
    : <Fragment key={i}>{p}</Fragment>,
  );
}

export default function Notes({ md }: { md: string }) {
  const lines = md.split(/\r?\n/).filter((l) => !/^\s*\*{0,2}full changelog/i.test(l));
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={out.length} className="my-2 space-y-1.5">{list.map((l, i) => <li key={i} className="flex gap-3"><span className="mt-[0.62em] h-1 w-1 shrink-0 rounded-full bg-dim" />{<span>{inline(l)}</span>}</li>)}</ul>);
    list = [];
  };
  for (const raw of lines) {
    const l = raw.trim();
    if (/^[-*]\s+/.test(l)) { list.push(l.replace(/^[-*]\s+/, "")); continue; }
    flush();
    if (!l) continue;
    const h = l.match(/^#{1,4}\s+(.*)/);
    if (h) out.push(<h4 key={out.length} className="mt-5 text-[15px] font-bold text-fg first:mt-0">{inline(h[1])}</h4>);
    else out.push(<p key={out.length} className="my-2">{inline(l)}</p>);
  }
  flush();
  return <div className="text-[15px] leading-relaxed text-mute">{out}</div>;
}
