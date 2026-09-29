import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import { SITE_URL, ui, type Lang } from "@/lib/content";

import { Dither } from "./dither";
import { Nav } from "./nav";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function siteMetadata(lang: Lang): Metadata {
  const t = ui[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${t.title} - ${t.role}`, template: `%s | ${t.title}` },
    description: t.description,
    alternates: {
      canonical: lang === "en" ? "/" : "/it",
      languages: { en: "/", it: "/it" },
    },
    openGraph: {
      type: "website",
      siteName: t.title,
      locale: lang === "en" ? "en_US" : "it_IT",
    },
    twitter: { card: "summary_large_image", creator: "@Just_Mark_2" },
  };
}

/** Root <html> for one language. Each language is its own route group with its own root layout. */
export function SiteShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Dither />
          <Nav lang={lang} t={ui[lang]} />
          {children}
          <footer className="mx-auto max-w-2xl px-5 pb-10 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Marco Procopio
          </footer>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
