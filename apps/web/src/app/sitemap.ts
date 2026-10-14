import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/content";
import { pagePath, pages } from "@/lib/copy";

/** Every page serves English or Italian from the same URL, picked from Accept-Language. */
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: page === "index" ? SITE_URL : `${SITE_URL}${pagePath(page)}`,
  }));
}
