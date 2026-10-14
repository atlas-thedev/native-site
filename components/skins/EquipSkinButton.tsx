"use client";

import { Check, Loader2, Shirt } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EquipSkinButton({ hash, model }: { hash: string; model?: string }) {
  const [wearing, setWearing] = useState(false);
  const [signedIn, setSignedIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/skins/equip?hash=${hash}`)
      .then((r) => r.json())
      .then((d) => {
        setWearing(!!d.wearing);
        setSignedIn(!!d.signedIn);
      })
      .catch(() => {});
  }, [hash]);

  if (!signedIn) {
    return (
      <Link href={`/login?next=/skins/${hash}`} className="pxb is-ghost">
        <span className="pxb-face"><Shirt className="h-4 w-4" /> Sign in to wear</span>
      </Link>
    );
  }

  const equip = async () => {
    if (busy || wearing) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/skins/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash, model }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Failed to equip skin.");
      setWearing(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not equip");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={equip}
      disabled={busy || wearing}
      aria-pressed={wearing}
      className={`pxb ${wearing ? "" : "is-accent"}`}
      title={error || undefined}
    >
      <span className="pxb-face">
        {busy ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Wearing...</>
        ) : wearing ? (
          <><Check className="h-4 w-4" /> Wearing</>
        ) : error ? (
          <span>{error}</span>
        ) : (
          <><Shirt className="h-4 w-4" /> Wear Skin</>
        )}
      </span>
    </button>
  );
}
