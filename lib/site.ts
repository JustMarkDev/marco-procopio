export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (configured ?? (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(
    /\/$/,
    "",
  );
}

export const profileUrl = "https://github.com/JustMarkDev";
export const sourceUrl = "https://github.com/JustMarkDev/marco-procopio";
export const emailUrl = "mailto:procopiomarco@protonmail.com";
