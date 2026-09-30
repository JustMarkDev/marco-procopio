import { Effect, Schema } from "effect";

import { ENV } from "@/env.server";
import { profiles } from "@/lib/content";
import { fetchJson, orElse } from "@/lib/http";

export type Favorite = {
  title: string;
  href: string;
  image?: string;
  /** Short status line: "9/10", "412 h", "Ep 12" or "Ch 104". */
  meta: string;
};

export const shelves = ["films", "series", "anime", "manga", "games"] as const;
export type Shelf = (typeof shelves)[number];
export type Favorites = Record<Shelf, Favorite[]>;

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

// AniList: what you're watching/reading now first, then what you just finished.
// Sorted by most recently updated within each group.
const AniListMedia = Schema.Struct({
  siteUrl: Schema.String,
  title: Schema.Struct({ english: Schema.NullOr(Schema.String), romaji: Schema.String }),
  coverImage: Schema.Struct({ large: Schema.NullOr(Schema.String) }),
  startDate: Schema.Struct({ year: Schema.NullOr(Schema.Number) }),
});
const AniListEntry = Schema.Struct({
  score: Schema.Number,
  updatedAt: Schema.Number,
  status: Schema.String,
  progress: Schema.Number,
  media: AniListMedia,
});
const Collection = Schema.Struct({
  lists: Schema.Array(
    Schema.Struct({
      isCustomList: Schema.Boolean,
      entries: Schema.Array(AniListEntry),
    }),
  ),
});
const AniListResponse = Schema.Struct({
  data: Schema.Struct({
    anime: Collection,
    manga: Collection,
  }),
});

const media = `siteUrl title { english romaji } coverImage { large } startDate { year }`;
const collection = (type: string) => `MediaListCollection(userName: $user, type: ${type}) {
  lists { isCustomList entries { score(format: POINT_10_DECIMAL) updatedAt status progress media { ${media} } } }
}`;
const anilistQuery = `query ($user: String) {
  anime: ${collection("ANIME")}
  manga: ${collection("MANGA")}
}`;

const shelf = (kind: "anime" | "manga", list: typeof Collection.Type): Favorite[] => {
  // Custom lists repeat entries from the status lists.
  const entries = list.lists.filter((l) => !l.isCustomList).flatMap((l) => l.entries);
  const rank = (status: string) => (status === "CURRENT" || status === "REPEATING" ? 0 : 1);
  const picks = entries
    .filter((e) => e.status === "CURRENT" || e.status === "REPEATING" || e.status === "COMPLETED")
    .toSorted((a, b) => rank(a.status) - rank(b.status) || b.updatedAt - a.updatedAt)
    .slice(0, TOP);
  return picks.map((e) => {
    const m = e.media;
    const active = e.status === "CURRENT" || e.status === "REPEATING";
    const count = `${kind === "anime" ? "Ep" : "Ch"} ${e.progress}`;
    return {
      title: m.title.english ?? m.title.romaji,
      href: m.siteUrl,
      image: m.coverImage.large ?? undefined,
      meta: active
        ? e.progress > 0
          ? count
          : kind === "anime"
            ? "Watching"
            : "Reading"
        : e.progress > 0
          ? count
          : e.score
            ? `${e.score}/10`
            : String(m.startDate.year ?? "Completed"),
    };
  });
};

const empty = { anime: [] as Favorite[], manga: [] as Favorite[] };

const anilist = () =>
  !profiles.anilist
    ? Effect.succeed(empty)
    : fetchJson("https://graphql.anilist.co", AniListResponse, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: anilistQuery, variables: { user: profiles.anilist } }),
      }).pipe(
        Effect.map(({ data }) => ({
          anime: shelf("anime", data.anime),
          manga: shelf("manga", data.manga),
        })),
        orElse("AniList", empty),
      );

// Steam: most played games. Needs "Game details" set to public on the profile.
const OwnedGames = Schema.Struct({
  response: Schema.Struct({
    games: Schema.optionalWith(
      Schema.Array(
        Schema.Struct({
          appid: Schema.Number,
          name: Schema.String,
          playtime_forever: Schema.Number,
        }),
      ),
      { default: () => [] },
    ),
  }),
});

/** Apps whose hours count toward another game: tModLoader (1281930) is Terraria (105600). */
const MERGE: Record<number, number> = { 1281930: 105600 };
/** Played, but not favourites: BRAIN / OUT, Counter-Strike 2, Warframe, Splitgate 1 & 2, Marvel Rivals. */
const HIDE = new Set([578310, 730, 230410, 677620, 1978780, 2767030]);

const steam = () =>
  !ENV.STEAM_API_KEY || !profiles.steam
    ? Effect.succeed([])
    : fetchJson(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${ENV.STEAM_API_KEY}&steamid=${profiles.steam}&include_appinfo=1&include_played_free_games=1`,
        OwnedGames,
      ).pipe(
        Effect.map(({ response }) =>
          response.games
            .map((g) => ({
              ...g,
              playtime_forever:
                g.playtime_forever +
                response.games
                  .filter((other) => MERGE[other.appid] === g.appid)
                  .reduce((sum, other) => sum + other.playtime_forever, 0),
            }))
            .filter((g) => g.playtime_forever > 0 && !(g.appid in MERGE) && !HIDE.has(g.appid))
            .toSorted((a, b) => b.playtime_forever - a.playtime_forever)
            .slice(0, TOP)
            .map((g): Favorite => ({
              title: g.name,
              href: `https://store.steampowered.com/app/${g.appid}`,
              image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/library_600x900.jpg`,
              meta: `${Math.round(g.playtime_forever / 60)} h`,
            })),
        ),
        orElse("Steam games", []),
      );

/** Top 10 per shelf, all sources in parallel. A source that fails or isn't configured is empty. */
export const getFavorites = (): Promise<Favorites> =>
  Effect.all(
    { films: trakt("movies"), series: trakt("shows"), anilist: anilist(), games: steam() },
    { concurrency: "unbounded" },
  ).pipe(
    Effect.map(({ anilist, ...rest }) => ({ ...rest, ...anilist })),
    Effect.runPromise,
  );
