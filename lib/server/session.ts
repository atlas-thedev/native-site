import { cookies } from "next/headers";
import { API_URL, SITE_KEY } from "./config";

export const TOKEN_COOKIE = "native_session";
export const ACCOUNT_COOKIE = "native_account";
const MAX_AGE = 60 * 60 * 24 * 30;

export type SiteAccount = { id: number | string; name: string; email: string; uuid?: string; model?: string };

const opts = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

export async function setSession(token: string, account: SiteAccount) {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, token, opts(MAX_AGE));
  jar.set(ACCOUNT_COOKIE, JSON.stringify({ id: account.id, name: account.name, email: account.email, uuid: account.uuid, model: account.model }), opts(MAX_AGE));
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, "", opts(0));
  jar.set(ACCOUNT_COOKIE, "", opts(0));
}

export async function readSession(): Promise<{ token: string; account: SiteAccount } | null> {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  const raw = jar.get(ACCOUNT_COOKIE)?.value;
  if (!token || !raw) return null;
  try {
    return { token, account: JSON.parse(raw) as SiteAccount };
  } catch {
    return null;
  }
}

/** Headers forwarded to the Native API. The site key lets the API rate-limit by the real visitor IP. */
export function upstreamHeaders(req: Request, extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "native-site", ...extra };
  if (SITE_KEY) {
    const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
    if (fwd) {
      h["X-Native-Site-Key"] = SITE_KEY;
      h["X-Native-Client-IP"] = fwd;
    }
  }
  return h;
}

export async function api(path: string, init: RequestInit & { headers: Record<string, string> }) {
  const res = await fetch(`${API_URL}${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000) });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, ok: res.ok && data.ok !== false, data };
}
