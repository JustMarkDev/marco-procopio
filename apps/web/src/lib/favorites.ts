import { Effect, Schema } from "effect";

import { ENV } from "@/env.server";
import { profiles } from "@/lib/content";
import { fetchJson, orElse } from "@/lib/http";
import { pickShelf } from "@/lib/shelf";

export type Favorite = {
  title: string;
  href: string;
  image?: string;
  /** The rating, e.g. "9/10". */
  meta: string;
};

const TOP = 10;

// Trakt: highest rated films, most recent rating first on ties.
const TraktRatings = Schema.Array(
  Schema.Struct({
    rating: Schema.Number,
    rated_at: Schema.String,
    movie: Schema.Struct({
      title: Schema.String,
      ids: Schema.Struct({ slug: Schema.String }),
      // `extended=images` returns protocol-less URLs, e.g. "walter-r2.trakt.tv/images/…".
      images: Schema.optional(
        Schema.Struct({ poster: Schema.optional(Schema.Array(Schema.String)) }),
      ),
    }),
  }),
);

const trakt = () =>
  !ENV.TRAKT_CLIENT_ID || !profiles.trakt
    ? Effect.succeed([])
    : fetchJson(
        `https://api.trakt.tv/users/${profiles.trakt}/ratings/movies?extended=images`,
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
        Effect.map((ratings) =>
          pickShelf(ratings, TOP).map(({ rating, movie }): Favorite => {
            const poster = movie.images?.poster?.[0];
            return {
              title: movie.title,
              href: `https://trakt.tv/movies/${movie.ids.slug}`,
              image: poster && (poster.startsWith("http") ? poster : `https://${poster}`),
              meta: `${rating}/10`,
            };
          }),
        ),
        orElse("Trakt", []),
      );

/** Top rated films on Trakt, best first. Empty when Trakt isn't configured or is down. */
export const getFilms = (): Promise<Favorite[]> => Effect.runPromise(trakt());
