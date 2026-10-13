"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { pageFromPath, pages, type Page } from "@/lib/redesign/copy";

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
// only happens on the image, never behind the text.
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
uniform float u_hasA;
uniform float u_t;
uniform vec3 u_trail[${TRAIL}];
uniform float u_radius;

float maskAt(vec2 m, vec4 k, float top) {
  float v = ramp(m.x, k.x, k.y) * ramp(m.y, k.z, k.w);
  if (top > 0.0) v *= ramp(m.y, 0.0, top);
  return v * v * (3.0 - 2.0 * v);
}

vec3 sampleAt(sampler2D tex, vec4 c, vec2 uv) {
  return texture2D(tex, c.zw + (uv - 0.5) * c.xy).rgb;
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
  vec2 uv = (cell * u_px + 0.5 * u_px) / u_res;
  vec2 m = vec2(uv.x, 1.0 - uv.y);
  float b = bayer8(cell);

  float maskB = maskAt(m, u_maskB, u_topB);
  float maskA = u_hasA > 0.5 ? maskAt(m, u_maskA, u_topA) : 0.0;
  vec3 artB = grade(sampleAt(u_texB, u_coverB, uv), u_brightB) * maskB;
  vec3 artA = u_hasA > 0.5 ? grade(sampleAt(u_texA, u_coverA, uv), u_brightA) * maskA : vec3(0.0);
  float mask = mix(maskA, maskB, u_t);

  // Veil: only where the image is clearly visible, so text areas stay calm.
  float v = veil(m * u_res) * smoothstep(0.2, 0.7, mask);
  if (b < v) {
    vec2 px = vec2(gl_FragCoord.x / u_res.x, gl_FragCoord.y / u_res.y);
    vec3 photoB = sampleAt(u_texB, u_coverB, px) * maskB;
    vec3 photoA = u_hasA > 0.5 ? sampleAt(u_texA, u_coverA, px) * maskA : vec3(0.0);
    gl_FragColor = vec4(mix(photoA, photoB, u_t), 1.0);
    return;
  }

  gl_FragColor = vec4(quantize(mix(artA, artB, u_t), b), 1.0);
}
`;

const ease = (t: number) => t * t * (3 - 2 * t);

/** Full-page dithered art behind every redesign page. */
export function ArtStage() {
  const ref = useRef<HTMLCanvasElement>(null);
  const show = useRef<(page: Page) => void>(() => {});
  const page = pageFromPath(usePathname());

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false });
    if (!canvas || !gl) return;
    const { program, u } = createProgram(gl, fragment);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      if (!textures.has(p))
        textures.set(p, loadTexture(gl, scenes[p].src, { width: 1920, height: 1200 }));
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
      const c = cover(l.image, canvas.width, canvas.height, focus);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, l.image.texture);
      gl.uniform4f(u(`u_cover${key}`), c.scale[0], c.scale[1], c.centre[0], c.centre[1]);
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
      void texture(next).then((image) => {
        if (!s.alive || s.wanted !== next || s.b?.page === next) return;
        s.a = s.t < 0.5 ? s.a : s.b;
        s.b = { page: next, image };
        s.t = reduce ? 1 : 0;
        s.start = performance.now();
        kick();
      });
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

    // Warm the cache so later page changes start without a network wait.
    const warm = setTimeout(() => pages.forEach((p) => void texture(p)), 2500);

    return () => {
      s.alive = false;
      cancelAnimationFrame(s.frame);
      clearTimeout(warm);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(program);
    };
  }, []);

  useEffect(() => show.current(page), [page]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 -z-10 h-full w-full" />;
}
