import { NextResponse } from "next/server";
import { isBetaTester } from "@/lib/server/beta";

export const dynamic = "force-dynamic";

/** { tester } — lets the download page unlock early for beta testers. */
export async function GET(req: Request) {
  const tester = await isBetaTester(req).catch(() => false);
  return NextResponse.json({ ok: true, tester }, { headers: { "Cache-Control": "no-store" } });
}
