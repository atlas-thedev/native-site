import ProfileBadges from "./ProfileBadges";
import SkinStage from "../skins/SkinStage";
import ProfileMeta from "./ProfileMeta";
import SkinDownload from "../skins/SkinDownload";
import type { PublicProfile } from "@/lib/profiles";

/** A Minecraft Java player who isn't on Native: their real skin and cape, straight from Mojang. */
export default function McProfileView({ profile }: { profile: PublicProfile }) {
  const skin = profile.current?.url ?? "/skins/steve.png";
  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="st-panel relative overflow-hidden !bg-black">
        <SkinStage skin={skin} model={profile.current?.model ?? "default"} cape={profile.mojangCape} zoom={0.56} />
      </div>
      <div className="st-panel p-6">
        <h1 className="truncate text-[clamp(2rem,4vw,2.9rem)] font-extrabold leading-none tracking-[-0.035em]">{profile.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ProfileBadges premium />
          {profile.mojangCape && <span className="st-tag">Has a Minecraft cape</span>}
          <span className="text-[13px] text-dim">Not on Native yet</span>
        </div>
        <ProfileMeta profile={profile} />
        {profile.current && <div className="mt-6 flex flex-wrap gap-2.5"><SkinDownload url={profile.current.url} name={profile.name} /></div>}
        {profile.mojangCape && (
          <div className="st-sep mt-6 pt-5">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-dim">Minecraft cape</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.mojangCape} alt="Minecraft cape texture" className="mt-3 h-20 w-auto rounded-[6px] border-2 border-line bg-black/40 p-1 [image-rendering:pixelated]" />
          </div>
        )}
      </div>
    </section>
  );
}
