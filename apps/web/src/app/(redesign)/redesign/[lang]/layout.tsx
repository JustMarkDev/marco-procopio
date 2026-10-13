import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";

import "../../redesign.css";
import { ArtStage } from "@/components/redesign/art-stage";
import { Header } from "@/components/redesign/header";
import { MotionProvider } from "@/components/redesign/motion-provider";
import { SITE_URL, langs } from "@/lib/content";
import { asLang, copy } from "@/lib/redesign/copy";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Marco Procopio", template: "%s | Marco Procopio" },
  description: "Experimental redesign of Marco Procopio's site.",
  // Work in progress: keep it out of search results until it replaces the current site.
  robots: { index: false, follow: false },
};

/**
 * Root layout for the experimental redesign. Dark only. The language comes from the
 * browser via the proxy; the header and the art stay mounted while pages change.
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
      </body>
    </html>
  );
}
