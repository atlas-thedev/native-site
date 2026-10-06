"use client";

import { AnimatePresence, motion } from "motion/react";
import { LifeBuoy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useVersion } from "../VersionContext";
import { useLaunch } from "../launch/LaunchContext";

const KEY = "native:toast-dismissed";

/** Bottom-left release toast + bottom-right support pill. */
export default function FloatingWidgets() {
  const version = useVersion();
  const { launch } = useLaunch();
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (launch.prelaunch) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(KEY) === version;
    } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setToast(true), 2600);
    return () => clearTimeout(t);
  }, [version, launch.prelaunch]);

  const close = () => {
    setToast(false);
    try {
      sessionStorage.setItem(KEY, version);
    } catch {}
  };

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="nx-float bottom-5 left-5 hidden w-[320px] rounded-2xl p-4 sm:block"
          >
            <button
              onClick={close}
              aria-label="Dismiss"
              className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full text-dim transition hover:bg-surface-2 hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
            <Link href="/changes" onClick={close} className="block pr-6">
              <span className="eyebrow !text-[10.5px]">New release</span>
              <span className="mt-1.5 block text-[16px] font-bold leading-snug tracking-tight">
                Native Client {version} is out
              </span>
              <span className="mt-1 block text-[13.5px] text-mute">See what changed →</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <Link
        href="/support"
        className="nx-float bottom-5 right-5 inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-mute transition hover:text-fg"
      >
        <LifeBuoy className="h-4 w-4" /> Support
      </Link>
    </>
  );
}
