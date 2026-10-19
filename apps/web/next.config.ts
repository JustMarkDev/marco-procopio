import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();
import type { NextConfig } from "next";

// Italian if the first it/en tag in Accept-Language is `it` (browsers list tags best
// first), otherwise English. Written without lookaheads so Vercel's router can run it;
// matches the old proxy's q-sorted pick for every header a browser sends.
const NOT_IT_OR_EN = "(?:[^,eEiI ][^,]*|[eE][^,nN][^,]*|[iI][^,tT][^,]*|[eEiI])";
const ITALIAN = {
  type: "header",
  key: "accept-language",
  value: `(?: *${NOT_IT_OR_EN}, *)* *[iI][tT](?:[-;,].*)?`,
} as const;
// Pages only: not API routes, Next internals, metadata images or files with an extension.
const PAGE = "/:path((?!api|_next|icon|apple-icon|opengraph-image|twitter-image)[^.]+)";

const nextConfig: NextConfig = {
  typedRoutes: true,
  poweredByHeader: false,
  reactCompiler: true,
  images: {
    // Trakt film posters on the "me" page.
    remotePatterns: [{ protocol: "https", hostname: "**.trakt.tv" }],
    // The art and screenshots only change with a deploy, so let browsers and the CDN keep
    // each resized copy for a month instead of the 4 hour default.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  // The stylesheet is a few KB gzipped: inlining it drops a render-blocking request from
  // every first visit, and later page changes never refetch it either way.
  experimental: { inlineCss: true },
  rewrites: async () => ({
    // There is no language switcher: each page request is rewritten to the hidden [lang]
    // segment picked from Accept-Language. This runs in the router, ahead of the cache and
    // with no function call, so every page is plain static output. Typing a language into
    // the URL only nests it again and 404s, so the browser setting always wins.
    // Rules apply in turn to the already rewritten path, so each language rule is
    // exclusive of the other: English is "no Italian", not "anything left".
    beforeFiles: [
      { source: PAGE, has: [ITALIAN], destination: "/it/:path" },
      { source: PAGE, missing: [ITALIAN], destination: "/en/:path" },
      { source: "/", has: [ITALIAN], destination: "/it" },
      { source: "/", missing: [ITALIAN], destination: "/en" },
    ],
    // Crawlers and readers that skip <link rel="icon"> ask for /favicon.ico; browsers sniff the PNG.
    afterFiles: [{ source: "/favicon.ico", destination: "/icon" }],
    fallback: [],
  }),
  // Links to the previous site: its Italian pages, case studies and the redesign preview.
  redirects: async () => [
    { source: "/it/work/:slug", destination: "/work", permanent: true },
    { source: "/it", destination: "/", permanent: true },
    { source: "/it/:path*", destination: "/:path*", permanent: true },
    { source: "/work/:slug", destination: "/work", permanent: true },
    { source: "/redesign", destination: "/", permanent: true },
    { source: "/redesign/:path*", destination: "/:path*", permanent: true },
  ],
};

export default withVarlock(nextConfig);
