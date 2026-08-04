# Marco Procopio — Portfolio

A fast, bilingual personal portfolio built with Next.js, TypeScript, Tailwind CSS, Base UI, and Vite+. The visual implementation follows the source design in `Design/portfolio-design`.

## Local development

Install the latest stable Bun release, then run:

```bash
bun install --frozen-lockfile
bun run dev
```

Open `http://localhost:3000`. The unprefixed route selects Italian for visitors whose Vercel country header is `IT`, and English otherwise. A saved language preference takes precedence.

Useful checks:

```bash
bun run check
bun run test
bun run build
```

## Deployment

Deploy the repository to Vercel. After the first production deployment:

1. Set `NEXT_PUBLIC_SITE_URL` to the assigned stable `*.vercel.app` URL.
2. Connect an Upstash Redis database and expose its REST URL and token as
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The profile counter records one
   page view per browser navigation and deduplicates request retries.
3. Enable Web Analytics and Speed Insights for the Vercel project.
4. Rebuild so canonical URLs, alternate-language links, the sitemap, and Open Graph URLs use the production domain.

Portfolio content and translations live in `content/portfolio.ts`. No CMS or runtime GitHub API access is required.

## License

[MIT](LICENSE)
