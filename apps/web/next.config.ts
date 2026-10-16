import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  images: {
    // Trakt film posters on the "me" page.
    remotePatterns: [{ protocol: "https", hostname: "**.trakt.tv" }],
  },
  // Crawlers and readers that skip <link rel="icon"> ask for /favicon.ico; browsers sniff the PNG.
  rewrites: async () => [{ source: "/favicon.ico", destination: "/icon" }],
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
