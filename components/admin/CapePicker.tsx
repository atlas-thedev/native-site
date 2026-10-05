"use client";

import { Check } from "lucide-react";
import CapeStrip from "../CapeStrip";
import type { AdminItem } from "./types";

/** Multi-select grid of capes. */
export default function CapePicker({ items, value, onChange, max }: { items: AdminItem[]; value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const toggle = (id: string) => {
    if (value.includes(id)) return onChange(value.filter((x) => x !== id));
    if (max && value.length >= max) return onChange([...value.slice(1), id]);
    onChange([...value, id]);
  };
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-6">
      {items.map((it) => {
        const on = value.includes(it.id);
        return (
          <li key={it.id}>
            <button type="button" onClick={() => toggle(it.id)} aria-pressed={on} className={`relative flex w-full flex-col items-center rounded-2xl border p-2.5 transition ${on ? "border-fg bg-surface-2" : "border-line hover:bg-surface-2"} ${it.hidden ? "opacity-50" : ""}`}>
              <CapeStrip strip={it.animated ? it.stripUrl : null} still={it.stillUrl} frames={it.frames} fps={it.fps} width={40} label={it.name} />
              <span className="mt-1.5 w-full truncate text-center text-[12.5px] font-semibold">{it.name}</span>
              {on && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-inv text-inv-fg"><Check className="h-3 w-3" strokeWidth={3} /></span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
