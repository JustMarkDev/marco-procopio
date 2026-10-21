import { expect, test } from "vite-plus/test";

import { pickShelf } from "./shelf";

const film = (slug: string, rating: number, rated_at = "2026-01-01") => ({
  rating,
  rated_at,
  movie: { ids: { slug } },
});
const slugs = (films: ReturnType<typeof film>[]) => films.map((f) => f.movie.ids.slug);

test("sorts by rating, then by the most recent rating", () => {
  const shelf = pickShelf(
    [film("b", 9, "2026-01-01"), film("a", 10), film("c", 9, "2026-03-01")],
    10,
  );
  expect(slugs(shelf)).toEqual(["a", "c", "b"]);
});

test("drops hidden films and pins Interstellar first", () => {
  const shelf = pickShelf(
    [film("shrek-2001", 10), film("a", 10), film("interstellar-2014", 8)],
    10,
  );
  expect(slugs(shelf)).toEqual(["interstellar-2014", "a"]);
});

test("keeps at most `top` films", () => {
  const shelf = pickShelf([film("a", 10), film("b", 9), film("c", 8)], 2);
  expect(slugs(shelf)).toEqual(["a", "b"]);
});

test("a saga that makes the shelf brings its earlier, rated films right before it", () => {
  const wick1 = "john-wick-2014";
  const wick2 = "john-wick-chapter-2-2017";
  const wick3 = "john-wick-chapter-3-parabellum-2019";
  const shelf = pickShelf(
    [film("a", 10), film(wick3, 9), film("b", 8), film(wick1, 7), film(wick2, 6)],
    10,
  );
  expect(slugs(shelf)).toEqual(["a", wick1, wick2, wick3, "b"]);
});

test("a saga that misses the shelf adds nothing", () => {
  const shelf = pickShelf([film("a", 10), film("b", 9), film("john-wick-2014", 7)], 2);
  expect(slugs(shelf)).toEqual(["a", "b"]);
});
