// Italian if the first it/en tag in Accept-Language is `it` (browsers list tags best
// first), otherwise English. Written without lookaheads so Vercel's router can run it;
// matches the old proxy's q-sorted pick for every header a browser sends. Spaces are
// allowed before a tag but not after the comma: with both, "e, e, e, …" splits 2^n ways and
// a long header freezes a backtracking engine such as Node's.
const NOT_IT_OR_EN = "(?:[^,eEiI ][^,]*|[eE][^,nN][^,]*|[iI][^,tT][^,]*|[eEiI])";
export const ITALIAN = {
  type: "header",
  key: "accept-language",
  value: `(?: *${NOT_IT_OR_EN},)* *[iI][tT](?:[-;,].*)?`,
} as const;
// Pages only: not API routes, Next internals, metadata images or files with an extension.
export const PAGE = "/:path((?!api|_next|icon|apple-icon|opengraph-image|twitter-image)[^.]+)";
