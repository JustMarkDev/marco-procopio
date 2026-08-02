import type { MetadataRoute } from "next";
import { getSiteUrl, locales } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
    alternates: {
      languages: { it: `${siteUrl}/it`, en: `${siteUrl}/en` },
    },
  }));
}
