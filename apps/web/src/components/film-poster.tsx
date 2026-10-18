"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { common, cover, createProgram, loadTexture } from "./gl";
import { EASE, ENTER } from "./reveal";

// Dithered poster; cells below `u_r` in Bayer order show the real image instead.
const fragment = `${common}
uniform sampler2D u_tex;
uniform vec4 u_cover;
uniform float u_r;

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_px);
  float b = bayer8(cell);
  if (b < u_r) {
    vec2 uv = gl_FragCoord.xy / u_res;
    gl_FragColor = vec4(texture2D(u_tex, u_cover.zw + (uv - 0.5) * u_cover.xy).rgb, 1.0);
    return;
  }
  vec2 uv = (cell * u_px + 0.5 * u_px) / u_res;
  vec3 rgb = grade(texture2D(u_tex, u_cover.zw + (uv - 0.5) * u_cover.xy).rgb, 0.0);
  gl_FragColor = vec4(quantize(rgb, b), 1.0);
}
`;

/** A favourite film: dithered poster that dissolves into the real one on hover. */
export function FilmPoster({
  title,
  meta,
  href,
  image,
  index,
}: {
  title: string;
  meta: string;
  href?: string;
  image?: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const setReveal = useRef<(to: number) => void>(() => {});
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const box = ref.current;
    if (!box || !image) return;
    // A fresh canvas per run, so its context can be released on cleanup: browsers cap live
    // WebGL contexts and phones run out of memory long before collecting forgotten ones.
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    box.append(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return () => canvas.remove();
    const { program, u } = createProgram(gl, fragment);
    const dpr = Math.min(devicePixelRatio, 2);
    gl.uniform1f(u("u_px"), 2 * dpr);
    gl.uniform1f(u("u_levels"), 4);
    gl.uniform1f(u("u_contrast"), 1.1);
    gl.uniform1f(u("u_saturation"), 1.2);
    gl.uniform3f(u("u_bg"), 9 / 255, 9 / 255, 11 / 255);
    let reveal = 0;
    let loaded: Awaited<ReturnType<typeof loadTexture>> | null = null;
    let alive = true;

    const draw = () => {
      if (!loaded) return;
      const c = cover(loaded, canvas.width, canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("u_res"), canvas.width, canvas.height);
      gl.uniform4f(u("u_cover"), c.scale[0], c.scale[1], c.centre[0], c.centre[1]);
      gl.uniform1f(u("u_r"), reveal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let controls: ReturnType<typeof animate> | undefined;
    setReveal.current = (to) => {
      controls?.stop();
      controls = animate(reveal, to, {
        duration: reduce ? 0 : 0.55,
        ease: "easeInOut",
        onUpdate: (v) => {
          reveal = v;
          draw();
        },
      });
    };

    loadTexture(gl, image, { width: 256, height: 384 }).then(
      (l) => {
        if (!alive) return;
        loaded = l;
        draw();
        setReady(true);
      },
      () => {},
    );

    return () => {
      alive = false;
      controls?.stop();
      observer.disconnect();
      if (loaded) gl.deleteTexture(loaded.texture);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [image, reduce]);

  const on = () => setReveal.current(1);
  const off = () => setReveal.current(0);

  return (
    <motion.li
      className="min-w-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: ENTER + 0.25 + index * 0.07 }}
    >
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        onHoverStart={on}
        onHoverEnd={off}
        onFocus={on}
        onBlur={off}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="group block"
      >
        <div className="relative aspect-[110/162] overflow-hidden bg-white/[0.04] ring-1 ring-white/10 transition-shadow duration-300 ring-inset group-hover:shadow-[0_18px_40px_-12px_rgb(255_106_26/0.35)]">
          <div
            ref={ref}
            aria-hidden
            className={`absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          />
          {!image && (
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgb(255_255_255/0.14)_1px,transparent_1.4px)] bg-[length:6px_6px]" />
          )}
        </div>
        <p className="mt-2.5 text-[13px] leading-tight font-semibold transition-colors duration-150 group-hover:text-dz-accent sm:text-[15px]">
          {title}
        </p>
        <p className="mt-1.5 text-xs leading-tight text-dz-text-2 sm:mt-2.5 sm:text-[13px]">
          {meta}
        </p>
      </motion.a>
    </motion.li>
  );
}
