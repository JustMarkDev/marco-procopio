import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";

import "../../index.css";
import { ArtStage } from "@/components/art-stage";
import { Header } from "@/components/header";
import { MotionProvider } from "@/components/motion-provider";
import { SITE_URL, langs } from "@/lib/content";
import { asLang, copy } from "@/lib/copy";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  // Optical sizing tightens the large headlines, as in the design.
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const dynamicParams = false;
export const generateStaticParams = () => langs.map((lang) => ({ lang }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const t = copy[asLang((await params).lang)];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `Marco Procopio - ${t.role}`, template: "%s | Marco Procopio" },
    description: t.description,
    // The share image lives at the app root (outside [lang]), so it's linked explicitly.
    openGraph: { type: "website", siteName: "Marco Procopio", images: "/opengraph-image" },
    twitter: { card: "summary_large_image", creator: "@Just_Mark_2", images: "/opengraph-image" },
  };
}

/**
 * Root layout. Dark only. The language comes from the browser via the proxy, so
 * every URL serves both; the header and the art stay mounted while pages change.
 */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const lang = asLang((await params).lang);

  return (
    <html lang={lang} className="dark">
      <body className={`${bricolage.variable} ${hanken.variable} antialiased`}>
        <MotionProvider>
          <div className="relative isolate min-h-svh overflow-hidden bg-dz-bg">
            <ArtStage />
            <div className="flex min-h-svh flex-col px-6 pt-8 md:px-[72px] md:pt-14">
              <Header t={copy[lang]} />
              {children}
            </div>
          </div>
        </MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
