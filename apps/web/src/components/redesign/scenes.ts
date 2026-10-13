import type { Page } from "@/lib/redesign/copy";

import type { Focus, Mask } from "./gl";

export type Scene = {
  src: string;
  brightness: number;
  mask: Mask;
  focus?: Focus;
  mobileMask: Mask;
  mobileFocus?: Focus;
};

/** Background art per page. Masks match the pen.dev frames; mobile keeps the art above the text. */
export const scenes: Record<Page, Scene> = {
  index: {
    src: "/art/duomo.webp",
    brightness: -0.04,
    mask: { x0: 0.42, x1: 0.7, top: 0.16 },
    mobileMask: { y0: 0.62, y1: 0.25, top: 0.08 },
    mobileFocus: { x: 0.74, y: 0.1 },
  },
  work: {
    src: "/art/commodus.webp",
    brightness: -0.04,
    mask: { x0: 0.5, x1: 0.72, top: 0.12 },
    mobileMask: { y0: 0.36, y1: 0.12, top: 0.05 },
    mobileFocus: { x: 0.8, y: 0.4 },
  },
  me: {
    src: "/art/fish.webp",
    brightness: -0.04,
    mask: { y0: 0.6, y1: 0.22, top: 0.14 },
    focus: { y: 0.35 },
    mobileMask: { y0: 0.45, y1: 0.15, top: 0.08 },
    mobileFocus: { x: 0.6, y: 0.3 },
  },
  about: {
    src: "/art/theatre.webp",
    brightness: 0.02,
    mask: { y0: 0.56, y1: 0.78 },
    focus: { y: 0.6 },
    mobileMask: { y0: 0.72, y1: 0.88 },
  },
};
