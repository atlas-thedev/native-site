import { NextResponse } from "next/server";
import { getSiteVersion } from "@/lib/server/releases";

export const dynamic = "force-dynamic";

/** Latest published Native Client version. Pages refresh their banner from this after load. */
export async function GET() {
  return NextResponse.json({ version: await getSiteVersion() }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
