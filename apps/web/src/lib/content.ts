export const SITE_URL = "https://marco-procopio.vercel.app";

export type Lang = "en" | "it";
export const langs: Lang[] = ["en", "it"];

export const links = {
  email: "mailto:procopiomarco@protonmail.com",
  emailAddress: "procopiomarco@protonmail.com",
  github: "https://github.com/JustMarkDev",
  linkedin: "https://www.linkedin.com/in/justmark",
  x: "https://x.com/Just_Mark_2",
  cv: "/Marco-Procopio-CV.pdf",
};

/** Public profile IDs for the live music and films. An empty ID hides that source. */
export const profiles = {
  lastfm: "JustMark03",
  /** Trakt's URL slug for "Just Mark". */
  trakt: "just-mark",
};

const screenshot = (slug: string) => ({ src: `/work/${slug}.webp`, width: 2880, height: 1800 });

/** Work rows: where each project lives and the screenshot shown on hover. */
export const projects = {
  /** Private: no public repo or site, so the row isn't a link. */
  databaseContatti: { preview: screenshot("database-contatti") },
  musicCompanion: {
    href: `${links.github}/music-companion`,
    preview: screenshot("music-companion"),
  },
  sergioProcopio: { href: "https://sergioprocopio.it", preview: screenshot("sergio-procopio") },
  satisfactory: {
    href: `${links.github}/satisfactory-start-optimizer`,
    preview: screenshot("satisfactory-start-optimizer"),
  },
  /** Merged pull requests to Raycast extensions and T3 Code. */
  oss: { href: "https://github.com/pulls?q=is%3Apr+is%3Amerged+author%3AJustMarkDev" },
};
