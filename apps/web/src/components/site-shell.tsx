import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import { SITE_URL, ui, type Lang } from "@/lib/content";

import { Dither } from "./dither";
import { Nav } from "./nav";
import Providers from "./providers";
import { SocialDock } from "./social-dock";

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
          <footer id="contact" className="mx-auto max-w-[60rem] scroll-mt-24 px-5 pt-8 pb-10">
            <div className="flex flex-col gap-8 border-t pt-10 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-sm text-muted-foreground">
                <p className="max-w-sm leading-relaxed">{ui[lang].contactText}</p>
                <p className="mt-4">© {new Date().getFullYear()} Marco Procopio</p>
              </div>
              <SocialDock copyLabel={ui[lang].copyEmail} copiedLabel={ui[lang].copied} />
            </div>
          </footer>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
