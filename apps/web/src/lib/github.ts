import { Data, Effect, Schema } from "effect";

import { ENV } from "@/env.server";

const Repos = Schema.Array(
  Schema.Struct({
    name: Schema.String,
    pushed_at: Schema.String,
  }),
);

class GitHubError extends Data.TaggedError("GitHubError")<{ cause: unknown }> {}

const fetchRepos = Effect.tryPromise({
  try: async (signal) => {
    const res = await fetch("https://api.github.com/users/JustMarkDev/repos?per_page=100", {
      signal,
      headers: {
        Accept: "application/vnd.github+json",
        // Unauthenticated requests are limited to 60 per hour.
        ...(ENV.GITHUB_TOKEN ? { Authorization: `Bearer ${ENV.GITHUB_TOKEN}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    return res.json();
  },
  catch: (cause) => new GitHubError({ cause }),
}).pipe(
  Effect.flatMap(Schema.decodeUnknown(Repos)),
  Effect.timeout("5 seconds"),
  Effect.retry({ times: 2 }),
);

/** Repo name -> last push date. Empty map when GitHub is unreachable, so the page still renders. */
export const getRepoActivity = () =>
  fetchRepos.pipe(
    Effect.map((repos) => new Map(repos.map((r) => [r.name, new Date(r.pushed_at)]))),
    Effect.catchAll((error) =>
      Effect.logWarning("GitHub activity unavailable", error).pipe(
        Effect.as(new Map<string, Date>()),
      ),
    ),
    Effect.runPromise,
  );
