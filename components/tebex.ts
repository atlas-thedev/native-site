"use client";

/** Minimal typing + loader for Tebex.js (https://docs.tebex.io/developers/tebex.js). */
type Theme = "light" | "dark" | "auto";
type TebexEvent = "open" | "close" | "payment:complete" | "payment:error";
export type TebexJs = {
  checkout: {
    init: (o: { ident: string; theme?: Theme | "default"; closeOnPaymentComplete?: boolean; colors?: { name: "primary" | "secondary"; color: string }[] }) => void;
    launch: () => void;
    on: (event: TebexEvent, cb: (e?: unknown) => void) => void;
  };
  portal: {
    init: (o: { token: string; theme?: Theme }) => void;
    launch: () => void;
    on?: (event: "open" | "close", cb: () => void) => void;
  };
};
declare global {
  interface Window { Tebex?: TebexJs }
}

let pending: Promise<TebexJs> | null = null;

export function loadTebex(): Promise<TebexJs> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window."));
  if (window.Tebex) return Promise.resolve(window.Tebex);
  if (pending) return pending;
  pending = new Promise<TebexJs>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.tebex.io/v/1.js";
    s.async = true;
    s.onload = () => (window.Tebex ? resolve(window.Tebex) : reject(new Error("The payment form didn’t load.")));
    s.onerror = () => reject(new Error("Couldn’t load the payment form. Check your connection or ad blocker."));
    document.head.appendChild(s);
  }).catch((e) => {
    pending = null;
    throw e;
  });
  return pending;
}

export const siteTheme = (): "light" | "dark" => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
export const payUrl = (ident: string) => `https://pay.tebex.io/${encodeURIComponent(ident)}`;
