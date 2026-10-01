import { Effect, Schema } from "effect";

import { ENV } from "@/env.server";
import { fetchJson, orElse } from "@/lib/http";

/** GET a GitHub API path and decode the JSON body with `schema`. */
const githubGet = <A>(path: string, schema: Schema.Decoder<A>) =>
  fetchJson(`https://api.github.com${path}`, schema, {
    headers: {
      Accept: "application/vnd.github+json",
      // Unauthenticated requests are limited to 60 per hour.
      ...(ENV.GITHUB_TOKEN ? { Authorization: `Bearer ${ENV.GITHUB_TOKEN}` } : {}),
    },
  });

const Repos = Schema.Array(
  Schema.Struct({
    name: Schema.String,
    pushed_at: Schema.DateFromString,
  }),
);

/** Repo name -> last push date. Empty map when GitHub is unreachable, so the page still renders. */
export const getRepoActivity = () =>
  githubGet("/users/JustMarkDev/repos?per_page=100", Repos).pipe(
    Effect.map((repos) => new Map(repos.map((r) => [r.name, r.pushed_at]))),
    orElse("GitHub activity", new Map<string, Date>()),
    Effect.runPromise,
  );

const PullRequest = Schema.Struct({
  state: Schema.Literals(["open", "closed"]),
  merged_at: Schema.NullOr(Schema.DateFromString),
  base: Schema.Struct({ repo: Schema.Struct({ stargazers_count: Schema.Number }) }),
});

export type PullStatus = {
  state: "merged" | "open" | "closed";
  mergedAt?: Date;
  stars: number;
};

/**
 * Live status for each pull request URL, fetched in parallel.
 * A PR that fails to load maps to undefined, so the list still renders from static content.
 */
export const getPullStatuses = (urls: readonly string[]) =>
  Effect.forEach(
    urls,
    (url) => {
      const [, owner, repo, number] = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/.exec(url) ?? [];
      if (!number) return Effect.succeed(undefined);
      return githubGet(`/repos/${owner}/${repo}/pulls/${number}`, PullRequest).pipe(
        Effect.map((pr): PullStatus | undefined => ({
          state: pr.merged_at ? "merged" : pr.state,
          mergedAt: pr.merged_at ?? undefined,
          stars: pr.base.repo.stargazers_count,
        })),
        orElse(`Pull request ${url}`, undefined),
      );
    },
    { concurrency: 4 },
  ).pipe(Effect.runPromise);
