"use client";

import { useEffect, useRef } from "react";

/** Where the crop centres in the image, 0-1 from the left and top, like `object-position`. */
export type Focus = { x?: number; y?: number };

/** Fade window in 0-1 box coordinates, y from the top. Each pair runs from hidden to visible. */
export type Mask = { x0?: number; x1?: number; y0?: number; y1?: number; top?: number };

const vertex = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

// The design file's dither-color shader: per-channel ordered dither on a pixel grid,
// faded out towards the text with a smoothstepped mask. Black cells take the page colour.
const fragment = `
precision highp float;
uniform vec2 u_resolution;
uniform sampler2D u_content;
uniform vec2 u_cover;
uniform vec2 u_focus;
uniform float u_px;
uniform float u_levels;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_brightness;
uniform vec3 u_bg;
uniform float u_x0;
uniform float u_x1;
uniform float u_y0;
uniform float u_y1;
uniform float u_top;

float ramp(float v, float a, float b) {
  if (abs(b - a) < 0.0001) return 1.0;
  return clamp((v - a) / (b - a), 0.0, 1.0);
}

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_px);
  vec2 uv = (cell * u_px + 0.5 * u_px) / u_resolution;
  vec3 rgb = texture2D(u_content, u_focus + (uv - 0.5) * u_cover).rgb;
  float l = dot(rgb, vec3(0.299, 0.587, 0.114));
  rgb = mix(vec3(l), rgb, u_saturation);
  rgb = clamp((rgb - 0.5) * u_contrast + 0.5 + u_brightness, 0.0, 1.0);

  vec2 m = vec2(uv.x, 1.0 - uv.y);
  float mask = ramp(m.x, u_x0, u_x1) * ramp(m.y, u_y0, u_y1);
  if (u_top > 0.0) mask *= ramp(m.y, 0.0, u_top);
  mask = mask * mask * (3.0 - 2.0 * mask);
  rgb *= mask;

  float steps = max(u_levels - 1.0, 1.0);
  float d = bayer8(cell) - 0.5;
  vec3 q = clamp(floor(rgb * steps + d + 0.5) / steps, 0.0, 1.0);
  if (q.r + q.g + q.b < 0.001) q = u_bg;
  gl_FragColor = vec4(q, 1.0);
}
`;

const BG: [number, number, number] = [9 / 255, 9 / 255, 11 / 255];

/**
 * An image rendered as colour dither art, filling its positioned parent like `object-fit: cover`.
 * Draws once per resize; nothing animates. `mobileMask` and `mobileFocus` apply below 768px.
 */
export function DitherArt({
  src,
  px = 3,
  levels = 4,
  contrast = 1.1,
  saturation = 1.05,
  brightness = 0,
  mask = {},
  mobileMask,
  mobileFocus,
  className = "absolute inset-0",
}: {
  src: string;
  px?: number;
  levels?: number;
  contrast?: number;
  saturation?: number;
  brightness?: number;
  mask?: Mask;
  mobileMask?: Mask;
  mobileFocus?: Focus;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Masks and focus are object literals at the call site; compare by value so renders don't re-init WebGL.
  const framing = JSON.stringify([mask, mobileMask, mobileFocus]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    const [desktop, mobile, focus] = JSON.parse(framing) as [Mask, Mask?, Focus?];

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
    gl.uniform1f(u("u_px"), px);
    gl.uniform1f(u("u_levels"), levels);
    gl.uniform1f(u("u_contrast"), contrast);
    gl.uniform1f(u("u_saturation"), saturation);
    gl.uniform1f(u("u_brightness"), brightness);
    gl.uniform3fv(u("u_bg"), BG);

    const image = new Image();
    let alive = true;

    const draw = () => {
      if (!alive || !image.naturalWidth) return;
      // One canvas pixel per CSS pixel: the grain stays 3px on every screen.
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("u_resolution"), canvas.width, canvas.height);
      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const cx = canvas.width / (image.naturalWidth * scale);
      const cy = canvas.height / (image.naturalHeight * scale);
      gl.uniform2f(u("u_cover"), cx, cy);
      const narrow = window.innerWidth < 768;
      const f = (narrow && focus) || {};
      // Clamp so the crop never runs off the image. Texture y runs bottom-up.
      const clamp = (v: number, c: number) => Math.min(Math.max(v, c / 2), 1 - c / 2);
      gl.uniform2f(u("u_focus"), clamp(f.x ?? 0.5, cx), 1 - clamp(f.y ?? 0.5, cy));
      const m = (narrow && mobile) || desktop;
      gl.uniform1f(u("u_x0"), m.x0 ?? 0);
      gl.uniform1f(u("u_x1"), m.x1 ?? 0);
      gl.uniform1f(u("u_y0"), m.y0 ?? 0);
      gl.uniform1f(u("u_y1"), m.y1 ?? 0);
      gl.uniform1f(u("u_top"), m.top ?? 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
    };

    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      draw();
    };
    image.src = src;

    const resize = new ResizeObserver(draw);
    resize.observe(canvas);

    return () => {
      alive = false;
      image.onload = null;
      resize.disconnect();
      gl.deleteProgram(program);
    };
  }, [src, px, levels, contrast, saturation, brightness, framing]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`${className} h-full w-full opacity-0 transition-opacity duration-700 [image-rendering:pixelated]`}
    />
  );
}
