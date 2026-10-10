"use client";

import { ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LINK_LABEL, LINK_TYPES, type SocialLink } from "@/lib/profiles";

/** Edit the bio and social links shown on your public profile. */
export default function AboutEditor({ name }: { name: string }) {
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [state, setState] = useState<"loading" | "idle" | "saving" | "saved" | "error">("loading");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d) => { setBio(d.bio ?? ""); setLinks(Array.isArray(d.links) ? d.links : []); setState("idle"); }).catch(() => setState("idle"));
  }, []);
  const save = async () => {
    setState("saving");
    setError("");
    try {
      const r = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "about", bio, links: links.filter((l) => l.url.trim()) }) });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Couldn’t save that.");
      setBio(d.bio ?? "");
      setLinks(d.links ?? []);
      setState("saved");
      setTimeout(() => setState("idle"), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t save that.");
      setState("error");
    }
  };
  const set = (i: number, patch: Partial<SocialLink>) => setLinks((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <section className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-8">
      <div className="st-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-extrabold tracking-tight">Public profile</h2>
            <p className="mt-1 text-[14px] text-mute">Your bio and links show on your profile next to your skin and name history.</p>
          </div>
          <Link href={`/u/${encodeURIComponent(name)}`} className="pxb is-ghost is-sm"><span className="pxb-face"><ExternalLink /> View profile</span></Link>
        </div>
        <label className="mt-5 block">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-dim">Bio</span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 280))} rows={3} disabled={state === "loading"} placeholder="A line or two about you…" className="st-input mt-2 w-full resize-y !py-3" />
          <span className="mt-1 block text-right text-[12px] text-dim">{bio.length}/280</span>
        </label>
        <div className="mt-3">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-dim">Links</span>
          <ul className="mt-2 space-y-2">
            {links.map((l, i) => (
              <li key={i} className="flex flex-wrap gap-2 sm:flex-nowrap">
                <select value={l.type} onChange={(e) => set(i, { type: e.target.value as SocialLink["type"] })} className="st-input sm:w-[150px]" aria-label="Link type">
                  {LINK_TYPES.map((t) => <option key={t} value={t}>{LINK_LABEL[t]}</option>)}
                </select>
                <input value={l.url} onChange={(e) => set(i, { url: e.target.value.slice(0, 200) })} placeholder={l.type === "discord" ? "username" : "https://…"} className="st-input min-w-0 flex-1" aria-label={`${LINK_LABEL[l.type]} link`} />
                <button type="button" onClick={() => setLinks((ls) => ls.filter((_, j) => j !== i))} className="pxb is-ghost is-sm" aria-label="Remove link"><span className="pxb-face"><Trash2 /></span></button>
              </li>
            ))}
          </ul>
          {links.length < 8 && (
            <button type="button" onClick={() => setLinks((ls) => [...ls, { type: "youtube", url: "" }])} className="pxb is-ghost is-sm mt-2"><span className="pxb-face"><Plus /> Add link</span></button>
          )}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={save} disabled={state === "loading" || state === "saving"} className="pxb"><span className="pxb-face"><Save /> {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Save profile"}</span></button>
          {error && <p className="text-[13px] text-[#ff8f8f]">{error}</p>}
        </div>
      </div>
    </section>
  );
}
