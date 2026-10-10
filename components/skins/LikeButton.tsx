"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Like / unlike a skin. Optimistic, rolls back if the save fails. */
export default function LikeButton({ hash, initial }: { hash: string; initial: number }) {
  const [likes, setLikes] = useState(initial);
  const [liked, setLiked] = useState(false);
  const [signedIn, setSignedIn] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch(`/api/skins/like?hash=${hash}`).then((r) => r.json()).then((d) => { setLiked(!!d.liked); setLikes(Number(d.likes) || 0); setSignedIn(!!d.signedIn); }).catch(() => {});
  }, [hash]);
  if (!signedIn) return <Link href={`/login?next=/skins/${hash}`} className="pxb is-ghost"><span className="pxb-face"><Heart /> {likes} · Sign in to like</span></Link>;
  const toggle = async () => {
    if (busy) return;
    const next = !liked;
    setBusy(true);
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      const r = await fetch("/api/skins/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hash, like: next }) });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error();
      setLiked(!!d.liked);
      setLikes(Number(d.likes) || 0);
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    }
    setBusy(false);
  };
  return (
    <button type="button" onClick={toggle} aria-pressed={liked} className={`pxb ${liked ? "" : "is-ghost"}`}>
      <span className="pxb-face"><Heart className={liked ? "fill-current" : ""} /> {likes.toLocaleString()} {liked ? "Liked" : "Like"}</span>
    </button>
  );
}
