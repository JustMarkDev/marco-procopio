import { Effect, Schema } from "effect";
import { afterEach, expect, test, vi } from "vite-plus/test";

import { fetchJson } from "./http";

const Body = Schema.Struct({ name: Schema.String });

/** Answer each call in turn with `answers`: a status and JSON body, or an Error to throw. */
const answer = (...answers: ([number, unknown] | Error)[]) => {
  const fetch = vi.fn(async () => {
    const next = answers.shift()!;
    if (next instanceof Error) throw next;
    return new Response(JSON.stringify(next[1]), { status: next[0] });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
};
const run = () =>
  Effect.runPromise(Effect.result(fetchJson("https://api.test/x?key=secret", Body)));

afterEach(() => vi.unstubAllGlobals());

test("decodes a good answer with one call", async () => {
  const fetch = answer([200, { name: "Song" }]);
  expect(await run()).toMatchObject({ _tag: "Success", success: { name: "Song" } });
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("a 4xx answer is final: one call", async () => {
  const fetch = answer([403, { error: 10 }]);
  expect(await run()).toMatchObject({ _tag: "Failure", failure: { _tag: "FetchError" } });
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("an answer that does not decode is final: one call", async () => {
  const fetch = answer([200, { error: 6, message: "Track not found" }]);
  expect(await run()).toMatchObject({ _tag: "Failure", failure: { _tag: "SchemaError" } });
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("a 5xx or a network error is retried until it works", async () => {
  const fetch = answer([503, {}], new Error("reset"), [200, { name: "Song" }]);
  expect(await run()).toMatchObject({ _tag: "Success", success: { name: "Song" } });
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("gives up after three calls and keeps the key out of the error", async () => {
  const fetch = answer([500, {}], [500, {}], [500, {}]);
  const result = await run();
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(result).toMatchObject({ _tag: "Failure", failure: { endpoint: "https://api.test/x" } });
  expect(JSON.stringify(result, (k, v) => (k === "cause" ? String(v) : v))).not.toContain("secret");
});
