"use client";

import { AnimatePresence, motion } from "motion/react";
import { Eye, Infinity as Lifetime, LogIn, Pencil, User, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { PxLink } from "../ui/Px";

type Props = {
  /** colour of the strip on top */
  color?: string;
  /** "Lifetime", "Free", "Event" */
  kind: string;
  price: ReactNode;
  creator: string;
  signedIn: boolean;
  account: string | null;
  loginHref: string;
  lines: [string, string];
  /** the buttons */
  children: ReactNode;
  msg: { t: "ok" | "err"; s: string } | null;
  foot: string;
  locked?: ReactNode;
};

/** The buy box on every item page: colour strip, price, account, what it does, one big button. */
export default function BuyPanel({ color, kind, price, creator, signedIn, account, loginHref, lines, children, msg, foot, locked }: Props) {
  return (
    <div className="st-panel" style={{ "--c": color } as React.CSSProperties}>
      <div className="st-strip">{[0, 1, 2, 3].map((i) => <i key={i} />)}</div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-dim"><Lifetime className="h-3.5 w-3.5" /> {kind}</p>
            <p className="mt-1.5 text-[34px] font-extrabold leading-none tracking-tight">{price}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-[6px] border-2 border-line bg-surface px-2.5 py-1.5 text-[12px] text-mute">
            <Pencil className="h-3 w-3" /> Creator: <b className="text-fg">{creator}</b>
          </span>
        </div>
        <div className="st-sep my-5" />
        {locked ?? (
          <>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-dim">Account</p>
            <div className="mt-2 flex items-center gap-3 rounded-[8px] border-2 border-line bg-black/20 p-3 shadow-[inset_0_2px_0_rgb(0_0_0/0.3)]">
              <span className="slot-well flex h-10 w-10 shrink-0 items-center justify-center">{signedIn ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold">{signedIn ? account ?? "Signed in" : "Login required"}</p>
                <p className="text-[12px] text-dim">{signedIn ? "Goes straight to your locker" : "Sign in to add items"}</p>
              </div>
              {!signedIn && <PxLink href={loginHref} variant="light" size="sm">Sign in</PxLink>}
            </div>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[12px] text-dim">
              <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{lines[0]}</span>
              <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{lines[1]}</span>
            </p>
            <div className="mt-4 flex flex-col gap-2.5 [&>*]:w-full [&_.pxb]:w-full">{children}</div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-dim"><Zap className="h-3.5 w-3.5" />{foot}</p>
          </>
        )}
        <AnimatePresence mode="wait">
          {msg && (
            <motion.p key={msg.s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role={msg.t === "err" ? "alert" : "status"}
              className={`mt-4 rounded-[8px] border-2 px-3 py-2 text-center text-[13.5px] ${msg.t === "err" ? "border-red-400/30 font-semibold text-fg" : "border-line text-mute"}`}>
              {msg.s}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
