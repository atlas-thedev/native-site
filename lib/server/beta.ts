import { api, readSession, upstreamHeaders } from "./session";

/**
 * Whether the signed-in visitor is a Super Beta Tester: an approved beta application, or someone the
 * admin added to beta updates. Beta testers may download the launcher while downloads are locked.
 */
export async function isBetaTester(req: Request): Promise<boolean> {
  const s = await readSession();
  if (!s) return false;
  const headers = upstreamHeaders(req, { Authorization: `Bearer ${s.token}` });
  const [me, ch] = await Promise.all([
    api("/v1/beta/me", { method: "GET", headers }).catch(() => null),
    api("/v1/beta/channel", { method: "GET", headers }).catch(() => null),
  ]);
  const app = (me?.data?.application ?? null) as { status?: string } | null;
  return app?.status === "approved" || ch?.data?.tester === true;
}
