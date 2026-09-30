"use client";

import { animate, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import Image, { getImageProps } from "next/image";
import { useEffect, useRef } from "react";

// One dither cell in CSS pixels, the same grain as the background art.
const CELL = 3;
// 8x8 Bayer matrix: the order cells turn on, and the order they clear on reveal.
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7,
  39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

type Grid = { cols: number; rows: number; lum: Float32Array; vivid: Uint8Array };

/**
 * An image drawn as 1-bit dots in the site palette. `revealed` dissolves the dots in
 * Bayer order and fades the real image in underneath. Dots print in once loaded.
 */
export function DitherImage({
  src,
  alt,
  sizes,
  revealed,
  delay = 0,
}: {
  src: string;
  alt: string;
  sizes: string;
  revealed: boolean;
  /** Seconds before the dots print in, for staggering a grid. */
  delay?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reduce = useReducedMotion();
  // Mutable render state, kept out of React so animation frames never re-render.
  const s = useRef({ grid: null as Grid | null, shown: 0, reveal: 0, draw: () => {} });
  const anim = useRef<AnimationPlaybackControls>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const state = s.current;

    state.draw = () => {
      const { grid, shown, reveal } = state;
      if (imgRef.current) imgRef.current.style.opacity = String(reveal);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!grid) return;
      const root = document.documentElement;
      const dark = root.classList.contains("dark");
      const css = getComputedStyle(root);
      const size = CELL * devicePixelRatio;
      const dot = size - devicePixelRatio;
      const lo = reveal * 64;
      const hi = shown * 64;
      // Two passes: neutral ink, then accent for vivid source pixels.
      for (const vivid of [0, 1]) {
        ctx.fillStyle = css.getPropertyValue(
          vivid ? "--ring" : dark ? "--muted-foreground" : "--foreground",
        );
        ctx.beginPath();
        for (let y = 0; y < grid.rows; y++) {
          for (let x = 0; x < grid.cols; x++) {
            const i = y * grid.cols + x;
            if (grid.vivid[i] !== vivid) continue;
            const rank = BAYER[(y % 8) * 8 + (x % 8)]!;
            if (rank < lo || rank >= hi) continue;
            // Light theme inks the shadows (thinned, dark ink is heavier); dark theme inks the highlights.
            const v = dark ? grid.lum[i]! : (1 - grid.lum[i]!) ** 1.5;
            if (v > (rank + 0.5) / 64) ctx.rect(x * size, y * size, dot, dot);
          }
        }
        ctx.fill();
      }
    };

    // Sample through the Next.js optimizer: same origin, so the canvas can read pixels.
    const source = new window.Image();
    source.src = getImageProps({ src, alt: "", width: 192, height: 288 }).props.src;

    const box = canvas.parentElement!;
    const sample = () => {
      const { width, height } = box.getBoundingClientRect();
      if (!width || !source.naturalWidth) return;
      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      // Whole cells only; the parent clips the overhang.
      canvas.style.width = `${cols * CELL}px`;
      canvas.style.height = `${rows * CELL}px`;
      canvas.width = cols * CELL * devicePixelRatio;
      canvas.height = rows * CELL * devicePixelRatio;

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      // object-fit: cover
      const scale = Math.max(cols / source.naturalWidth, rows / source.naturalHeight);
      const w = source.naturalWidth * scale;
      const h = source.naturalHeight * scale;
      o.drawImage(source, (cols - w) / 2, (rows - h) / 2, w, h);
      const px = o.getImageData(0, 0, cols, rows).data;

      const lum = new Float32Array(cols * rows);
      const vivid = new Uint8Array(cols * rows);
      for (let i = 0; i < lum.length; i++) {
        const r = px[i * 4]! / 255;
        const g = px[i * 4 + 1]! / 255;
        const b = px[i * 4 + 2]! / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // Accent only for strong warm pixels (reds, oranges), so it reads as a hint of the poster's colour.
        const warm = max === r && g - b > 0 && (g - b) / (max - min || 1) < 0.8;
        vivid[i] = warm && max > 0.45 && (max - min) / max > 0.6 ? 1 : 0;
      }
      // Stretch contrast between the 2nd and 98th percentile so dark posters still read.
      const sorted = lum.toSorted();
      const a = sorted[Math.floor(sorted.length * 0.02)]!;
      const b = sorted[Math.floor(sorted.length * 0.98)]!;
      for (let i = 0; i < lum.length; i++) {
        lum[i] = Math.min(Math.max((lum[i]! - a) / (b - a || 1), 0), 1);
      }
      state.grid = { cols, rows, lum, vivid };
      state.draw();
    };

    source.onload = () => {
      sample();
      if (reduce) {
        state.shown = 1;
        state.draw();
        return;
      }
      anim.current = animate(state.shown, 1, {
        duration: 0.7,
        delay,
        ease: "easeOut",
        onUpdate: (v) => {
          state.shown = v;
          state.draw();
        },
      });
    };

    const resize = new ResizeObserver(sample);
    resize.observe(box);
    // The theme toggle flips the `dark` class on <html>: redraw in the new palette.
    const theme = new MutationObserver(() => state.draw());
    theme.observe(document.documentElement, { attributeFilter: ["class"] });

    return () => {
      source.onload = null;
      anim.current?.stop();
      resize.disconnect();
      theme.disconnect();
    };
  }, [src, delay, reduce]);

  useEffect(() => {
    const state = s.current;
    const to = revealed ? 1 : 0;
    if (reduce) {
      state.reveal = to;
      state.draw();
      return;
    }
    const controls = animate(state.reveal, to, {
      duration: 0.6,
      ease: "easeInOut",
      onUpdate: (v) => {
        state.reveal = v;
        state.draw();
      },
    });
    return () => controls.stop();
  }, [revealed, reduce]);

  return (
    <>
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover opacity-0"
      />
      <canvas ref={canvasRef} aria-hidden className="absolute top-0 left-0" />
    </>
  );
}
