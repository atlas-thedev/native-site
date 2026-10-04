import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { getLatestRelease, pickAsset, type PlatformKey } from "@/lib/server/releases";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params;
  if (!["windows", "mac", "linux"].includes(platform)) return new NextResponse("Unknown platform", { status: 404 });
  const asset = pickAsset(await getLatestRelease(), platform as PlatformKey, new URL(req.url).searchParams.get("arch") ?? undefined);
  if (!asset) return NextResponse.redirect(new URL("/download", site.url), 302);
  return NextResponse.redirect(asset.url, { status: 302, headers: { "Cache-Control": "public, s-maxage=300" } });
}
