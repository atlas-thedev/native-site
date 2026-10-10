"use client";

import { AtSign, Camera, Check, Code2, Copy, Eye, Globe, MessageCircle, PlaySquare, Music2, Radio, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { LINK_LABEL, type PublicProfile, type SocialLink } from "@/lib/profiles";

const ICON: Record<SocialLink["type"], typeof Globe> = { youtube: PlaySquare, twitch: Radio, tiktok: Music2, x: AtSign, instagram: Camera, discord: MessageCircle, github: Code2, website: Globe };

/** UUID, views, friends, bio and social links. Counts a view once per visit. */
export default function ProfileMeta({ profile }: { profile: PublicProfile }) {
  const [views, setViews] = useState(profile.views);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const key = `pv:${profile.name.toLowerCase()}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch {}
    fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "view", name: profile.name }) })
      .then((r) => r.json()).then((d) => typeof d.views === "number" && setViews(d.views)).catch(() => {});
  }, [profile.name]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.uuid); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <div className="mt-6 space-y-4">
      {profile.bio && <p className="whitespace-pre-line text-[15px] leading-relaxed text-mute">{profile.bio}</p>}
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <button type="button" onClick={copy} title="Copy UUID" className="inline-flex max-w-full items-center gap-2 rounded-[8px] border-2 border-line bg-surface px-2.5 py-1.5 font-mono text-[12px] text-dim transition hover:border-fg/40 hover:text-fg">
          <span className="truncate">{profile.uuid}</span>{copied ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-line px-2.5 py-1.5 text-dim"><Eye className="h-3.5 w-3.5" />{views.toLocaleString()} {views === 1 ? "view" : "views"}</span>
        {profile.native && <span className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-line px-2.5 py-1.5 text-dim"><Users className="h-3.5 w-3.5" />{profile.friends} {profile.friends === 1 ? "friend" : "friends"}</span>}
      </div>
      {profile.links.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {profile.links.map((l) => {
            const Icon = ICON[l.type] ?? Globe;
            const isUrl = /^https?:\/\//.test(l.url);
            const inner = <><Icon className="h-4 w-4" />{LINK_LABEL[l.type]}{!isUrl && <span className="text-dim">· {l.url}</span>}</>;
            return (
              <li key={`${l.type}${l.url}`}>
                {isUrl
                  ? <a href={l.url} target="_blank" rel="noopener noreferrer nofollow ugc" className="inline-flex items-center gap-2 rounded-[8px] border-2 border-line bg-surface px-3 py-1.5 text-[13px] font-bold transition hover:border-fg/40">{inner}</a>
                  : <span className="inline-flex items-center gap-2 rounded-[8px] border-2 border-line bg-surface px-3 py-1.5 text-[13px] font-bold">{inner}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
