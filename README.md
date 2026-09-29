# marco-procopio

Personal portfolio of Marco Procopio, built with Next.js 16, Tailwind CSS v4, Motion and Effect.
English lives at `/`, Italian at `/it`.

## Develop

```bash
bun install
bun run dev        # http://localhost:3001
bun run check      # format, lint, type-check
bun run build
bun run --cwd apps/web test:e2e   # Playwright smoke test (starts the dev server if needed)
```

## Where things are

- `apps/web/src/lib/content.ts`: all copy (both languages), projects, links.
- `apps/web/src/lib/github.ts`: Effect program that fetches repo activity from GitHub, with retries and a fallback.
- `apps/web/src/components/dither.tsx`: WebGL dither shader for the background and the project images.
- `apps/web/src/components/nav.tsx`: docked/detached nav, theme switch, language switch.
- `apps/web/public/work/`: project screenshots. `public/Marco-Procopio-CV.pdf`: downloadable CV.

## Environment

`GITHUB_TOKEN` (optional) raises the GitHub API rate limit for the repo activity fetch.
The schema is in `apps/web/.env.schema` (managed by varlock).
