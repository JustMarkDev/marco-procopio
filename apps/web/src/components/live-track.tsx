"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import type { Lang } from "@/lib/content";
import type { Track } from "@/lib/lastfm";

const POLL_MS = 30_000;

/** The server-rendered track, kept fresh by polling while the tab is visible. Null when Last.fm is off or down. */
export function useTrack(initial: Track | null): Track | null {
  const [track, setTrack] = useState(initial);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const load = () =>
      fetch("/api/now-playing")
        .then((res) => {
          if (!res.ok) throw new Error(`Responded ${res.status}`);
          return res.json() as Promise<Track | null>;
        })
        // A null body means Last.fm is down or off: drop the old track rather than
        // keep showing it as live. Network and server errors keep what's on screen.
        .then(setTrack, () => {});
    const start = () => {
      clearInterval(timer);
      if (document.visibilityState !== "visible") return;
      // The page is cached for an hour; catch up straight away, then keep polling.
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

  return track;
}

/** "3 hours ago" in the page language. */
export function ago(lang: Lang, ms: number) {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const minutes = Math.round((ms - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

const BARS = [
  [0.35, 1, 0.5, 0.85, 0.35],
  [0.8, 0.3, 1, 0.45, 0.8],
  [0.5, 0.9, 0.3, 1, 0.5],
  [0.9, 0.45, 0.75, 0.3, 0.9],
];

/** Four accent bars that bounce while music is playing and rest when it isn't. */
export function Equalizer({ playing, size = 18 }: { playing: boolean; size?: number }) {
  return (
    <span aria-hidden className="flex items-end gap-[2px]" style={{ height: size, width: size }}>
      {BARS.map((frames, i) => (
        <motion.span
          key={i}
          className="w-full origin-bottom rounded-full bg-dz-accent"
          style={{ height: "100%" }}
          initial={{ scaleY: 0.3 }}
          animate={playing ? { scaleY: frames } : { scaleY: [0.3, 0.45, 0.3][i % 3] }}
          transition={
            playing
              ? { duration: 1.1 + i * 0.17, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.6 }
          }
        />
      ))}
    </span>
  );
}
