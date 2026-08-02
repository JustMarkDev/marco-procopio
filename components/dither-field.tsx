"use client";

import { useEffect, useRef } from "react";

const bayerMatrix = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
] as const;

const lightPalette = {
  base: [245, 244, 239],
  violet: [156, 139, 255],
  cyan: [90, 207, 214],
  coral: [255, 151, 117],
} as const;

const darkPalette = {
  base: [6, 6, 8],
  violet: [91, 68, 204],
  cyan: [32, 130, 145],
  coral: [158, 66, 62],
} as const;

type Point = { x: number; y: number };

function mixChannel(base: number, color: number, amount: number) {
  return base + (color - base) * amount;
}

function quantize(value: number, threshold: number, step: number) {
  const lower = Math.floor(value / step) * step;
  const remainder = (value - lower) / step;
  return Math.min(255, lower + (remainder > threshold ? step : 0));
}

export function DitherField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const cursor: Point = { x: window.innerWidth * 0.62, y: window.innerHeight * 0.34 };
    const target: Point = { ...cursor };
    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelSize = coarsePointer.matches ? 4 : 3;
    let animationFrame = 0;
    let previousFrame = 0;
    let startTime = performance.now();
    let dark = document.documentElement.classList.contains("dark");

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const performanceFloor = Math.ceil(Math.sqrt((width * height) / 240_000));
      pixelSize = Math.max(coarsePointer.matches ? 4 : 3, performanceFloor);
      canvas.width = Math.ceil(width / pixelSize);
      canvas.height = Math.ceil(height / pixelSize);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.imageSmoothingEnabled = false;
    };

    const render = (time: number) => {
      const renderWidth = canvas.width;
      const renderHeight = canvas.height;
      const palette = dark ? darkPalette : lightPalette;
      const image = context.createImageData(renderWidth, renderHeight);
      const data = image.data;
      const timeScale = reducedMotion.matches ? 0 : (time - startTime) / 1000;
      const radius = Math.max(150, Math.min(width, height) * 0.42);
      const cursorX = cursor.x / pixelSize;
      const cursorY = cursor.y / pixelSize;
      const radiusInPixels = radius / pixelSize;
      const step = dark ? 14 : 12;

      for (let y = 0; y < renderHeight; y += 1) {
        for (let x = 0; x < renderWidth; x += 1) {
          const index = (y * renderWidth + x) * 4;
          const normalizedX = x / renderWidth;
          const normalizedY = y / renderHeight;
          const cursorDistance = Math.hypot(x - cursorX, y - cursorY) / radiusInPixels;
          const cursorGlow = Math.max(0, 1 - cursorDistance);
          const easedGlow = cursorGlow * cursorGlow * (3 - 2 * cursorGlow);

          const cyanX = normalizedX - (0.13 + Math.sin(timeScale * 0.16) * 0.04);
          const cyanY = normalizedY - (0.76 + Math.cos(timeScale * 0.13) * 0.05);
          const cyanGlow = Math.max(0, 1 - Math.hypot(cyanX, cyanY) / 0.48);
          const coralX = normalizedX - (0.88 + Math.cos(timeScale * 0.11) * 0.035);
          const coralY = normalizedY - (0.72 + Math.sin(timeScale * 0.15) * 0.04);
          const coralGlow = Math.max(0, 1 - Math.hypot(coralX, coralY) / 0.46);

          const cursorColorMix = Math.min(0.58, easedGlow * (dark ? 0.5 : 0.42));
          const cyanMix = cyanGlow * cyanGlow * (dark ? 0.22 : 0.2);
          const coralMix = coralGlow * coralGlow * (dark ? 0.24 : 0.22);
          const cursorHue = (normalizedX + normalizedY) * 0.5;
          const cursorColor = [
            mixChannel(palette.violet[0], palette.cyan[0], cursorHue * 0.38),
            mixChannel(palette.violet[1], palette.cyan[1], cursorHue * 0.38),
            mixChannel(palette.violet[2], palette.cyan[2], cursorHue * 0.38),
          ];

          let red: number = palette.base[0];
          let green: number = palette.base[1];
          let blue: number = palette.base[2];
          red = mixChannel(red, palette.cyan[0], cyanMix);
          green = mixChannel(green, palette.cyan[1], cyanMix);
          blue = mixChannel(blue, palette.cyan[2], cyanMix);
          red = mixChannel(red, palette.coral[0], coralMix);
          green = mixChannel(green, palette.coral[1], coralMix);
          blue = mixChannel(blue, palette.coral[2], coralMix);
          red = mixChannel(red, cursorColor[0], cursorColorMix);
          green = mixChannel(green, cursorColor[1], cursorColorMix);
          blue = mixChannel(blue, cursorColor[2], cursorColorMix);

          const threshold = (bayerMatrix[y % 8][x % 8] + 0.5) / 64;
          data[index] = quantize(red, threshold, step);
          data[index + 1] = quantize(green, threshold, step);
          data[index + 2] = quantize(blue, threshold, step);
          data[index + 3] = 255;
        }
      }

      context.putImageData(image, 0, 0);
    };

    const tick = (time: number) => {
      const ease = reducedMotion.matches ? 1 : 0.085;
      cursor.x += (target.x - cursor.x) * ease;
      cursor.y += (target.y - cursor.y) * ease;

      if (time - previousFrame >= 32 || reducedMotion.matches) {
        render(time);
        previousFrame = time;
      }

      if (!reducedMotion.matches) animationFrame = requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches) return;

      target.x = event.clientX;
      target.y = event.clientY;
    };

    const handleResize = () => {
      resize();
      render(performance.now());
    };

    const handleMotionChange = () => {
      cancelAnimationFrame(animationFrame);
      startTime = performance.now();
      animationFrame = requestAnimationFrame(tick);
    };

    const themeObserver = new MutationObserver(() => {
      dark = document.documentElement.classList.contains("dark");
      render(performance.now());
    });

    resize();
    render(startTime);
    animationFrame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);
    reducedMotion.addEventListener("change", handleMotionChange);
    coarsePointer.addEventListener("change", handleResize);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      reducedMotion.removeEventListener("change", handleMotionChange);
      coarsePointer.removeEventListener("change", handleResize);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="dither-field" aria-hidden="true" />;
}
