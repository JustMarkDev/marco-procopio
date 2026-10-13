import { getImageProps } from "next/image";

/** Fade window in 0-1 box coordinates, y from the top. Each pair runs from hidden to visible. */
export type Mask = { x0?: number; x1?: number; y0?: number; y1?: number; top?: number };
/** Where a cover crop centres in the image, 0-1 from the left and top, like `object-position`. */
export type Focus = { x?: number; y?: number };

export const BG: [number, number, number] = [9 / 255, 9 / 255, 11 / 255];
export const ACCENT: [number, number, number] = [1, 106 / 255, 26 / 255];

const vertex = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

/** Shared GLSL: ordered dither, colour grading and the fade ramp from the design file's shader. */
export const common = `
precision highp float;
uniform vec2 u_res;
uniform float u_px;
uniform float u_levels;
uniform float u_contrast;
uniform float u_saturation;
uniform vec3 u_bg;

float ramp(float v, float a, float b) {
  if (abs(b - a) < 0.0001) return 1.0;
  return clamp((v - a) / (b - a), 0.0, 1.0);
}

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

vec3 grade(vec3 rgb, float brightness) {
  float l = dot(rgb, vec3(0.299, 0.587, 0.114));
  rgb = mix(vec3(l), rgb, u_saturation);
  return clamp((rgb - 0.5) * u_contrast + 0.5 + brightness, 0.0, 1.0);
}

// threshold is the cell's Bayer value in [0, 1); black cells take the page colour.
vec3 quantize(vec3 rgb, float threshold) {
  float steps = max(u_levels - 1.0, 1.0);
  vec3 q = clamp(floor(rgb * steps + threshold) / steps, 0.0, 1.0);
  return q.r + q.g + q.b < 0.001 ? u_bg : q;
}
`;

/** Compile and link a full-screen program, with the big triangle bound to attribute 0. */
export function createProgram(gl: WebGLRenderingContext, fragment: string) {
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
  const cache = new Map<string, WebGLUniformLocation | null>();
  const u = (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
    return cache.get(name)!;
  };
  return { program, u };
}

export type Loaded = { texture: WebGLTexture; width: number; height: number };

/**
 * Load an image through the Next.js optimizer (same origin, so WebGL may read it, and
 * remote posters get resized) into a texture on `unit`.
 */
export function loadTexture(
  gl: WebGLRenderingContext,
  src: string,
  size: { width: number; height: number },
): Promise<Loaded> {
  const url = getImageProps({ src, alt: "", ...size }).props.src;
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      resolve({ texture, width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = reject;
    image.src = url;
  });
}

/** Texture-space scale and centre for an `object-fit: cover` crop of `image` in `w` x `h`. */
export function cover(image: Loaded, w: number, h: number, focus: Focus = {}) {
  const scale = Math.max(w / image.width, h / image.height);
  const cx = w / (image.width * scale);
  const cy = h / (image.height * scale);
  // Clamp so the crop never runs off the image. Texture y runs bottom-up.
  const clamp = (v: number, c: number) => Math.min(Math.max(v, c / 2), 1 - c / 2);
  return {
    scale: [cx, cy] as const,
    centre: [clamp(focus.x ?? 0.5, cx), 1 - clamp(focus.y ?? 0.5, cy)] as const,
  };
}
