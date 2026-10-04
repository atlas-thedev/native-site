import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Announcement from "@/components/Announcement";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { VersionProvider } from "@/components/VersionContext";
import { getSiteVersion } from "@/lib/server/releases";
import { site } from "@/lib/site";

const figtree = localFont({ src: "../public/fonts/Figtree-Variable.ttf", variable: "--font-figtree", display: "swap", weight: "300 900" });
const jb = localFont({ src: "../public/fonts/JetBrainsMonoVariable.ttf", variable: "--font-jb", display: "swap", weight: "100 800" });

const title = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  category: "games",
  alternates: { canonical: "/" },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: { title, description: site.description, siteName: site.name, type: "website", url: "/", locale: "en_US", images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }] },
  twitter: { card: "summary_large_image", title, description: site.description, images: ["/og.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  colorScheme: "dark light",
};

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const version = await getSiteVersion();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url, logo: `${site.url}/brand/icon.png`, sameAs: [site.discord, site.youtube] },
      { "@type": "WebSite", "@id": `${site.url}/#site`, url: site.url, name: site.name, description: site.description, publisher: { "@id": `${site.url}/#org` }, inLanguage: "en" },
      {
        "@type": "SoftwareApplication",
        "@id": `${site.url}/#app`,
        name: site.name,
        applicationCategory: "GameApplication",
        operatingSystem: "Windows, macOS, Linux",
        softwareVersion: version,
        description: site.description,
        url: site.url,
        downloadUrl: `${site.url}/download`,
        image: `${site.url}/og.png`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": `${site.url}/#org` },
      },
    ],
  };
  return (
    <html lang="en" className={`${figtree.variable} ${jb.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={graph} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <VersionProvider version={version}>
          <SmoothScroll>
            <Announcement />
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
          </SmoothScroll>
        </VersionProvider>
      </body>
    </html>
  );
}
