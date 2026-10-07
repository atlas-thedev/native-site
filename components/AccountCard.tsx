"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import SkinHead from "./SkinHead";

/** Who is signed in, with a sign-out button. Everything you wear is managed in the launcher. */
export default function AccountCard({ name, email, premium, skin }: { name: string; email: string; premium: boolean; skin: string | null }) {
  const [busy, setBusy] = useState(false);
  const signOut = async () => {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/");
  };
  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-10 sm:px-8">
      <div className="flex flex-wrap items-center gap-4 rounded-[24px] border border-line bg-surface p-5 sm:p-6">
        <SkinHead skin={skin} name={name} size={56} className="!rounded-[14px] ring-1 ring-line" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[22px] font-extrabold tracking-tight">{name}</p>
          <p className="flex items-center gap-1.5 truncate text-[14px] text-mute">
            {premium && <ShieldCheck className="h-4 w-4 shrink-0" />}
            {email || (premium ? "Signed in with Microsoft" : "Native account")}
          </p>
        </div>
        <button onClick={signOut} disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[14.5px] font-semibold transition hover:bg-surface-2 disabled:opacity-60">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
