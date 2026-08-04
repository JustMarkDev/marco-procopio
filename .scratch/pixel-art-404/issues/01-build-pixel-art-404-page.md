# Build the pixel-art 404 page

Status: needs-approval

## Context

The portfolio needs a custom not-found page. The final pixel-art background will be supplied later, so this ticket must create the page and a safe visual fallback without inventing the final artwork.

Source spec: `../spec.md`

## Acceptance criteria

- Unknown routes render a custom not-found page through the repository's existing Next.js App Router structure.
- A large, responsive `404` is the primary visual element and uses the already self-hosted `GeistPixelSquare` font.
- Supporting copy clearly states that the page was not found and includes a keyboard-accessible link back to the portfolio.
- The page uses an intentional pixel-art-style fallback treatment while no background asset exists; it does not request or render a missing placeholder image.
- The layout provides a small, documented styling or component seam where the supplied background can later be added without restructuring the page.
- Text remains readable in both light and dark themes, decorative visuals are hidden from assistive technology, and reduced-motion preferences are respected if motion is used.
- The layout is usable from small mobile screens through wide desktop screens without clipping the `404`, copy, or navigation link.
- Focused automated coverage verifies the important not-found-page behavior at the repository's existing testing seam.
- All applicable repository formatting, lint, typecheck, test, and build scripts pass.

## Implementation notes

- Reuse existing design tokens, font setup, and shared UI patterns.
- Prefer static server-rendered markup and CSS; do not add a dependency for this page.
- Do not create the final background artwork as part of this ticket.

## Comments

- 2026-08-04: Approved and started by the maintainer.
- 2026-08-04: Implementation completed. Formatting, lint, typecheck, tests, production build, desktop/mobile theme previews, real HTTP 404 responses, and the second standards/spec review cycle all passed. Ready for draft pull-request review; the final background asset remains deferred as specified.
