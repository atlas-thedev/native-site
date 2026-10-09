import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { getSiteConfig } from "@/lib/server/siteConfig";
import { isBetaTester } from "@/lib/server/beta";
import { getLatestRelease, pickAsset, type PlatformKey } from "@/lib/server/releases";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params;
  if (!["windows", "mac", "linux"].includes(platform)) return new NextResponse("Unknown platform", { status: 404 });
  const locked = (await getSiteConfig()).launch.lockDownloads;
  if (locked && !(await isBetaTester(req).catch(() => false))) return NextResponse.redirect(new URL("/download", site.url), 302);
  const asset = pickAsset(await getLatestRelease(), platform as PlatformKey, new URL(req.url).searchParams.get("arch") ?? undefined);
  if (!asset) return NextResponse.redirect(new URL("/download", site.url), 302);
  return NextResponse.redirect(asset.url, { status: 302, headers: { "Cache-Control": locked ? "private, no-store" : "public, s-maxage=300" } });
}
