"use client";

import { useEffect, useRef } from "react";

// Size of one dither cell in CSS pixels.
const CELL = 3;
// Click ripples alive at once.
const RIPPLES = 4;

const vertex = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

// Domain-warped value noise, quantised to 1 bit with an 8x8 Bayer matrix.
const fragment = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_bg;
uniform vec3 u_fg;
uniform vec3 u_accent;
uniform vec3 u_pointer;    // xy in canvas pixels, z = strength
uniform vec3 u_ripples[4]; // xy in canvas pixels, z = age in seconds (< 0 = unused)

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.y;
  float t = u_time * 0.04;
  vec2 q = vec2(fbm(uv * 1.4 + t), fbm(uv * 1.4 + vec2(5.2, 1.3) - t));
  float v = fbm(uv * 1.8 + 2.2 * q + t * 0.5);

  // Full-bleed art that thins out towards the bottom edge, into the page.
  float fade = smoothstep(0.0, 0.45, gl_FragCoord.y / u_res.y);
  float level = smoothstep(0.28, 0.82, v);

  vec2 d = gl_FragCoord.xy - u_pointer.xy;
  level += u_pointer.z * 0.4 * exp(-dot(d, d) / 3600.0);

  // Each click sends a ring of dots outwards that fades as it travels.
  for (int i = 0; i < 4; i++) {
    vec3 r = u_ripples[i];
    if (r.z < 0.0) continue;
    float ring = (length(gl_FragCoord.xy - r.xy) - r.z * 140.0) / 10.0;
    level += 0.7 * exp(-ring * ring) * exp(-r.z * 1.4);
  }
  level *= fade;

  // A second, slower field decides which dots take the accent colour.
  float warm = smoothstep(0.42, 0.72, fbm(uv * 0.7 + vec2(11.0, 3.0) + t * 0.6));
  vec3 ink = mix(u_fg, u_accent, step(bayer8(gl_FragCoord.xy + vec2(4.0)) + 0.01, warm));

  float dot = step(bayer8(gl_FragCoord.xy) + 0.01, level);
  gl_FragColor = vec4(mix(u_bg, ink, dot), 1.0);
}
`;

function cssColor(name: string): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim().slice(1);
  const n = Number.parseInt(hex, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Full-screen dithered noise art behind the first screen. Follows the mouse; clicks ripple through it. */
export function Dither() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    const init = () => {
      const options: WebGLContextAttributes = {
        antialias: false,
        alpha: false,
        // Keeps the last frame for static renders and theme-switch snapshots.
        preserveDrawingBuffer: true,
      };
      // Software rendering (no GPU) runs the shader on the CPU: draw one frame, don't animate.
      const hardware = canvas.getContext("webgl", {
        ...options,
        failIfMajorPerformanceCaveat: true,
      });
      const gl = hardware ?? canvas.getContext("webgl", options);
      if (!gl) return;
      const still = reducedMotion || !hardware;

      const compile = (type: number, source: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, source);
        gl.compileShader(s);
        return s;
      };
      const program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const u = (name: string) => gl.getUniformLocation(program, name);
      const s = { time: 0, hover: 0, hoverTarget: 0, x: -1e4, y: -1e4 };
      // Flat [x, y, start time] per ripple; start -1e4 keeps it unused.
      const ripples = new Float32Array(RIPPLES * 3).fill(-1e4);
      let nextRipple = 0;

      const setColors = () => {
        gl.uniform3fv(u("u_bg"), cssColor("--dither-bg"));
        gl.uniform3fv(u("u_fg"), cssColor("--dither-fg"));
        gl.uniform3fv(u("u_accent"), cssColor("--dither-accent"));
      };

      const render = () => {
        gl.uniform1f(u("u_time"), s.time);
        gl.uniform3f(u("u_pointer"), s.x, s.y, s.hover);
        const ages = ripples.map((v, i) => (i % 3 === 2 ? (s.time - v < 3 ? s.time - v : -1) : v));
        gl.uniform3fv(u("u_ripples"), ages);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const resize = () => {
        canvas.width = Math.ceil(window.innerWidth / CELL);
        canvas.height = Math.ceil(canvas.clientHeight / CELL);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(u("u_res"), canvas.width, canvas.height);
        render();
      };

      let frame = 0;
      let last = performance.now();
      let scrollingUntil = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        // ~24fps is plenty for a slow drift. Hold still while scrolling so the
        // compositor only moves layers instead of re-blurring the glass every frame.
        // Nothing to draw once the art has scrolled out of view.
        if (now - last < 42 || now < scrollingUntil || window.scrollY > canvas.clientHeight) return;
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        s.hover += (s.hoverTarget - s.hover) * 0.12;
        s.time += dt;
        render();
      };

      setColors();
      resize();
      if (!still) frame = requestAnimationFrame(loop);

      // Theme switches toggle the `dark` class on <html>; recolour without a new context.
      const themeObserver = new MutationObserver(() => {
        setColors();
        render();
      });
      themeObserver.observe(document.documentElement, { attributeFilter: ["class"] });

      // The canvas scrolls with the page: pointer y is measured from its bottom edge.
      const toCanvas = (e: PointerEvent) =>
        [e.clientX / CELL, (canvas.getBoundingClientRect().bottom - e.clientY) / CELL] as const;
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        [s.x, s.y] = toCanvas(e);
        s.hoverTarget = 1;
      };
      const onDown = (e: PointerEvent) => {
        const [x, y] = toCanvas(e);
        if (y < 0) return;
        ripples.set([x, y, s.time], nextRipple * 3);
        nextRipple = (nextRipple + 1) % RIPPLES;
      };
      const onLeave = () => (s.hoverTarget = 0);
      const onScroll = () => (scrollingUntil = performance.now() + 150);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onMove);
      if (!still) window.addEventListener("pointerdown", onDown);
      document.documentElement.addEventListener("pointerleave", onLeave);

      cleanups.push(() => {
        cancelAnimationFrame(frame);
        themeObserver.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        // No loseContext(): a remount (e.g. StrictMode) reuses this canvas and its context.
        gl.deleteProgram(program);
      });
    };

    // Decoration only: start once the page is idle so it never delays first paint.
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(init, { timeout: 1500 });
      cleanups.push(() => cancelIdleCallback(id));
    } else {
      const id = setTimeout(init, 200);
      cleanups.push(() => clearTimeout(id));
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-lvh w-full [image-rendering:pixelated]"
    />
  );
}
