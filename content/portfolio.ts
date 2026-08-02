import type { Locale } from "@/lib/site";

const sharedProjects = [
  {
    id: "music-companion",
    title: "Music Companion",
    eyebrow: "DESKTOP · 2026",
    tags: ["Tauri", "Rust", "TypeScript", "LRCLIB"],
    href: "https://github.com/JustMarkDev/music-companion",
    footer: "OPEN SOURCE",
    preview: "placeholder" as const,
  },
  {
    id: "sergio-procopio",
    title: "SergioProcopio.it",
    eyebrow: "WEB · LIVE",
    tags: ["Next.js", "TypeScript", "Design", "SEO"],
    href: "https://sergioprocopio.it",
    footer: "ONLINE",
    preview: "placeholder" as const,
  },
  {
    id: "satisfactory-optimizer",
    title: "Satisfactory Optimizer",
    eyebrow: "RUST · 2026",
    tags: ["Rust", "Rayon", "Vite+", "Optimization"],
    href: "https://github.com/JustMarkDev/satisfactory-start-optimizer",
    footer: "OPEN SOURCE",
    preview: "placeholder" as const,
  },
  {
    id: "github",
    title: { it: "Altri progetti", en: "Other projects" },
    eyebrow: "GITHUB",
    tags: ["TypeScript", "Rust", "Tools", "Experiments"],
    href: "https://github.com/JustMarkDev?tab=repositories",
    footer: "6 REPOSITORY",
    preview: "github" as const,
  },
];

export const dictionary = {
  it: {
    nav: { intro: "Introduzione", projects: "Progetti", technologies: "Tecnologie" },
    profile: {
      ageRole: "23 · Ingegnere",
      status: "Cercando lavoro",
      viewsLabel: "visualizzazioni",
    },
    about: {
      title: "Chi sono",
      paragraphs: [
        "Sono un maker che sta ancora trovando la propria strada, ma lo fa creando lungo il percorso. Mi piace lavorare tra IA e impatto reale: costruire sistemi, sperimentare con gli LLM e trasformare idee in qualcosa di concreto.",
        "Sono curioso non solo della tecnologia, ma anche di come influenzi il modo in cui le persone pensano, agiscono e crescono. Questa curiosità mi porta oltre il codice, verso la ricerca di significato e scopo.",
        "Per me crescere non significa solo acquisire competenze o raggiungere risultati, ma diventare più consapevole, disciplinato e coerente con ciò che faccio. È un percorso su cui lavoro ogni giorno.",
      ],
    },
    contacts: "Contatti",
    projects: "Progetti",
    stack: "Stack tecnologico",
    preview: "ANTEPRIMA IN ARRIVO",
    links: {
      github: "GitHub",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      email: "Email",
      cv: "CV",
      comingSoon: "Link in arrivo",
    },
    projectCopy: {
      "music-companion":
        "Overlay desktop per Windows che segue il brano in riproduzione e mostra testi sincronizzati, controlli globali e impostazioni personalizzabili.",
      "sergio-procopio":
        "Sito ufficiale dell’attore e autore Sergio Procopio: spettacoli teatrali, biografia, calendario e contatti per scuole, parrocchie e associazioni.",
      "satisfactory-optimizer":
        "Utility ad alte prestazioni che calcola le coordinate iniziali ottimali combinando risorse, distanze e modelli matematici configurabili.",
      github:
        "Esplora gli altri repository, esperimenti e strumenti in sviluppo direttamente sul mio profilo GitHub.",
    },
    projectAction: { source: "GitHub", live: "Visita il sito", github: "Apri GitHub" },
    footer: {
      source: "Codice sorgente",
      privacy: "Privacy",
      privacyCopy:
        "Questo sito usa un contatore anonimo delle visualizzazioni, Vercel Web Analytics e Speed Insights per raccogliere metriche aggregate di utilizzo e prestazioni. Non usa cookie pubblicitari.",
      made: "Progettato e sviluppato da Marco.",
    },
    theme: { label: "Tema", system: "Sistema", light: "Chiaro", dark: "Scuro" },
    language: "Passa all’inglese",
  },
  en: {
    nav: { intro: "Introduction", projects: "Projects", technologies: "Technologies" },
    profile: { ageRole: "23 · Engineer", status: "Open to work", viewsLabel: "views" },
    about: {
      title: "About me",
      paragraphs: [
        "I’m a maker still finding my path, and I do it by building along the way. I like working where AI meets real-world impact: creating systems, experimenting with LLMs, and turning ideas into something concrete.",
        "I’m curious not only about technology, but also about how it shapes the way people think, act, and grow. That curiosity takes me beyond code and toward questions of meaning and purpose.",
        "To me, growth is not only about gaining skills or reaching outcomes. It is about becoming more aware, disciplined, and consistent with what I do. It is a path I work on every day.",
      ],
    },
    contacts: "Contact",
    projects: "Projects",
    stack: "Technology stack",
    preview: "PREVIEW COMING SOON",
    links: {
      github: "GitHub",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      email: "Email",
      cv: "CV",
      comingSoon: "Link coming soon",
    },
    projectCopy: {
      "music-companion":
        "A Windows desktop overlay that follows the currently playing track with synchronized lyrics, global controls, and customizable settings.",
      "sergio-procopio":
        "The official website of actor and author Sergio Procopio, with shows, biography, events, and contacts for schools and community groups.",
      "satisfactory-optimizer":
        "A high-performance utility that calculates optimal starting coordinates by combining resources, distances, and configurable mathematical models.",
      github:
        "Browse my other repositories, experiments, and works in progress directly on GitHub.",
    },
    projectAction: { source: "GitHub", live: "Visit website", github: "Open GitHub" },
    footer: {
      source: "Source code",
      privacy: "Privacy",
      privacyCopy:
        "This site uses an anonymous page-view counter, Vercel Web Analytics, and Speed Insights to collect aggregated usage and performance metrics. It does not use advertising cookies.",
      made: "Designed and built by Marco.",
    },
    theme: { label: "Theme", system: "System", light: "Light", dark: "Dark" },
    language: "Switch to Italian",
  },
} as const;

export function getProjects(locale: Locale) {
  const t = dictionary[locale];
  return sharedProjects.map((project) => ({
    ...project,
    title: typeof project.title === "string" ? project.title : project.title[locale],
    description: t.projectCopy[project.id as keyof typeof t.projectCopy],
    action:
      project.id === "sergio-procopio"
        ? t.projectAction.live
        : project.id === "github"
          ? t.projectAction.github
          : t.projectAction.source,
  }));
}
