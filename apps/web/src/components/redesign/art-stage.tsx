"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { pageFromPath, pages, type Page } from "@/lib/redesign/copy";

import {
  ACCENT,
  BG,
  common,
  cover,
  createProgram,
  loadTexture,
  type Loaded,
  type Mask,
} from "./gl";
import { scenes } from "./scenes";

// Two layers: the outgoing page's art (A) and the incoming one (B). Cells switch from
// A to B in Bayer order, swept across the screen in the direction of travel, with an
// accent-coloured front. Near the pointer the fade mask lifts, uncovering the art.
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
uniform float u_dir;
uniform vec3 u_pointer;
uniform float u_radius;
uniform vec3 u_accent;

float maskAt(vec2 m, vec4 k, float top) {
  float v = ramp(m.x, k.x, k.y) * ramp(m.y, k.z, k.w);
  if (top > 0.0) v *= ramp(m.y, 0.0, top);
  return v * v * (3.0 - 2.0 * v);
}

vec3 layer(sampler2D tex, vec4 c, vec2 uv, float brightness) {
  return grade(texture2D(tex, c.zw + (uv - 0.5) * c.xy).rgb, brightness);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_px);
  vec2 uv = (cell * u_px + 0.5 * u_px) / u_res;
  vec2 m = vec2(uv.x, 1.0 - uv.y);
  float b = bayer8(cell);

  float edge = u_dir > 0.0 ? 1.0 - m.x : m.x;
  float s = u_t * 1.6 - edge * 0.6;
  bool incoming = b < s;
  if (!incoming && u_hasA < 0.5) {
    gl_FragColor = vec4(u_bg, 1.0);
    return;
  }

  vec3 rgb = incoming ? layer(u_texB, u_coverB, uv, u_brightB) : layer(u_texA, u_coverA, uv, u_brightA);
  float mask = incoming ? maskAt(m, u_maskB, u_topB) : maskAt(m, u_maskA, u_topA);
  float near = u_pointer.z * (1.0 - smoothstep(u_radius * 0.15, u_radius, distance(m * u_res, u_pointer.xy)));
  mask = max(mask, near * 0.55);

  vec3 q = quantize(rgb * mask, b);
  if (u_t > 0.0 && u_t < 1.0 && abs(b - s) < 0.03) q = u_accent;
  gl_FragColor = vec4(q, 1.0);
}
`;

const DURATION = 1100;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Full-page dithered art behind every redesign page, morphing between pages. */
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

    gl.uniform1f(u("u_px"), 3);
    gl.uniform1f(u("u_levels"), 4);
    gl.uniform1f(u("u_contrast"), 1.1);
    gl.uniform1f(u("u_saturation"), 1.05);
    gl.uniform3fv(u("u_bg"), BG);
    gl.uniform3fv(u("u_accent"), ACCENT);
    gl.uniform1f(u("u_radius"), 170);
    gl.uniform1i(u("u_texA"), 0);
    gl.uniform1i(u("u_texB"), 1);

    const textures = new Map<Page, Promise<Loaded>>();
    const texture = (p: Page) => {
      if (!textures.has(p))
        textures.set(p, loadTexture(gl, scenes[p].src, { width: 1920, height: 1200 }));
      return textures.get(p)!;
    };

    type Layer = { page: Page; image: Loaded };
    const s = {
      a: null as Layer | null,
      b: null as Layer | null,
      t: 1,
      dir: 1,
      start: 0,
      pointer: { x: 0, y: 0, z: 0, tz: 0 },
      wanted: null as Page | null,
      frame: 0,
      alive: true,
    };

    const bindLayer = (key: "A" | "B", l: Layer, unit: number) => {
      const scene = scenes[l.page];
      const narrow = window.innerWidth < 768;
      const mask: Mask = narrow ? scene.mobileMask : scene.mask;
      const c = cover(
        l.image,
        canvas.width,
        canvas.height,
        narrow ? scene.mobileFocus : scene.focus,
      );
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, l.image.texture);
      gl.uniform4f(u(`u_cover${key}`), c.scale[0], c.scale[1], c.centre[0], c.centre[1]);
      gl.uniform4f(u(`u_mask${key}`), mask.x0 ?? 0, mask.x1 ?? 0, mask.y0 ?? 0, mask.y1 ?? 0);
      gl.uniform1f(u(`u_top${key}`), mask.top ?? 0);
      gl.uniform1f(u(`u_bright${key}`), scene.brightness);
    };

    const draw = () => {
      if (!s.b) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("u_res"), canvas.width, canvas.height);
      bindLayer("B", s.b, 1);
      if (s.a) bindLayer("A", s.a, 0);
      gl.uniform1f(u("u_hasA"), s.a ? 1 : 0);
      gl.uniform1f(u("u_t"), ease(s.t));
      gl.uniform1f(u("u_dir"), s.dir);
      gl.uniform3f(u("u_pointer"), s.pointer.x, s.pointer.y, s.pointer.z);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Animate only while the dissolve or the pointer glow is moving.
    const tick = (now: number) => {
      s.frame = 0;
      if (s.t < 1) s.t = Math.min((now - s.start) / DURATION, 1);
      s.pointer.z += (s.pointer.tz - s.pointer.z) * 0.12;
      if (Math.abs(s.pointer.tz - s.pointer.z) < 0.002) s.pointer.z = s.pointer.tz;
      draw();
      if (s.t < 1 || s.pointer.z !== s.pointer.tz) s.frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!s.frame) s.frame = requestAnimationFrame(tick);
    };

    show.current = (next: Page) => {
      s.wanted = next;
      void texture(next).then((image) => {
        if (!s.alive || s.wanted !== next || s.b?.page === next) return;
        // Mid-dissolve, the layer covering most of the screen becomes the outgoing one.
        const current = s.t < 0.5 ? s.a : s.b;
        s.dir = current && pages.indexOf(next) < pages.indexOf(current.page) ? -1 : 1;
        s.a = current;
        s.b = { page: next, image };
        s.t = reduce ? 1 : 0;
        s.start = performance.now();
        kick();
      });
    };

    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight));
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce) return;
      const box = canvas.getBoundingClientRect();
      s.pointer.x = e.clientX - box.left;
      s.pointer.y = e.clientY - box.top;
      s.pointer.tz = 1;
      kick();
    };
    const onLeave = () => {
      s.pointer.tz = 0;
      kick();
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Warm the cache so later dissolves start without a network wait.
    const warm = setTimeout(() => pages.forEach((p) => void texture(p)), 2500);

    return () => {
      s.alive = false;
      cancelAnimationFrame(s.frame);
      clearTimeout(warm);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.deleteProgram(program);
    };
  }, []);

  useEffect(() => show.current(page), [page]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 -z-10 h-full w-full [image-rendering:pixelated] [view-transition-name:art]"
    />
  );
}
