"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { BAYER, CELL } from "@/components/dither-image";
import type { Dict, Lang } from "@/lib/content";
import type { Track } from "@/lib/lastfm";

const POLL_MS = 30_000;

/** Live Last.fm track, polled while the tab is visible. Renders nothing if Last.fm is off. */
export function NowPlaying({
  lang,
  t,
  hint,
}: {
  lang: Lang;
  t: Pick<Dict, "listeningNow" | "lastPlayed">;
  /** Development only: shown in a placeholder card when Last.fm isn't configured. */
  hint?: string;
}) {
  const [track, setTrack] = useState<Track | null | undefined>(undefined);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const load = () =>
      fetch("/api/now-playing")
        .then((res) => (res.ok ? (res.json() as Promise<Track | null>) : null))
        .then(setTrack, () => setTrack((cur) => cur ?? null));
    const start = () => {
      clearInterval(timer);
      if (document.visibilityState !== "visible") return;
      void load();
      timer = setInterval(load, POLL_MS);
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  if (track === null && hint) {
    return (
      <div className="mb-12">
        <Wave playing={false} />
        <p className="mt-3 font-mono text-xs text-muted-foreground">{t.listeningNow}</p>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
    );
  }
  if (track === null) return null;

  return (
    <div className="mb-12" aria-live="polite">
      {track === undefined ? (
        // Skeleton in the loaded shape, so nothing shifts when the track arrives.
        <>
          <div className="h-20" />
          <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-foreground/5" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded-full bg-foreground/5" />
        </>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.a
            key={track.url}
            href={track.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="block"
          >
            <Wave playing={track.playing} />
            <div className="mt-3 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted-foreground">
                  {track.playing ? t.listeningNow : `${t.lastPlayed} ${ago(track.playedAt, lang)}`}
                </p>
                <p className="mt-1 truncate font-medium">{track.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {track.artist}
                  {track.album && ` · ${track.album}`}
                </p>
              </div>
            </div>
          </motion.a>
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * A sound wave in 1-bit dots, the same grain as the background art. Mirrored around a
 * centre line and Bayer-dithered, so it fades out at the edges. Moves while a track
 * plays; rests as a dotted line otherwise.
 */
function Wave({ playing }: { playing: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;

    const draw = () => {
      const dpr = devicePixelRatio;
      const size = CELL * dpr;
      const dot = size - dpr;
      const cols = Math.floor(canvas.width / size);
      let rows = Math.floor(canvas.height / size);
      rows -= (rows + 1) % 2; // odd, so there is a centre row
      const mid = (rows - 1) / 2;
      const top = (canvas.height - rows * size) / 2;
      const css = getComputedStyle(document.documentElement);
      ctx.fillStyle = css.getPropertyValue(playing ? "--ring" : "--muted-foreground");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (let x = 0; x < cols; x++) {
        // A few drifting sines under a slow envelope read as speech or music.
        const env = 0.6 + 0.4 * Math.sin(x * 0.045 + t * 0.8);
        const mix =
          0.55 * Math.sin(x * 0.21 - t * 2.2) +
          0.3 * Math.sin(x * 0.53 + t * 3.1) +
          0.15 * Math.sin(x * 1.3 - t * 5);
        const amp = playing ? Math.min(1, 0.12 + env * Math.abs(mix)) : 0;
        for (let y = 0; y < rows; y++) {
          const level = 1 - Math.abs(y - mid) / (mid + 0.5) / Math.max(amp, 0.001);
          if (level > (BAYER[(y % 8) * 8 + (x % 8)]! + 0.5) / 64) {
            ctx.rect(x * size, top + y * size, dot, dot);
          }
        }
      }
      ctx.fill();
    };

    const resize = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    // Theme switches toggle the `dark` class on <html>.
    const themeObserver = new MutationObserver(draw);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class"],
    });

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < 42) return; // ~24fps
      t += Math.min((now - last) / 1000, 0.1);
      last = now;
      draw();
    };
    if (playing && !reduce) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
    };
  }, [playing, reduce]);

  return <canvas ref={ref} aria-hidden className="h-20 w-full [image-rendering:pixelated]" />;
}

function ago(ms: number | undefined, lang: Lang) {
  if (!ms) return "";
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const minutes = Math.round((ms - Date.now()) / 60_000);
  if (minutes > -60) return rtf.format(minutes, "minute");
  if (minutes > -60 * 24) return rtf.format(Math.round(minutes / 60), "hour");
  return rtf.format(Math.round(minutes / 60 / 24), "day");
}
