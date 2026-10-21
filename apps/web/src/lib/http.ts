import { Data, Effect, Schedule, Schema } from "effect";

export class FetchError extends Data.TaggedError("FetchError")<{
  /** URL without the query string, which can hold API keys. */
  endpoint: string;
  /** False for a 4xx answer: asking again gets the same one. */
  transient: boolean;
  cause: unknown;
}> {}

/** A 4xx answer. */
class Rejected extends Error {}

/** A network error, timeout or 5xx, which a later attempt can fix. */
export const isTransient = (error: { _tag: string; transient?: boolean }) =>
  error._tag === "TimeoutError" || (error._tag === "FetchError" && error.transient === true);

/**
 * Fetch JSON and decode it with `schema`. Each attempt times out after 5 seconds and
 * transient failures are tried again, twice, 300 ms apart. An answer that does not decode is final.
 */
export const fetchJson = <A>(url: string, schema: Schema.Decoder<A>, init?: RequestInit) =>
  Effect.tryPromise({
    try: async (signal) => {
      const res = await fetch(url, { ...init, signal });
      if (!res.ok) {
        throw new (res.status < 500 ? Rejected : Error)(`Responded ${res.status}`);
      }
      return res.json();
    },
    catch: (cause) =>
      new FetchError({
        endpoint: url.split("?")[0]!,
        transient: !(cause instanceof Rejected),
        cause,
      }),
  }).pipe(
    Effect.timeout("5 seconds"),
    Effect.retry({ schedule: Schedule.spaced("300 millis"), times: 2, while: isTransient }),
    Effect.flatMap(Schema.decodeUnknownEffect(schema)),
  );

/** Run `effect`, logging and returning `fallback` on any failure, so one dead source never breaks a page. */
export const orElse =
  <B>(label: string, fallback: B) =>
  <A, E>(effect: Effect.Effect<A, E>): Effect.Effect<A | B> =>
    effect.pipe(
      Effect.catch((error) =>
        Effect.logWarning(`${label} unavailable`, error).pipe(Effect.as(fallback)),
      ),
    );
