import { History, Shirt } from "lucide-react";
import SkinCard from "../skins/SkinCard";
import { day, type PublicProfile } from "@/lib/profiles";

/** Name history timeline and every skin this player has been seen wearing. */
export default function ProfileHistory({ profile }: { profile: PublicProfile }) {
  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="st-panel p-5">
        <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-dim"><History className="h-4 w-4" /> Name history</h2>
        {profile.names.length ? (
          <ol className="mt-4 space-y-0">
            {profile.names.map((n, i) => (
              <li key={`${n.name}${n.at}`} className="relative flex items-center justify-between gap-3 border-l-2 border-line py-2.5 pl-4">
                <span className={`absolute -left-[7px] h-3 w-3 rounded-full border-2 ${i === 0 ? "border-fg bg-fg" : "border-line bg-bg"}`} />
                <span className={`truncate text-[15px] ${i === 0 ? "font-extrabold" : "font-semibold text-mute"}`}>{n.name}</span>
                <span className="shrink-0 text-[12px] text-dim">{i === profile.names.length - 1 ? (profile.native ? "Joined " : "Seen ") : "Changed "}{day(n.at)}</span>
              </li>
            ))}
          </ol>
        ) : <p className="mt-4 text-[14px] text-mute">No names recorded yet.</p>}
        {!profile.native && <p className="mt-4 text-[12px] leading-relaxed text-dim">Mojang no longer publishes name history, so Native records names from the moment a player is first looked up here.</p>}
      </div>
      <div>
        <h2 className="st-h2 flex items-center gap-3"><Shirt className="h-5 w-5" /> Skin history <span className="text-[14px] font-semibold text-dim">{profile.skins.length}</span></h2>
        {profile.skins.length ? (
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {profile.skins.map((s, i) => (
              <li key={s.hash}><SkinCard skin={s} caption={i === 0 ? "Current" : day(s.lastSeen)} /></li>
            ))}
          </ul>
        ) : <div className="st-panel mt-4 p-10 text-center text-[15px] text-mute">No skins recorded yet.</div>}
      </div>
    </section>
  );
}
