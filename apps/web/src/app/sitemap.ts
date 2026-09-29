import type { MetadataRoute } from "next";

import { SITE_URL, home, langs, projects, workPath, type Lang } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    (lang: Lang) => home(lang),
    ...projects.map((p) => (lang: Lang) => workPath(lang, p.slug)),
  ];
  return paths.flatMap((path) =>
    langs.map((lang) => ({
      url: `${SITE_URL}${path(lang)}`,
      alternates: { languages: { en: `${SITE_URL}${path("en")}`, it: `${SITE_URL}${path("it")}` } },
    })),
  );
}
