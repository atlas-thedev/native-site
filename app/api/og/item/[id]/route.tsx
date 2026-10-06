import { getCatalog } from "@/lib/server/store";
import { itemCard, notFoundCard } from "@/lib/server/og";

export const dynamic = "force-dynamic";

/** Share image for a cloak or cosmetic page. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await getCatalog();
  const item = [...(catalog?.items ?? []), ...(catalog?.cosmetics ?? [])].find((i) => i.id === id);
  const res = item ? await itemCard(item) : await notFoundCard("Native Store");
  res.headers.set("Cache-Control", "public, max-age=600, s-maxage=600");
  return res;
}
