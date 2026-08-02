# Portfolio decisions

This document records the agreed direction for Marco Procopio's portfolio and the few choices still needed before implementation.

## Product

- Personal portfolio, initially a small public website.
- Each language version is one scrolling page. Primary navigation uses section anchors rather than separate internal pages; project cards may link to external live sites or source repositories.
- The primary contact action is email at `procopiomarco@protonmail.com`. The primary developer profile is [github.com/JustMarkDev](https://github.com/JustMarkDev).
- Other social links remain content placeholders until real profile URLs are supplied. Do not render placeholder or non-functional links in production.
- The supplied design in `Design/portfolio-design`, its images, and its local fonts are the visual source of truth.
- Content and final visual decisions will be supplied separately.
- Prefer a fast, accessible, low-maintenance site over unnecessary application complexity.

## Technical direction

- **Language:** TypeScript in strict mode.
- **Framework:** Next.js using the App Router and React Server Components by default.
- **Package manager:** Bun, always using the latest stable release rather than pinning a Bun version. Commit `bun.lock`.
- **Tooling:** Use Vite+ for the developer workflow, dependency commands, formatting, linting, and checks.
- **Build pipeline:** Next.js remains responsible for development and production builds. Use script tasks such as `vp run dev` and `vp run build`; do not use Vite as the Next.js application bundler.
- **Hosting:** Vercel, connected to the Git repository, with preview deployments for branches/pull requests and production deployments from the main branch.
- **Source and license:** Keep [github.com/JustMarkDev/marco-procopio](https://github.com/JustMarkDev/marco-procopio) fully public under the MIT License. Show the repository as the footer's source-code link.
- **Domain:** Use the production `*.vercel.app` domain automatically assigned by Vercel; no custom domain is planned. Record the exact assigned production URL after the first deployment and use it for canonical URLs, metadata, sitemap entries, and Open Graph URLs.
- **Rendering:** Prefer static generation. Add server-side rendering, APIs, a database, or a CMS only when a content requirement needs them.
- **Content storage:** Keep portfolio content and both translation dictionaries in the repository. Do not add a CMS unless editing requirements materially change.
- **Styling:** Use Tailwind CSS.
- **Components:** Use shadcn/ui as a source-owned component foundation, using its current Base UI default and React Server Component support. Add only the primitives the portfolio needs, keep their source in the repository, and restyle them to match the supplied design rather than retaining the stock appearance. Configure shadcn to use Hugeicons.
- **Theme:** Use `next-themes` with three user-facing choices: System, Light, and Dark. System is the initial default and follows `prefers-color-scheme`; an explicit Light or Dark choice overrides the system and persists across visits. Both themes use semantic CSS variables, and theme initialization must not visibly flash the wrong theme.
- **Languages:** Publish complete Italian (`it`) and English (`en`) versions under locale-prefixed routes such as `/it` and `/en`. On an initial unprefixed visit, use a saved language override first; otherwise choose Italian only when Vercel's country header is `IT`, and choose English for every other or unknown country. A language selection persists in a preference cookie and redirects to the equivalent page in the chosen locale.
- **International SEO:** Each localized page declares the correct HTML `lang`, canonical URL, and `hreflang` alternatives. Both locale trees appear in the sitemap. The locale in the URL is authoritative and must not be silently changed after navigation.
- **Navigation:** Use native hash links for page sections, account for the sticky header when scrolling, and preserve the current section hash when switching between `/it` and `/en` where the section exists in both languages. Smooth scrolling and animated section transitions must respect reduced-motion preferences.
- **Typography:** Use Geist Pixel. `GeistPixelSquare` is the primary interface and body typeface because it is the variant used by the design;
- **Assets:** Use `next/image` for raster images and self-host the supplied fonts. Preserve image licenses and attribution where required.
- **Animation:** Use Motion for React (`motion`, imported from `motion/react`) for intentional interface and page animations. Prefer CSS for trivial transitions, keep animation components isolated as client components, and configure Motion to respect the user's reduced-motion preference. Derive the exact motion character during implementation from the supplied design; it is not a separate upfront decision.
- **Icons:** Use the maintained Hugeicons React renderer (`@hugeicons/react`) with the free Stroke Rounded pack (`@hugeicons/core-free-icons`). Import icons individually, use `currentColor`, and wrap the renderer in a small project-level `Icon` component for consistent sizing, stroke width, and accessibility.
- **Animated icons:** Animate Hugeicons with Motion or CSS when an interaction benefits from feedback (for example hover, press, loading, or state changes). Do not add a separate animated-icon library by default, and provide a non-moving reduced-motion state.
- **Analytics:** Enable Vercel Web Analytics and Vercel Speed Insights. Install `@vercel/analytics` and `@vercel/speed-insights`, mount their Next.js components once in the root layout, and enable both products for the deployed Vercel project. Do not add custom event tracking unless a later requirement calls for it. Document their use in the privacy notice even though Vercel Web Analytics is cookie-free by default.
- **Project discovery:** During implementation, inspect the public repositories under [JustMarkDev](https://github.com/JustMarkDev) to select portfolio projects and collect accurate repository and live-demo links. Store the selected project data in the repository; the production site must not depend on the GitHub API at runtime.
- **Dependencies:** Keep the remaining dependency set small. Add form or CMS libraries only for a concrete requirement.

## Quality baseline

- Responsive from small mobile screens through wide desktop screens.
- Target WCAG 2.2 Level AA across both themes, both languages, and responsive layouts.
- Semantic HTML, keyboard navigation, visible focus states, useful alternative text, and respect for reduced-motion preferences.
- Good metadata: page title, description, canonical URL, favicon, Open Graph image, sitemap, and `robots.txt`.
- Target strong Core Web Vitals and avoid shipping client-side JavaScript for static content.
- Automated checks for formatting, linting, types, and production build. Add focused tests for interactive behavior rather than testing static markup exhaustively.
- No secrets in the repository. Environment variables are documented in `.env.example` if any are introduced.
- Support current evergreen releases of Chrome, Edge, Firefox, and Safari. No legacy-browser compatibility layer is planned.
