import { Schema } from "effect";

export const SITE_URL = "https://marco-procopio.vercel.app";

export type Lang = "en" | "it";
export const langs: Lang[] = ["en", "it"];

/** Path prefix per language: English lives at the root, Italian under /it. */
export const home = (lang: Lang) => (lang === "en" ? "/" : "/it");
export const workPath = (lang: Lang, slug: string) =>
  lang === "en" ? `/work/${slug}` : `/it/work/${slug}`;

export const links = {
  email: "mailto:procopiomarco@protonmail.com",
  emailAddress: "procopiomarco@protonmail.com",
  github: "https://github.com/JustMarkDev",
  linkedin: "https://www.linkedin.com/in/justmark",
  x: "https://x.com/Just_Mark_2",
  cv: "/Marco-Procopio-CV.pdf",
};

/** Public profile IDs for the "Off the clock" section. An empty ID hides that source. */
export const profiles = {
  lastfm: "JustMark03",
  /** Trakt's URL slug for "Just Mark". */
  trakt: "just-mark",
  anilist: "JustMark25",
  /** SteamID64, the 17-digit number in the profile URL. */
  steam: "76561198442990697",
};

const NonEmptyTrimmed = Schema.String.check(Schema.isTrimmed(), Schema.isNonEmpty());

/** One string per language, neither empty. */
const Text = Schema.Struct({
  en: NonEmptyTrimmed,
  it: NonEmptyTrimmed,
}).annotate({ identifier: "Text" });

const ProjectSchema = Schema.Struct({
  slug: Schema.String.check(Schema.isPattern(/^[a-z0-9-]+$/)),
  name: NonEmptyTrimmed,
  kind: Text,
  summary: Text,
  overview: Text,
  highlights: Schema.Struct({
    en: Schema.NonEmptyArray(NonEmptyTrimmed),
    it: Schema.NonEmptyArray(NonEmptyTrimmed),
  }).check(
    Schema.makeFilter((h) => h.en.length === h.it.length || "en and it highlights differ in count"),
  ),
  stats: Schema.Array(Schema.Struct({ value: NonEmptyTrimmed, label: Text })),
  stack: Schema.NonEmptyArray(NonEmptyTrimmed),
  image: Schema.Struct({
    src: Schema.String.check(Schema.isStartingWith("/work/")),
    width: Schema.Int,
    height: Schema.Int,
    alt: Text,
    note: Schema.optional(Text),
  }),
  /** GitHub repo name under JustMarkDev. Omitted for private repos. */
  repo: Schema.optional(Schema.String),
  site: Schema.optional(Schema.String.check(Schema.isStartingWith("https://"))),
}).annotate({ identifier: "Project" });

export type Project = typeof ProjectSchema.Type;

const Projects = Schema.Array(ProjectSchema)
  .check(
    Schema.makeFilter(
      (ps) => new Set(ps.map((p) => p.slug)).size === ps.length || "project slugs must be unique",
    ),
  )
  .annotate({ identifier: "Projects" });

/**
 * Type-checked against the schema, then decoded when the module loads, so an empty
 * translation or malformed entry fails `next build` with its exact path.
 */
export const projects = Schema.decodeSync(Projects)([
  {
    slug: "database-contatti",
    name: "Database Contatti",
    kind: { en: "Contact management desktop app", it: "App desktop per la gestione dei contatti" },
    summary: {
      en: "Imports, cleans and classifies contacts from spreadsheets into a 15 GB SQLite database, with full-text search and verified email addresses.",
      it: "Importa, pulisce e classifica contatti da fogli di calcolo in un database SQLite da 15 GB, con ricerca full-text e indirizzi email verificati.",
    },
    overview: {
      en: "A local desktop app that imports contact lists from spreadsheets, cleans and classifies them, and keeps them in one SQLite database of about 15 GB. The live catalogue holds about 278,000 unique contacts, organised by category, subcategory and geography.",
      it: "Un'app desktop locale che importa liste di contatti da fogli di calcolo, le pulisce, le classifica e le conserva in un unico database SQLite di circa 15 GB. Il catalogo contiene circa 278.000 contatti unici, organizzati per categoria, sottocategoria e area geografica.",
    },
    highlights: {
      en: [
        "Imports .xlsx, .xlsm, .xlsb, .ods and .csv files with automatic encoding detection and SHA-256 reconciliation manifests.",
        "Parses a 25 MB file (about 177,000 email candidates) in about 4.5 seconds, using chunked SQLite transactions and Tokio workers.",
        "Checks that mailboxes exist over DNS and SMTP with mandatory STARTTLS, without sending any mail.",
        "Classified about 280,000 emails with the Jev decision model at about 300 ms each, with manual review and field-level history.",
        "Full-text search over 100,000 contacts returns a page in about 54 ms, and a 100,000-row CSV export runs at about 344,000 contacts per second.",
        "236 automated tests across React and Rust.",
      ],
      it: [
        "Importa file .xlsx, .xlsm, .xlsb, .ods e .csv con rilevamento automatico della codifica e manifest di riconciliazione SHA-256.",
        "Analizza un file da 25 MB (circa 177.000 email candidate) in circa 4,5 secondi, con transazioni SQLite a blocchi e worker Tokio.",
        "Verifica l'esistenza delle caselle via DNS e SMTP con STARTTLS obbligatorio, senza inviare email.",
        "Ha classificato circa 280.000 email con il modello decisionale Jev, a circa 300 ms l'una, con revisione manuale e storico delle modifiche per campo.",
        "La ricerca full-text su 100.000 contatti restituisce una pagina in circa 54 ms, e l'export CSV di 100.000 righe gira a circa 344.000 contatti al secondo.",
        "236 test automatici tra React e Rust.",
      ],
    },
    stats: [
      { value: "278k", label: { en: "contacts", it: "contatti" } },
      { value: "54 ms", label: { en: "search over 100k", it: "ricerca su 100k" } },
      { value: "236", label: { en: "tests", it: "test" } },
    ],
    stack: ["Tauri", "React", "Rust", "SQLite"],
    image: {
      src: "/work/database-contatti.webp",
      width: 2880,
      height: 1800,
      alt: {
        en: "Database Contatti showing the contact list with filters by category and region.",
        it: "Database Contatti con l'elenco dei contatti e i filtri per categoria e regione.",
      },
      note: {
        en: "Email addresses are blurred. The repository is private.",
        it: "Gli indirizzi email sono sfocati. Il repository è privato.",
      },
    },
  },
  {
    slug: "music-companion",
    name: "Music Companion",
    kind: {
      en: "Lyrics overlay for Windows and macOS",
      it: "Overlay dei testi per Windows e macOS",
    },
    summary: {
      en: "Follows the active media session and shows synced lyrics, with romanization for Japanese and Chinese.",
      it: "Segue la sessione multimediale attiva e mostra i testi sincronizzati, con romanizzazione per giapponese e cinese.",
    },
    overview: {
      en: "A desktop overlay for Windows 10/11 and macOS 11+ that follows the active media session and shows synced lyrics in real time, floating over whatever you are doing.",
      it: "Un overlay desktop per Windows 10/11 e macOS 11+ che segue la sessione multimediale attiva e mostra i testi sincronizzati in tempo reale, sopra qualsiasi finestra.",
    },
    highlights: {
      en: [
        "Small installers: about 11 MB on Windows and 35 MB for the universal macOS build, with about 19 KB of gzipped JavaScript.",
        "Native media APIs: Windows Media Control on Windows, AppKit for the overlay window on macOS.",
        "Romanization for Japanese (morphological tokenization) and Chinese (Pinyin), with cached lyrics from LRCLIB.",
        "CI builds on Windows and macOS, and a signed auto-updater on Windows.",
        "48 frontend and about 29 Rust unit tests.",
      ],
      it: [
        "Installer leggeri: circa 11 MB su Windows e 35 MB per la build universale macOS, con circa 19 KB di JavaScript compresso.",
        "API multimediali native: Windows Media Control su Windows, AppKit per la finestra overlay su macOS.",
        "Romanizzazione per giapponese (tokenizzazione morfologica) e cinese (Pinyin), con testi da LRCLIB in cache.",
        "CI su Windows e macOS e aggiornamento automatico firmato su Windows.",
        "48 test frontend e circa 29 test unitari in Rust.",
      ],
    },
    stats: [
      { value: "11 MB", label: { en: "installer", it: "installer" } },
      { value: "19 KB", label: { en: "gzipped JS", it: "JS compresso" } },
    ],
    stack: ["Tauri", "Rust", "TypeScript"],
    repo: "music-companion",
    image: {
      src: "/work/music-companion.webp",
      width: 2880,
      height: 1800,
      alt: {
        en: "Music Companion overlay showing synced lyrics, with the current line highlighted.",
        it: "Overlay di Music Companion con i testi sincronizzati e la riga corrente evidenziata.",
      },
      note: {
        en: "Captured in the app's preview mode, over a sample wallpaper.",
        it: "Catturato nella modalità anteprima dell'app, sopra uno sfondo di esempio.",
      },
    },
  },
  {
    slug: "sergio-procopio",
    name: "Sergio Procopio",
    kind: { en: "Website for a theatre company", it: "Sito per una compagnia teatrale" },
    summary: {
      en: "Replaced a WordPress site with an Astro site the owner updates without code, through a Git-based CMS.",
      it: "Ha sostituito un sito WordPress con un sito Astro che il proprietario aggiorna senza codice, tramite un CMS basato su Git.",
    },
    overview: {
      en: "Website for Sergio Procopio, an actor and mime who performs in schools, parishes and theatres. It replaced a WordPress site that needed code changes for every update.",
      it: "Sito di Sergio Procopio, attore e mimo che porta i suoi spettacoli in scuole, parrocchie e teatri. Ha sostituito un sito WordPress che richiedeva modifiche al codice per ogni aggiornamento.",
    },
    highlights: {
      en: [
        "Astro 6 with React islands, Tailwind CSS v4 and Framer Motion, scoring 100/100 on PageSpeed Insights.",
        "Shows, events and the gallery are managed in Pages CMS, which commits content to Git, so updates need no code.",
        "Type-safe contact form with Astro Actions and Resend.",
        "Deployed on Vercel, with the custom domain, DNS and email records (MX, SPF, DKIM, DMARC) set up.",
        "180 visitors, 800 page views and more than 20 contact requests so far.",
      ],
      it: [
        "Astro 6 con isole React, Tailwind CSS v4 e Framer Motion, con punteggio 100/100 su PageSpeed Insights.",
        "Spettacoli, eventi e galleria si gestiscono da Pages CMS, che salva i contenuti su Git: gli aggiornamenti non richiedono codice.",
        "Modulo di contatto type-safe con Astro Actions e Resend.",
        "Pubblicato su Vercel, con dominio, DNS e record email (MX, SPF, DKIM, DMARC) configurati.",
        "180 visitatori, 800 visualizzazioni e più di 20 richieste di contatto finora.",
      ],
    },
    stats: [
      { value: "100", label: { en: "PageSpeed score", it: "punteggio PageSpeed" } },
      { value: "20+", label: { en: "contact requests", it: "richieste di contatto" } },
    ],
    stack: ["Astro", "React", "Tailwind CSS"],
    repo: "sergio-procopio",
    site: "https://sergioprocopio.it",
    image: {
      src: "/work/sergio-procopio.webp",
      width: 2880,
      height: 1800,
      alt: {
        en: "Homepage of sergioprocopio.it with a photo of Sergio on stage.",
        it: "Homepage di sergioprocopio.it con una foto di Sergio in teatro.",
      },
    },
  },
  {
    slug: "satisfactory-start-optimizer",
    name: "Satisfactory Start Optimizer",
    kind: {
      en: "Base location planner for Satisfactory",
      it: "Pianificatore di basi per Satisfactory",
    },
    summary: {
      en: "Searches about 9,000 resource nodes for the best starting base. Ships as a CLI, an API and a small web UI.",
      it: "Cerca tra circa 9.000 nodi di risorse la posizione migliore per la base iniziale. Disponibile come CLI, API e piccola interfaccia web.",
    },
    overview: {
      en: "A CLI, API and web dashboard that searches the Satisfactory map (about 9,155 nodes across 25 resource types) for the best place to start a base, based on weights you set.",
      it: "CLI, API e dashboard web che cercano sulla mappa di Satisfactory (circa 9.155 nodi e 25 tipi di risorse) il posto migliore per iniziare una base, in base ai pesi scelti.",
    },
    highlights: {
      en: [
        "Hybrid global grid search with local refinement, parallelised with Rayon: a full-map solve takes about 16 ms on an Apple M5.",
        "A fast multi-start mode (about 5 ms) keeps the weight sliders interactive.",
        "Scales with cores: about 84 ms on one thread, about 18 ms on eight.",
        "The 2.6 MB map corpus loads and parses in about 3.5 ms.",
        "54 tests (17 frontend, 37 Rust), all passing.",
      ],
      it: [
        "Ricerca ibrida a griglia globale con raffinamento locale, parallelizzata con Rayon: la mappa completa si risolve in circa 16 ms su Apple M5.",
        "Una modalità multi-start veloce (circa 5 ms) mantiene interattivi i cursori dei pesi.",
        "Scala con i core: circa 84 ms su un thread, circa 18 ms su otto.",
        "Il corpus della mappa da 2,6 MB si carica e si analizza in circa 3,5 ms.",
        "54 test (17 frontend, 37 Rust), tutti superati.",
      ],
    },
    stats: [
      { value: "16 ms", label: { en: "full-map solve", it: "mappa completa" } },
      { value: "54", label: { en: "tests", it: "test" } },
    ],
    stack: ["Rust", "Rayon"],
    repo: "satisfactory-start-optimizer",
    image: {
      src: "/work/satisfactory-start-optimizer.webp",
      width: 2880,
      height: 1800,
      alt: {
        en: "Optimizer dashboard with the Satisfactory map, weight sliders and the top three base sites.",
        it: "Dashboard dell'ottimizzatore con la mappa di Satisfactory, i cursori dei pesi e i tre siti migliori.",
      },
    },
  },
]);

export const contributions = [
  {
    project: "Raycast extensions",
    title: "Agent Usage: provider order",
    href: "https://github.com/raycast/extensions/pull/30902",
  },
  {
    project: "Raycast extensions",
    title: "Antigravity quota",
    href: "https://github.com/raycast/extensions/pull/30901",
  },
  {
    project: "T3 Code",
    title: "Bitbucket source control toggle",
    href: "https://github.com/pingdotgg/t3code/pull/3079",
  },
];

export const ui = {
  en: {
    locale: "en",
    title: "Marco Procopio",
    role: "Fullstack and product engineer",
    description:
      "Fullstack and product engineer in Milan. React and TypeScript on the web, Rust and SQLite on the desktop.",
    bio: "I build fast software for the web and the desktop. React and TypeScript in the browser, Rust and SQLite on the desktop.",
    now: "Now: shipping Database Contatti and looking for a junior product engineering role.",
    portraitAlt: "Portrait of Marco Procopio",
    nav: { work: "Work", about: "About", contact: "Contact" },
    emailMe: "Email me",
    cv: "CV",
    downloadCv: "Download CV",
    work: "Work",
    openSource: "Open source",
    openSourceIntro: "Merged pull requests in tools I use every day.",
    about: "About",
    aboutText: [
      "I study Computer Science at the University of Milan-Bicocca and build products end to end: interface, data, tests and release pipeline.",
      "AI coding agents are part of how I work every day. I measure what I ship, so most of my projects come with benchmarks and test suites.",
      "English C2, Italian native.",
    ],
    timeline: [
      { role: "Computer Science", place: "University of Milan-Bicocca", period: "2022 - now" },
      { role: "Audio and lighting technician", place: "Teatro Procopio", period: "2021 - now" },
      {
        role: "Diploma in Computer Science",
        place: "ITIS Enea Mattei, Sondrio",
        period: "2017 - 2022",
      },
    ],
    contact: "Contact",
    contactText:
      "Open to fullstack and product roles, remote in the EU or hybrid in the Milan area.",
    copyEmail: "Copy email address",
    copied: "Email address copied",
    private: "Private",
    website: "Website",
    updated: "Updated",
    merged: "Merged",
    open: "Open",
    stars: "stars",
    caseStudy: "Case study",
    allWork: "All work",
    whatIBuilt: "What I built",
    next: "Next project",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
    otherLang: { label: "IT", name: "Leggi in italiano" },
    offClock: "Off the clock",
    offClockIntro: "What I watch, read, play and listen to when I'm not building.",
    shelves: { films: "Films", series: "Series", anime: "Anime", manga: "Manga", games: "Games" },
    listeningNow: "Listening now",
    lastPlayed: "Last played",
  },
  it: {
    locale: "it",
    title: "Marco Procopio",
    role: "Fullstack e product engineer",
    description:
      "Fullstack e product engineer a Milano. React e TypeScript sul web, Rust e SQLite sul desktop.",
    bio: "Costruisco software veloce per il web e per il desktop. React e TypeScript nel browser, Rust e SQLite sul desktop.",
    now: "Ora: sto sviluppando Database Contatti e cerco un ruolo junior da product engineer.",
    portraitAlt: "Ritratto di Marco Procopio",
    nav: { work: "Progetti", about: "Chi sono", contact: "Contatti" },
    emailMe: "Scrivimi",
    cv: "CV",
    downloadCv: "Scarica il CV",
    work: "Progetti",
    openSource: "Open source",
    openSourceIntro: "Pull request accettate negli strumenti che uso ogni giorno.",
    about: "Chi sono",
    aboutText: [
      "Studio Informatica all'Università di Milano-Bicocca e costruisco prodotti dall'inizio alla fine: interfaccia, dati, test e pipeline di rilascio.",
      "Gli agenti di coding AI fanno parte del mio lavoro quotidiano. Misuro quello che rilascio, quindi quasi tutti i miei progetti hanno benchmark e test.",
      "Inglese C2, italiano madrelingua.",
    ],
    timeline: [
      { role: "Informatica", place: "Università di Milano-Bicocca", period: "2022 - oggi" },
      { role: "Tecnico audio e luci", place: "Teatro Procopio", period: "2021 - oggi" },
      { role: "Diploma in Informatica", place: "ITIS Enea Mattei, Sondrio", period: "2017 - 2022" },
    ],
    contact: "Contatti",
    contactText:
      "Disponibile per ruoli fullstack e di prodotto, da remoto in UE o in ibrido nell'area di Milano.",
    copyEmail: "Copia l'indirizzo email",
    copied: "Indirizzo email copiato",
    private: "Privato",
    website: "Sito",
    updated: "Aggiornato",
    merged: "Accettata",
    open: "Aperta",
    stars: "stelle",
    caseStudy: "Dettagli",
    allWork: "Tutti i progetti",
    whatIBuilt: "Cosa ho costruito",
    next: "Progetto successivo",
    toLight: "Passa al tema chiaro",
    toDark: "Passa al tema scuro",
    otherLang: { label: "EN", name: "Read in English" },
    offClock: "Fuori orario",
    offClockIntro: "Cosa guardo, leggo, gioco e ascolto quando non sto programmando.",
    shelves: { films: "Film", series: "Serie TV", anime: "Anime", manga: "Manga", games: "Giochi" },
    listeningNow: "In ascolto ora",
    lastPlayed: "Ascoltato",
  },
} satisfies Record<Lang, unknown>;

export type Dict = (typeof ui)["en"];
