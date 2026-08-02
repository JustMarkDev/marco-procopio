import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { DitherField } from "@/components/dither-field";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteUrl, isLocale, locales } from "@/lib/site";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const title = "Marco Procopio — Engineer & Maker";
  const description =
    locale === "it"
      ? "Portfolio di Marco Procopio: progetti, tecnologia e sperimentazione tra intelligenza artificiale e impatto reale."
      : "Marco Procopio’s portfolio: projects, technology, and experiments where artificial intelligence meets real-world impact.";
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { it: "/it", en: "/en", "x-default": "/en" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "it" ? "it_IT" : "en_US",
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#060607" },
  ],
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DitherField />
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
