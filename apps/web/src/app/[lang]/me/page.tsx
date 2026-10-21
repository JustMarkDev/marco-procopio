import type { Metadata } from "next";

import { preloadArt } from "@/components/art-image";
import { FilmPoster } from "@/components/film-poster";
import { OnRepeat } from "@/components/on-repeat";
import { Rise } from "@/components/reveal";
import { getFilms } from "@/lib/favorites";
import { getNowPlaying } from "@/lib/lastfm";
import { asLang, copy } from "@/lib/copy";

export const metadata: Metadata = { title: "Me" };

// Trakt ratings change rarely; the track is refreshed client-side.
export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  preloadArt("me");
  const lang = asLang((await params).lang);
  const { me: t, nav } = copy[lang];
  const [track, films] = await Promise.all([getNowPlaying(), getFilms()]);

  return (
    <main className="flex flex-1 flex-col justify-end gap-14 pt-[34vh] pb-10 md:flex-row md:items-end md:justify-between md:gap-12 md:pb-[69px]">
      <OnRepeat lang={lang} title={nav.me} t={t} initial={track} />
      {films.length > 0 && (
        <section aria-labelledby="films" className="w-full md:mb-16 md:w-[488px] md:shrink-0">
          <Rise delay={0.2}>
            <h2 id="films" className="text-[15px]">
              {t.films}
            </h2>
          </Rise>
          <ul className="mt-4 grid grid-cols-4 gap-3 md:gap-4">
            {films.slice(0, 4).map((f, i) => (
              <FilmPoster
                key={f.title}
                index={i}
                title={f.title}
                meta={`${t.rated} ${f.meta}`}
                href={f.href}
                image={f.image}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
