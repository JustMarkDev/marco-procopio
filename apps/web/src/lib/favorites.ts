import { Effect, Schema } from "effect";

import { ENV } from "@/env.server";
import { profiles } from "@/lib/content";
import { fetchJson, orElse } from "@/lib/http";

export type Favorite = {
  title: string;
  href: string;
  image?: string;
  /** The rating, e.g. "9/10". */
  meta: string;
};

const TOP = 10;

/** Trakt slugs kept off the shelves: Shrek, Shrek 2, Inside Man. */
const HIDDEN_TRAKT = new Set(["shrek-2001", "shrek-2-2004", "inside-man-2006"]);
/** Trakt slugs pinned to the top of their shelf, in order: Interstellar. */
const PINNED_TRAKT = ["interstellar-2014"];
/**
 * Series slugs in release order. When a later entry makes the shelf, the
 * earlier ones join it right before, so sagas read oldest first.
 */
const SERIES_TRAKT = [
  ["john-wick-2014", "john-wick-chapter-2-2017", "john-wick-chapter-3-parabellum-2019"],
];

// Trakt: highest rated films and series, most recent rating first on ties.
const TraktItem = Schema.Struct({
  title: Schema.String,
  ids: Schema.Struct({ slug: Schema.String }),
  // `extended=images` returns protocol-less URLs, e.g. "walter-r2.trakt.tv/images/…".
  images: Schema.optional(Schema.Struct({ poster: Schema.optional(Schema.Array(Schema.String)) })),
});
const TraktRatings = Schema.Array(
  Schema.Struct({
    rating: Schema.Number,
    rated_at: Schema.String,
    movie: Schema.optional(TraktItem),
    show: Schema.optional(TraktItem),
  }),
);

const trakt = (kind: "movies" | "shows") =>
  !ENV.TRAKT_CLIENT_ID || !profiles.trakt
    ? Effect.succeed([])
    : fetchJson(
        `https://api.trakt.tv/users/${profiles.trakt}/ratings/${kind}?extended=images`,
        TraktRatings,
        {
          headers: {
            "Content-Type": "application/json",
            "trakt-api-version": "2",
            "trakt-api-key": ENV.TRAKT_CLIENT_ID,
            // Cloudflare in front of api.trakt.tv challenges Node's default
            // "node" User-Agent, so identify the app instead.
            "User-Agent": "marco-procopio-portfolio",
          },
        },
      ).pipe(
        Effect.map((ratings) => {
          const visible = ratings
            .toSorted((a, b) => b.rating - a.rating || b.rated_at.localeCompare(a.rated_at))
            .filter(({ movie, show }) => !HIDDEN_TRAKT.has((movie ?? show)?.ids.slug ?? ""));
          const pinned = PINNED_TRAKT.flatMap((slug) =>
            visible.filter(({ movie, show }) => (movie ?? show)?.ids.slug === slug),
          );
          const rest = visible.filter(
            ({ movie, show }) => !PINNED_TRAKT.includes((movie ?? show)?.ids.slug ?? ""),
          );
          const slugOf = ({ movie, show }: (typeof visible)[number]) =>
            (movie ?? show)?.ids.slug ?? "";
          let shelf = [...pinned, ...rest].slice(0, TOP);
          for (const series of SERIES_TRAKT) {
            const first = shelf.findIndex((r) => series.includes(slugOf(r)));
            if (first === -1) continue;
            // Members already in, plus earlier ones missing but rated.
            const members = series.filter(
              (slug, i) =>
                shelf.some((r) => slugOf(r) === slug) ||
                (series.slice(i + 1).some((later) => shelf.some((r) => slugOf(r) === later)) &&
                  visible.some((r) => slugOf(r) === slug)),
            );
            const others = shelf.filter((r) => !series.includes(slugOf(r)));
            shelf = [
              ...others.slice(0, first),
              ...members.map((slug) => visible.find((r) => slugOf(r) === slug)!),
              ...others.slice(first),
            ].slice(0, TOP);
          }
          return shelf.flatMap(({ rating, movie, show }): Favorite[] => {
            const item = movie ?? show;
            if (!item) return [];
            const poster = item.images?.poster?.[0];
            return [
              {
                title: item.title,
                href: `https://trakt.tv/${kind}/${item.ids.slug}`,
                image: poster && (poster.startsWith("http") ? poster : `https://${poster}`),
                meta: `${rating}/10`,
              },
            ];
          });
        }),
        orElse(`Trakt ${kind}`, []),
      );

/** Top rated films on Trakt, best first. Empty when Trakt isn't configured or is down. */
export const getFilms = (): Promise<Favorite[]> => Effect.runPromise(trakt("movies"));
