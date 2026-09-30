import { getNowPlaying } from "@/lib/lastfm";

export async function GET() {
  return Response.json(await getNowPlaying(), {
    // The CDN answers repeat polls, so Last.fm sees about one request every 20 seconds.
    headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" },
  });
}
