import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  ["", 1, "weekly"],
  ["/download", 0.9, "weekly"],
  ["/store", 0.5, "monthly"],
  ["/players", 0.5, "daily"],
  ["/skins", 0.6, "daily"],
  ["/plus", 0.7, "monthly"],
  ["/vote", 0.6, "daily"],
  ["/beta", 0.7, "weekly"],
  ["/changes", 0.7, "daily"],
  ["/partners", 0.6, "weekly"],
  ["/support", 0.6, "monthly"],
  ["/terms", 0.3, "yearly"],
  ["/privacy", 0.3, "yearly"],
  ["/refunds", 0.3, "yearly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(([p, priority, changeFrequency]) => ({ url: `${site.url}${p}`, lastModified: new Date(), changeFrequency, priority }));
}
