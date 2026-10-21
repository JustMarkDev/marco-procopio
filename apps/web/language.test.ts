import { expect, test } from "vite-plus/test";

import { ITALIAN } from "./language";

const italian = new RegExp(`^(?:${ITALIAN.value})$`);

test.each([
  ["it", true],
  ["IT", true],
  ["it-IT,it;q=0.9,en;q=0.8", true],
  ["fr,it;q=0.8", true],
  ["fr, it", true],
  ["zh-CN,zh;q=0.9,it;q=0.8", true],
  ["en-US,en;q=0.9", false],
  ["en, it", false],
  ["fr,en;q=0.8,it;q=0.5", false],
  ["itx,en", false],
  ["de-DE,de;q=0.9", false],
  ["*", false],
  ["", false],
])("Accept-Language %j is Italian: %s", (header, expected) => {
  expect(italian.test(header)).toBe(expected);
});

test("a long header of single letters is answered at once", () => {
  const header = `${Array(5000).fill("e").join(", ")},ix`;
  const start = performance.now();
  expect(italian.test(header)).toBe(false);
  expect(performance.now() - start).toBeLessThan(100);
});
