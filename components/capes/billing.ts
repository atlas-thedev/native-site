"use client";

export type PlusState = { active: boolean; status: string | null; plan: string | null; renewsAt: number | null; endsAt: number | null };
export type Purchase = { transactionId: string; kind: string; itemId: string | null; plan: string | null; amount: number; currency: string; status: string; createdAt: number };
export type BillingConfig = { enabled?: boolean; environment?: string; clientToken?: string | null; plus?: { monthly: { amount: number; available: boolean }; yearly: { amount: number; available: boolean } } };
export type BillingState = { signedIn: boolean; config: BillingConfig; plus: PlusState | null; purchases: Purchase[] };

export async function getBilling(): Promise<BillingState> {
  const r = await fetch("/api/billing", { cache: "no-store" });
  const d = await r.json().catch(() => ({}));
  return { signedIn: !!d.signedIn, config: d.config ?? {}, plus: d.plus ?? null, purchases: Array.isArray(d.purchases) ? d.purchases : [] };
}

async function post(body: Record<string, unknown>) {
  const r = await fetch("/api/billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (d.expired || d.signIn) {
    window.location.href = "/login";
    throw new Error(d.error || "Sign in first.");
  }
  if (!d.ok) throw new Error(d.error || "Something went wrong. Try again.");
  return d;
}

/** Creates a Paddle transaction and sends the browser to /checkout to pay for it. */
export async function startCheckout(what: { kind: "cape"; itemId: string } | { kind: "plus"; plan: "monthly" | "yearly" }) {
  const d = await post({ action: "checkout", ...what });
  const back = window.location.pathname;
  window.location.href = `/checkout?_ptxn=${encodeURIComponent(d.transactionId)}&return=${encodeURIComponent(back)}`;
}

export async function openPortal() {
  const d = await post({ action: "portal" });
  if (d.url) window.open(d.url, "_blank", "noopener");
}

export async function redeemCode(code: string): Promise<{ item?: { id: string; name: string } }> {
  return post({ action: "redeem", code });
}
