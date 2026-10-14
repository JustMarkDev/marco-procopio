import type { Metadata } from "next";

import { FilmPoster } from "@/components/film-poster";
import { OnRepeat } from "@/components/on-repeat";
import { Rise } from "@/components/reveal";
import { getFilms, type Favorite } from "@/lib/favorites";
import { getNowPlaying } from "@/lib/lastfm";
import { asLang, copy } from "@/lib/copy";

export const metadata: Metadata = { title: "Me" };

// Trakt ratings change rarely; the track is refreshed client-side.
export const revalidate = 3600;

/** Shown when Trakt isn't configured: the films from the design, without posters. */
const FALLBACK: Favorite[] = [
  { title: "Severance", meta: "watching · S2", href: "https://trakt.tv/shows/severance" },
  { title: "Perfect Days", meta: "film · 2023", href: "https://trakt.tv/movies/perfect-days-2023" },
  { title: "The Bear", meta: "rewatching · S3", href: "https://trakt.tv/shows/the-bear" },
  { title: "Her", meta: "all-time", href: "https://trakt.tv/movies/her-2013" },
];

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = copy[lang].me;
  const [track, films] = await Promise.all([getNowPlaying(), getFilms()]);
  const shelf = films.length ? films.slice(0, 4) : FALLBACK;

  return (
    <main className="flex flex-1 flex-col justify-end gap-14 pt-[34vh] pb-10 md:flex-row md:items-end md:justify-between md:gap-12 md:pb-[69px]">
      <OnRepeat lang={lang} t={t} initial={track} />
      <section aria-labelledby="films" className="w-full md:mb-16 md:w-[488px] md:shrink-0">
        <Rise delay={0.2}>
          <h2 id="films" className="text-[15px]">
            {t.films}
          </h2>
        </Rise>
        <ul className="mt-4 grid grid-cols-4 gap-3 md:gap-4">
          {shelf.map((f, i) => (
            <FilmPoster
              key={f.title}
              index={i}
              title={f.title}
              meta={films.length ? `${t.rated} ${f.meta}` : f.meta}
              href={f.href}
              image={f.image}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}
