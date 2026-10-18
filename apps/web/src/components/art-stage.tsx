"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { pageFromPath, pages, type Page } from "@/lib/copy";

import { BG, common, cover, createProgram, loadTexture, type Loaded, type Mask } from "./gl";
import { scenes } from "./scenes";

/** Trail points kept for the veil; also the shader's array size. */
const TRAIL = 24;
/** How long a trail point takes to knit back into dither, in ms. */
const LIFE = 900;
/** Reveal radius around the pointer, in CSS pixels. */
const RADIUS = 110;
/** Page-to-page crossfade, in ms. */
const FADE = 650;

// Dithered art that crossfades between pages (A outgoing, B incoming). Around the
// pointer the dither burns through to the real photo, in Bayer order, and knits back
// cell by cell as the trail fades. The reveal follows the art's own fade mask, so it
// only happens on the image, never behind the text. Each layer is cropped into its own
// frame: the whole canvas on desktop, a viewport-sized band on phones, where pages
// are taller than the screen and the crop would otherwise change with their length.
const fragment = `${common}
uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform vec4 u_coverA;
uniform vec4 u_coverB;
uniform vec4 u_maskA;
uniform vec4 u_maskB;
uniform float u_topA;
uniform float u_topB;
uniform float u_brightA;
uniform float u_brightB;
uniform vec2 u_boxA;
uniform vec2 u_boxB;
uniform float u_hasA;
uniform float u_t;
uniform vec3 u_trail[${TRAIL}];
uniform float u_radius;

// Position in a layer's frame (top edge and height in px): x across the canvas, y down.
vec2 frameAt(vec2 p, vec2 box) {
  return vec2(p.x / u_res.x, (u_res.y - p.y - box.x) / box.y);
}

float maskAt(vec2 m, vec4 k, float top) {
  if (m.y < 0.0 || m.y > 1.0) return 0.0;
  float v = ramp(m.x, k.x, k.y) * ramp(m.y, k.z, k.w);
  if (top > 0.0) v *= ramp(m.y, 0.0, top);
  return v * v * (3.0 - 2.0 * v);
}

vec3 sampleAt(sampler2D tex, vec4 c, vec2 m) {
  return texture2D(tex, c.zw + (vec2(m.x, 1.0 - m.y) - 0.5) * c.xy).rgb;
}

float veil(vec2 p) {
  float r = 0.0;
  for (int i = 0; i < ${TRAIL}; i++) {
    vec3 t = u_trail[i];
    if (t.z <= 0.0) continue;
    r = max(r, t.z * (1.0 - smoothstep(u_radius * 0.3, u_radius, distance(p, t.xy))));
  }
  return r;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_px);
  vec2 p = cell * u_px + 0.5 * u_px;
  vec2 mA = frameAt(p, u_boxA);
  vec2 mB = frameAt(p, u_boxB);
  float b = bayer8(cell);

  float maskB = maskAt(mB, u_maskB, u_topB);
  float maskA = u_hasA > 0.5 ? maskAt(mA, u_maskA, u_topA) : 0.0;
  vec3 artB = grade(sampleAt(u_texB, u_coverB, mB), u_brightB) * maskB;
  vec3 artA = u_hasA > 0.5 ? grade(sampleAt(u_texA, u_coverA, mA), u_brightA) * maskA : vec3(0.0);
  float mask = mix(maskA, maskB, u_t);

  // Veil: only where the image is clearly visible, so text areas stay calm.
  float v = veil(vec2(p.x, u_res.y - p.y)) * smoothstep(0.2, 0.7, mask);
  if (b < v) {
    vec3 photoB = sampleAt(u_texB, u_coverB, frameAt(gl_FragCoord.xy, u_boxB)) * maskB;
    vec3 photoA = u_hasA > 0.5 ? sampleAt(u_texA, u_coverA, frameAt(gl_FragCoord.xy, u_boxA)) * maskA : vec3(0.0);
    gl_FragColor = vec4(mix(photoA, photoB, u_t), 1.0);
    return;
  }

  gl_FragColor = vec4(quantize(mix(artA, artB, u_t), b), 1.0);
}
`;

const ease = (t: number) => t * t * (3 - 2 * t);

/** Full-page dithered art behind every page. */
export function ArtStage() {
  const ref = useRef<HTMLCanvasElement>(null);
  const show = useRef<(page: Page) => void>(() => {});
  const page = pageFromPath(usePathname());
  // Bumped when the browser restores a lost context, to set everything up again.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false });
    if (!canvas || !gl) return;
    const { program, u } = createProgram(gl, fragment);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The sharp photo only shows under a mouse; touch screens see just the dither, so a
    // small texture is enough and keeps phones well clear of their memory limits.
    const size = window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ? { width: 1920, height: 1200 }
      : { width: 600, height: 375 };
    // Device pixels, so the revealed photo is sharp; the dither cell stays 3 CSS px.
    const dpr = Math.min(devicePixelRatio, 2);

    gl.uniform1f(u("u_px"), 3 * dpr);
    gl.uniform1f(u("u_levels"), 4);
    gl.uniform1f(u("u_contrast"), 1.1);
    gl.uniform1f(u("u_saturation"), 1.05);
    gl.uniform3fv(u("u_bg"), BG);
    gl.uniform1f(u("u_radius"), RADIUS * dpr);
    gl.uniform1i(u("u_texA"), 0);
    gl.uniform1i(u("u_texB"), 1);

    const textures = new Map<Page, Promise<Loaded>>();
    const texture = (p: Page) => {
      if (!textures.has(p)) {
        const loading = loadTexture(gl, scenes[p].src, size);
        // A failed load is forgotten so the next visit retries; handling it here also
        // keeps the warm-up preload from raising unhandled rejections.
        loading.catch(() => textures.delete(p));
        textures.set(p, loading);
      }
      return textures.get(p)!;
    };

    type Layer = { page: Page; image: Loaded };
    type Point = { x: number; y: number; born: number };
    const s = {
      a: null as Layer | null,
      b: null as Layer | null,
      t: 1,
      start: 0,
      trail: [] as Point[],
      wanted: null as Page | null,
      frame: 0,
      alive: true,
    };
    const trail = new Float32Array(TRAIL * 3);

    const bindLayer = (key: "A" | "B", l: Layer, unit: number) => {
      const scene = scenes[l.page];
      const narrow = window.innerWidth < 768;
      const mask: Mask = narrow ? scene.mobileMask : scene.mask;
      const focus = narrow ? scene.mobileFocus : scene.focus;
      const frame = narrow ? scene.mobileFrame : undefined;
      // clientHeight stays put while mobile toolbars slide in and out, unlike innerHeight.
      const height = frame
        ? Math.min(canvas.height, frame.height * document.documentElement.clientHeight * dpr)
        : canvas.height;
      const c = cover(l.image, canvas.width, height, focus);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, l.image.texture);
      gl.uniform4f(u(`u_cover${key}`), c.scale[0], c.scale[1], c.centre[0], c.centre[1]);
      gl.uniform2f(u(`u_box${key}`), frame?.bottom ? canvas.height - height : 0, height);
      gl.uniform4f(u(`u_mask${key}`), mask.x0 ?? 0, mask.x1 ?? 0, mask.y0 ?? 0, mask.y1 ?? 0);
      gl.uniform1f(u(`u_top${key}`), mask.top ?? 0);
      gl.uniform1f(u(`u_bright${key}`), scene.brightness);
    };

    const draw = (now = performance.now()) => {
      if (!s.b) return;
      s.trail = s.trail.filter((p) => now - p.born < LIFE);
      trail.fill(0);
      s.trail.forEach((p, i) => {
        trail.set([p.x * dpr, p.y * dpr, (1 - (now - p.born) / LIFE) ** 1.5], i * 3);
      });
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("u_res"), canvas.width, canvas.height);
      bindLayer("B", s.b, 1);
      if (s.a) bindLayer("A", s.a, 0);
      gl.uniform1f(u("u_hasA"), s.a ? 1 : 0);
      gl.uniform1f(u("u_t"), ease(s.t));
      gl.uniform3fv(u("u_trail"), trail);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Animate only while the crossfade runs or the trail is still knitting back.
    const tick = (now: number) => {
      s.frame = 0;
      if (s.t < 1) s.t = Math.min((now - s.start) / FADE, 1);
      draw(now);
      if (s.t < 1 || s.trail.length) s.frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!s.frame) s.frame = requestAnimationFrame(tick);
    };

    show.current = (next: Page) => {
      s.wanted = next;
      // If the image fails to load, keep whatever art (or plain background) is showing.
      texture(next).then(
        (image) => {
          if (!s.alive || s.wanted !== next || s.b?.page === next) return;
          s.a = s.t < 0.5 ? s.a : s.b;
          s.b = { page: next, image };
          s.t = reduce ? 1 : 0;
          s.start = performance.now();
          kick();
        },
        () => {},
      );
    };

    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce) return;
      const box = canvas.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const now = performance.now();
      // Fill gaps on fast moves so the trail stays continuous.
      const last = s.trail.at(-1);
      if (last) {
        const steps = Math.min(Math.floor(Math.hypot(x - last.x, y - last.y) / (RADIUS * 0.4)), 6);
        for (let i = 1; i <= steps; i++) {
          const k = i / (steps + 1);
          s.trail.push({ x: last.x + (x - last.x) * k, y: last.y + (y - last.y) * k, born: now });
        }
      }
      s.trail.push({ x, y, born: now });
      s.trail = s.trail.slice(-TRAIL);
      kick();
    };
    window.addEventListener("pointermove", onMove);

    // Phones drop GPU contexts under memory pressure or in the background; without
    // preventDefault the browser never gives this one back and the art stays blank.
    const onLost = (e: Event) => e.preventDefault();
    const onRestored = () => setGeneration((g) => g + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    // Warm the cache so later page changes start without a network wait.
    const warm = setTimeout(() => pages.forEach((p) => void texture(p)), 2500);

    return () => {
      s.alive = false;
      cancelAnimationFrame(s.frame);
      clearTimeout(warm);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      textures.forEach((t) =>
        t.then(
          (l) => gl.deleteTexture(l.texture),
          () => {},
        ),
      );
      gl.deleteProgram(program);
    };
  }, [generation]);

  useEffect(() => show.current(page), [page, generation]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 -z-10 h-full w-full" />;
}
