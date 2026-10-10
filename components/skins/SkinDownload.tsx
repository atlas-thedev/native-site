"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";

/** Saves the skin PNG (cross-origin safe: fetched as a blob) and copies its texture URL. */
export default function SkinDownload({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const save = async () => {
    try {
      const blob = await (await fetch(url)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${name}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch {
      window.open(url, "_blank", "noopener");
    }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <>
      <button type="button" onClick={save} className="pxb"><span className="pxb-face"><Download /> Download</span></button>
      <button type="button" onClick={copy} className="pxb is-ghost"><span className="pxb-face">{copied ? <><Check /> Copied</> : <><Copy /> Copy URL</>}</span></button>
    </>
  );
}
