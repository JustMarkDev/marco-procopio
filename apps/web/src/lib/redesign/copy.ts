import type { Route } from "next";
import { notFound } from "next/navigation";

import { langs, type Lang } from "@/lib/content";

/** The `[lang]` route param, or a 404 for anything the proxy wouldn't produce. */
export const asLang = (value: string): Lang =>
  langs.includes(value as Lang) ? (value as Lang) : notFound();

/** Pages in navigation order. Moving right through the list is "forward". */
export const pages = ["index", "work", "me", "about"] as const;
export type Page = (typeof pages)[number];

/** Public URL of a page. The language segment is added by the proxy, never shown. */
export const pagePath = (page: Page) =>
  (page === "index" ? "/redesign" : `/redesign/${page}`) as Route;

export const pageFromPath = (path: string): Page => {
  const last = path.replace(/\/$/, "").split("/").pop();
  return pages.find((p) => p === last) ?? "index";
};

export const copy = {
  en: {
    nav: { index: "index", work: "work", me: "me", about: "about" },
    city: "milan",
    index: {
      line: "CS student at Milano-Bicocca and junior developer. I build desktop apps, websites and tools, with AI agents as my everyday workflow.",
      more: "more of what I'm into",
    },
    work: {
      title: "Work",
      lede: "Things I've built and shipped. Rust when it has to be fast, TypeScript when it has to be seen.",
      rows: {
        db: { what: "335k AI-enriched contacts, 6.6 ms search", meta: "private" },
        music: { what: "word-by-word synced lyrics overlay", meta: "github" },
        sergio: { what: "theatre actor's site, 100/100 PageSpeed", meta: "live" },
        satisfactory: { what: "best start on a 9k-node map in 16 ms", meta: "github" },
        oss: { what: "merged PRs to tools I use daily", meta: "oss" },
      },
    },
    me: {
      playing: "on repeat right now",
      lastPlayed: "last played",
      synced: "lyrics synced by music companion, my own overlay",
      films: "Favorite Films",
      rated: "rated",
    },
    about: {
      title: "say ciao.",
      bio: "I'm Marco, a computer science student at Milano-Bicocca and a junior fullstack developer. AI agents are my default workflow, and I take testing seriously: 400+ tests in my biggest project.",
      bio2: "Since 2021 I've also run sound and lights at Teatro Procopio, about 50 shows a year. Looking for a junior product or fullstack role, in Milan or remote across the EU.",
      email: "email",
      elsewhere: "elsewhere",
      copy: "copy",
      copied: "copied",
      cv: "Download CV",
      credits: "photos",
    },
  },
  it: {
    nav: { index: "indice", work: "lavori", me: "io", about: "contatti" },
    city: "milano",
    index: {
      line: "Studente di informatica alla Bicocca e junior developer. Costruisco app desktop, siti web e strumenti, con gli agenti AI come flusso di lavoro quotidiano.",
      more: "altro di quello che mi piace",
    },
    work: {
      title: "Lavori",
      lede: "Cose che ho costruito e pubblicato. Rust quando deve essere veloce, TypeScript quando deve farsi vedere.",
      rows: {
        db: { what: "335k contatti arricchiti con l'AI, ricerca in 6,6 ms", meta: "privato" },
        music: { what: "testi sincronizzati parola per parola", meta: "github" },
        sergio: { what: "sito di un attore teatrale, 100/100 PageSpeed", meta: "online" },
        satisfactory: {
          what: "la partenza migliore su una mappa da 9k nodi in 16 ms",
          meta: "github",
        },
        oss: { what: "PR accettate negli strumenti che uso ogni giorno", meta: "oss" },
      },
    },
    me: {
      playing: "in loop adesso",
      lastPlayed: "ultimo ascolto",
      synced: "testi sincronizzati da music companion, il mio overlay",
      films: "Film preferiti",
      rated: "voto",
    },
    about: {
      title: "scrivimi.",
      bio: "Sono Marco, studente di informatica alla Bicocca e junior fullstack developer. Gli agenti AI sono il mio modo di lavorare, e prendo sul serio i test: oltre 400 nel mio progetto più grande.",
      bio2: "Dal 2021 curo anche audio e luci al Teatro Procopio, circa 50 spettacoli l'anno. Cerco un ruolo junior product o fullstack, a Milano o da remoto in tutta l'UE.",
      email: "email",
      elsewhere: "altrove",
      copy: "copia",
      copied: "copiato",
      cv: "Scarica il CV",
      credits: "foto",
    },
  },
} satisfies Record<Lang, unknown>;

export type Copy = (typeof copy)["en"];

/** Photo credits. Every image is openly licensed; the dithered renders are adaptations. */
export const credits = [
  {
    what: "Duomo di Milano, guglie",
    who: "Terragio67",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Milano_-_Duomo_di_Milano_-_Guglie,_composizione_-_2026-09-08_20-59-21_001.jpg",
  },
  {
    what: "Bust of Emperor Commodus",
    who: "J. Paul Getty Museum",
    license: "public domain",
    href: "https://commons.wikimedia.org/wiki/File:Bust_of_Emperor_Commodus,_right_profile_-_Getty_Museum_(92.SA.48).jpg",
  },
  {
    what: "A school of fish",
    who: "bluesbby",
    license: "CC BY 2.0",
    href: "https://commons.wikimedia.org/wiki/File:A_school_of_fish_(29882069786).jpg",
  },
  {
    what: "Teatro Regio di Parma",
    who: "Maurizio Moro5153",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Teatro_Regio_Platea_Palchi_visti_dal_Palcoscenico.jpg",
  },
];
