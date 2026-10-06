import type { Metadata } from "next";
import { site } from "./site";

/** Per-page metadata with canonical + social cards. */
export function pageMeta(opts: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: { title: `${opts.title} · ${site.name}`, description: opts.description, url: opts.path, siteName: site.name, type: "website", images: [{ url: "/og-native.png", width: 1200, height: 630, alt: site.name }] },
    twitter: { card: "summary_large_image", title: `${opts.title} · ${site.name}`, description: opts.description, images: ["/og-native.png"] },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}

export const breadcrumb = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
});
