# marco-procopio

Personal portfolio of Marco Procopio, built with Next.js 16, Tailwind CSS v4, Motion, WebGL and Effect.
Four pages (`/`, `/work`, `/me`, `/about`), dark only. Each serves English or Italian from the same
URL: `src/proxy.ts` picks from the browser's Accept-Language and rewrites to a hidden `[lang]` segment.

## Develop

```bash
bun install
bun run dev        # http://localhost:3001
bun run check      # format, lint, type-check
bun run build
bun run --cwd apps/web test:e2e   # Playwright smoke test (starts the dev server if needed)
```

## Where things are

- `apps/web/src/lib/copy.ts`: all page copy, in both languages.
- `apps/web/src/lib/content.ts`: links, profiles and the Work rows.
- `apps/web/src/lib/lastfm.ts`, `favorites.ts`: Effect programs for the live track (Last.fm) and favourite films (Trakt).
- `apps/web/src/components/art-stage.tsx`, `gl.ts`, `scenes.ts`: the WebGL dither art behind each page and its cursor reveal.
- `apps/web/public/art/`: background photos (sources in `scenes.ts`). `public/work/`: project screenshots. `public/Marco-Procopio-CV.pdf`: downloadable CV.

## Environment

`LASTFM_API_KEY` and `TRAKT_CLIENT_ID` (both optional) turn on the live track and films;
without them the pages show fallback content.
The schema is in `apps/web/.env.schema` (managed by varlock).
