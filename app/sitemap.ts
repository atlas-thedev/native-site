import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getCatalog } from "@/lib/server/store";

const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  ["", 1, "weekly"],
  ["/download", 0.9, "weekly"],
  ["/store", 0.9, "daily"],
  ["/players", 0.5, "daily"],
  ["/plus", 0.7, "monthly"],
  ["/vote", 0.6, "daily"],
  ["/beta", 0.7, "weekly"],
  ["/changes", 0.7, "daily"],
  ["/support", 0.6, "monthly"],
  ["/terms", 0.3, "yearly"],
  ["/privacy", 0.3, "yearly"],
  ["/refunds", 0.3, "yearly"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const capes = catalog?.items ?? [];
  const cosmetics = catalog?.cosmetics ?? [];
  return [
    ...pages.map(([p, priority, changeFrequency]) => ({ url: `${site.url}${p}`, lastModified: new Date(), changeFrequency, priority })),
    ...capes.map((c) => ({ url: `${site.url}/cloaks/${c.id}`, lastModified: new Date(c.createdAt || Date.now()), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...cosmetics.map((c) => ({ url: `${site.url}/cosmetics/${c.id}`, lastModified: new Date(c.createdAt || Date.now()), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
