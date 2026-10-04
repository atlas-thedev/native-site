import { NextResponse } from "next/server";
import { getCommits } from "@/lib/server/commits";

export const revalidate = 600;

export async function GET(req: Request) {
  const page = Math.min(Math.max(Number(new URL(req.url).searchParams.get("page")) || 1, 1), 200);
  return NextResponse.json(await getCommits(page, 30), { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } });
}
