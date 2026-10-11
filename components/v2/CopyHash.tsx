"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyHash({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {}
  };
  return (
    <button onClick={copy} className="v-btn is-sm" aria-label={`${label}: ${value}`}>
      {done ? <Check /> : <Copy />} {done ? "Copied" : label}
    </button>
  );
}
