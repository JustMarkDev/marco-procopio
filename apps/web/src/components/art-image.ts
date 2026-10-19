import { preload } from "react-dom";

import type { Page } from "@/lib/copy";

import { imageProps } from "./gl";
import { scenes } from "./scenes";

/** Source size of the art; the optimizer never upscales. */
export const ART_BOX = { width: 1920, height: 1200 };
/**
 * How wide the art is shown, for the browser to pick a size from. A mouse gets the full
 * width; touch screens only see the dither, so a small texture keeps phones clear of
 * their memory limits.
 */
export const ART_SIZES = "(hover: hover) and (pointer: fine) 100vw, 400px";

/**
 * Starts fetching a page's background art with the HTML, rather than after the scripts
 * have loaded and the canvas has booted. Same srcset and sizes as the canvas asks for,
 * so the browser reuses the download. Call while rendering the page on the server.
 */
export function preloadArt(page: Page) {
  const { src, srcSet, sizes } = imageProps(scenes[page].src, ART_BOX, ART_SIZES);
  preload(src, { as: "image", imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: "high" });
}
