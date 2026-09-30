import { Data, Effect, Schema } from "effect";

export class FetchError extends Data.TaggedError("FetchError")<{
  /** URL without the query string, which can hold API keys. */
  endpoint: string;
  cause: unknown;
}> {}

/** Fetch JSON and decode it with `schema`, with a timeout and two retries. */
export const fetchJson = <A, I>(url: string, schema: Schema.Schema<A, I>, init?: RequestInit) =>
  Effect.tryPromise({
    try: async (signal) => {
      const res = await fetch(url, { ...init, signal });
      if (!res.ok) throw new Error(`Responded ${res.status}`);
      return res.json();
    },
    catch: (cause) => new FetchError({ endpoint: url.split("?")[0]!, cause }),
  }).pipe(
    Effect.flatMap(Schema.decodeUnknown(schema)),
    Effect.timeout("5 seconds"),
    Effect.retry({ times: 2 }),
  );

/** Run `effect`, logging and returning `fallback` on any failure, so one dead source never breaks a page. */
export const orElse =
  <B>(label: string, fallback: B) =>
  <A, E>(effect: Effect.Effect<A, E>): Effect.Effect<A | B> =>
    effect.pipe(
      Effect.catchAll((error) =>
        Effect.logWarning(`${label} unavailable`, error).pipe(Effect.as(fallback)),
      ),
    );
