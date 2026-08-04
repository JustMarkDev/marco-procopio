# Pixel-art 404 page

## Summary

Add a custom not-found page that matches the portfolio's pixel-art visual language. The page centers a large `404` set in the existing Geist Pixel typeface and is structured so a supplied pixel-art background can be added later without redesigning the page.

## Goals

- Give unknown routes an intentional, on-brand destination.
- Make `404` the dominant visual element using the site's existing `GeistPixelSquare` font.
- Establish a pixel-art presentation that works before the final background artwork is available.
- Keep the future background image replaceable through a clear asset/style seam.

## Non-goals

- Creating the final pixel-art background artwork.
- Adding new fonts, animation libraries, or runtime data sources.
- Redesigning existing portfolio pages.

## Experience

The page should fill the viewport, clearly communicate that the requested page was not found, and provide an obvious way back to the portfolio. Until the final artwork arrives, it should use a lightweight fallback treatment that does not show a broken or temporary image.

The composition must remain legible in light and dark themes and from small mobile screens through wide desktop screens. Any decorative background must not reduce text contrast or be announced by assistive technology.

## Deferred input

The final pixel-art background asset will be supplied separately. Its filename, dimensions, crop/focal point, and theme behavior will be decided when the asset is available.
