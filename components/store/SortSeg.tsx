"use client";

import { Clock, Flame, Star, Type } from "lucide-react";
import type { SortKey } from "@/lib/store";

const OPTIONS = [
  { id: "featured", label: "Featured", Icon: Star },
  { id: "popular", label: "Most used", Icon: Flame },
  { id: "new", label: "Newest", Icon: Clock },
  { id: "name", label: "A–Z", Icon: Type },
] as const;

/** Segmented sort switch, like the Trending / Most used toggle on laby. */
export default function SortSeg({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <div className="st-seg" role="tablist" aria-label="Sort">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button key={id} role="tab" aria-selected={value === id} className={value === id ? "is-on" : ""} onClick={() => onChange(id)}>
          <Icon /> <span className="max-sm:hidden">{label}</span>
        </button>
      ))}
    </div>
  );
}
