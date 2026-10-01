import { Effect, Schema } from "effect";

import { ENV } from "@/env.server";
import { profiles } from "@/lib/content";
import { fetchJson, orElse } from "@/lib/http";

export type Track = {
  name: string;
  artist: string;
  album?: string;
  image?: string;
  url: string;
  playing: boolean;
  /** Unix ms of the last scrobble; absent while playing. */
  playedAt?: number;
};

const LastfmTrack = Schema.Struct({
  name: Schema.String,
  url: Schema.String,
  artist: Schema.Struct({ "#text": Schema.String }),
  album: Schema.Struct({ "#text": Schema.String }),
  image: Schema.Array(Schema.Struct({ size: Schema.String, "#text": Schema.String })),
  "@attr": Schema.optional(Schema.Struct({ nowplaying: Schema.String })),
  date: Schema.optional(Schema.Struct({ uts: Schema.NumberFromString })),
});

const RecentTracks = Schema.Struct({
  recenttracks: Schema.Struct({
    // Last.fm returns a bare object instead of an array when there is one track.
    track: Schema.Union([Schema.Array(LastfmTrack), LastfmTrack]),
  }),
});

const Image = Schema.Struct({ size: Schema.String, "#text": Schema.String });

/** Image hashes Last.fm uses for its default star placeholder. */
const PLACEHOLDERS = ["2a96cbd8b46e442fc41c2b86b821562f"];

// Scrobbles from local files or YouTube often carry no album, so the track
// above has no artwork. track.getInfo usually resolves the album anyway.
const TrackInfo = Schema.Struct({
  track: Schema.Struct({
    album: Schema.optional(Schema.Struct({ title: Schema.String, image: Schema.Array(Image) })),
  }),
});

const ArtistInfo = Schema.Struct({
  artist: Schema.Struct({ image: Schema.Array(Image) }),
});

const large = (images: readonly (typeof Image.Type)[] | undefined) => {
  const url =
    images?.find((i) => i.size === "extralarge")?.["#text"] ||
    images?.find((i) => i.size === "large")?.["#text"] ||
    undefined;
  // Last.fm serves its default star placeholder as a real URL. Treat as missing.
  return url && !PLACEHOLDERS.some((hash) => url.includes(hash)) ? url : undefined;
};

type Artwork = { image?: string; album?: string };

/** Artwork resolved via follow-up calls, keyed by scrobble. Capped. */
const artworkCache = new Map<string, Artwork>();

const artwork = (artist: string, name: string): Effect.Effect<Artwork> => {
  const key = `${artist} — ${name}`;
  const hit = artworkCache.get(key);
  if (hit) return Effect.succeed(hit);
  const remember = (found: Artwork) =>
    Effect.sync(() => {
      if (artworkCache.size >= 200) {
        const oldest = artworkCache.keys().next();
        if (oldest.value) artworkCache.delete(oldest.value);
      }
      artworkCache.set(key, found);
    }).pipe(Effect.as(found));
  const qs = `api_key=${ENV.LASTFM_API_KEY}&format=json&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(name)}`;
  return fetchJson(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&${qs}`, TrackInfo).pipe(
    Effect.map(({ track }): Artwork => ({
      image: large(track.album?.image),
      album: track.album?.title,
    })),
    // Unknown track: fall back to the artist photo instead of failing.
    Effect.catch(() => Effect.succeed<Artwork>({})),
    Effect.flatMap((found) =>
      found.image
        ? Effect.succeed(found)
        : fetchJson(
            `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=${ENV.LASTFM_API_KEY}&format=json&artist=${encodeURIComponent(artist)}`,
            ArtistInfo,
          ).pipe(
            Effect.map(({ artist }): Artwork => ({ image: large(artist.image) })),
            Effect.catch(() => Effect.succeed<Artwork>({})),
          ),
    ),
    Effect.flatMap(remember),
  );
};

/** What's playing now, or the last scrobble. Null when Last.fm isn't configured or is down. */
export const getNowPlaying = () =>
  !ENV.LASTFM_API_KEY || !profiles.lastfm
    ? Promise.resolve(null)
    : fetchJson(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${profiles.lastfm}&api_key=${ENV.LASTFM_API_KEY}&format=json&limit=1`,
        RecentTracks,
      ).pipe(
        Effect.flatMap(({ recenttracks }) => {
          const list = recenttracks.track;
          const t = "name" in list ? list : list[0];
          if (!t) return Effect.succeed(null);
          const artist = t.artist["#text"];
          const base = {
            name: t.name,
            artist,
            album: t.album["#text"] || undefined,
            url: t.url,
            playing: t["@attr"]?.nowplaying === "true",
            playedAt: t.date && t.date.uts * 1000,
          };
          const image = large(t.image);
          if (image) return Effect.succeed({ ...base, image });
          return Effect.map(artwork(artist, t.name), (extra) => ({
            ...base,
            album: base.album ?? extra.album,
            image: extra.image,
          }));
        }),
        orElse("Last.fm", null),
        Effect.runPromise,
      );
