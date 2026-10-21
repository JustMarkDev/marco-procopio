/** Trakt slugs kept off the shelf: Shrek, Shrek 2, Inside Man. */
const HIDDEN = new Set(["shrek-2001", "shrek-2-2004", "inside-man-2006"]);
/** Trakt slugs pinned to the top of the shelf, in order: Interstellar. */
const PINNED = ["interstellar-2014"];
/**
 * Series slugs in release order. When a later entry makes the shelf, the
 * earlier ones join it right before, so sagas read oldest first.
 */
const SERIES = [
  ["john-wick-2014", "john-wick-chapter-2-2017", "john-wick-chapter-3-parabellum-2019"],
];

type Rated = { rating: number; rated_at: string; movie: { ids: { slug: string } } };

const slugOf = (r: Rated) => r.movie.ids.slug;

/** The best `top` rated films: highest first, most recent rating first on ties, with the rules above. */
export function pickShelf<T extends Rated>(ratings: readonly T[], top: number): T[] {
  const visible = ratings
    .toSorted((a, b) => b.rating - a.rating || b.rated_at.localeCompare(a.rated_at))
    .filter((r) => !HIDDEN.has(slugOf(r)));
  const pinned = PINNED.flatMap((slug) => visible.filter((r) => slugOf(r) === slug));
  const rest = visible.filter((r) => !PINNED.includes(slugOf(r)));
  let shelf = [...pinned, ...rest].slice(0, top);
  for (const series of SERIES) {
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
    ].slice(0, top);
  }
  return shelf;
}
