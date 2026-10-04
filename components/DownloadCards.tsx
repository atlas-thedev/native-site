"use client";

import { motion } from "motion/react";
import { Download } from "lucide-react";
import { Apple, Linux, Windows } from "./icons";
import { useOS } from "./useOS";
import { platforms, type Platform } from "@/lib/site";

export type Avail = Record<Platform, { name: string; size: number } | null>;
const mb = (n: number) => `${Math.round(n / 1048576)} MB`;

const icons = { windows: Windows, mac: Apple, linux: Linux };

export default function DownloadCards({ version, avail }: { version: string; avail: Avail }) {
  const os = useOS();
  const order: Platform[] = ["windows", "mac", "linux"];
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {order.map((p, i) => {
        const Icon = icons[p];
        const you = p === os;
        const info = platforms[p];
        const file = avail[p];
        return (
          <motion.a
            key={p}
            href={file ? `/api/download/${p}` : undefined}
            aria-disabled={!file}
            download={file ? "" : undefined}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={file ? { y: -6 } : undefined}
            className={`group flex flex-col rounded-[24px] p-8 ${you ? "bg-inv text-inv-fg" : "border border-line bg-surface"} ${file ? "" : "cursor-default"}`}
          >
            <div className="flex items-start justify-between">
              <Icon className="h-9 w-9" />
              {you && <span className="rounded-full border border-current px-3 py-1 text-[11.5px] font-bold opacity-80">Recommended</span>}
            </div>
            <h3 className="mt-8 text-3xl font-extrabold tracking-tight">{info.label}</h3>
            <p className={`mt-1 font-mono text-[12px] ${you ? "opacity-60" : "text-dim"}`}>{info.sub}</p>
            <ul className={`mt-6 space-y-2 text-[15px] ${you ? "opacity-80" : "text-mute"}`}>
              {info.files.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {f}
                </li>
              ))}
            </ul>
            <p className={`mt-4 text-[13.5px] ${you ? "opacity-60" : "text-dim"}`}>{info.note}</p>
            {file && <p className={`mt-1 font-mono text-[11.5px] ${you ? "opacity-50" : "text-dim"}`}>{mb(file.size)}</p>}
            <span className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition ${file ? "group-hover:scale-[1.03]" : "opacity-50"} ${you ? "bg-inv-fg text-inv" : "bg-inv text-inv-fg"}`}>
              {file ? (<><Download className="h-[18px] w-[18px]" /> Download v{version}</>) : "Not published yet"}
            </span>
          </motion.a>
        );
      })}
      {avail.mac && (
        <p className="text-center text-[13.5px] text-dim md:col-span-3">
          macOS download is for Apple Silicon (M1 or newer). On an Intel Mac? <a className="text-fg underline decoration-dim underline-offset-4 hover:decoration-fg" href="/api/download/mac?arch=x64">Get the Intel build</a>.
        </p>
      )}
    </div>
  );
}
