"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { links, type Lang } from "@/lib/content";
import type { Track } from "@/lib/lastfm";
import type { Copy } from "@/lib/redesign/copy";

import { ago, Equalizer, useTrack } from "./live-track";
import { ENTER, Rise, Words } from "./reveal";

const BARS = 56;
// Fixed pseudo-random heights so server and client render the same bars.
const heights = Array.from(
  { length: BARS },
  (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43)),
);

/**
 * A waveform in place of a progress bar: Last.fm reports what's playing but not where
 * in the track, so the bars only say whether it's playing.
 */
function Waveform({ playing }: { playing: boolean }) {
  return (
    <div aria-hidden className="flex h-7 max-w-[420px] items-center gap-[3px]">
      {heights.map((h, i) => (
        <motion.span
          key={i}
          className="h-full flex-1 origin-center rounded-full bg-dz-text"
          initial={{ scaleY: 0.08, opacity: 0.4 }}
          animate={
            playing
              ? { scaleY: [h * 0.35, h, h * 0.55], opacity: [0.5, 1, 0.6] }
              : { scaleY: 0.08, opacity: 0.35 }
          }
          transition={
            playing
              ? {
                  duration: 1.4 + (i % 5) * 0.18,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: ENTER + 0.4 + i * 0.012,
                }
              : { duration: 0.5 }
          }
        />
      ))}
    </div>
  );
}

/** The live Last.fm track, set as the page headline. */
export function OnRepeat({
  lang,
  t,
  initial,
}: {
  lang: Lang;
  t: Copy["me"];
  initial: Track | null;
}) {
  const track = useTrack(initial);
  // Relative time depends on the clock, so it's only shown after hydration.
  const [when, setWhen] = useState<string | null>(null);
  useEffect(() => {
    setWhen(track.playedAt ? ago(lang, track.playedAt) : null);
  }, [lang, track.playedAt]);

  return (
    <section aria-labelledby="on-repeat" className="max-w-[720px]">
      <Rise>
        <p className="flex items-center gap-2.5 text-[15px]">
          <Equalizer playing={track.playing} />
          {track.playing || !when ? t.playing : `${t.lastPlayed}, ${when}`}
        </p>
      </Rise>
      <h1
        id="on-repeat"
        key={track.name}
        className="mt-3.5 font-display text-[clamp(3.25rem,7.2vw,6.5rem)] leading-[0.88] font-semibold tracking-[-0.043em] text-balance"
      >
        <a
          href={track.url}
          target="_blank"
          rel="noreferrer"
          className="transition-colors duration-200 hover:text-dz-accent"
        >
          <Words text={track.name} delay={0.05} />
        </a>
      </h1>
      <Rise delay={0.25}>
        <p className="mt-3.5 text-xl">
          {track.artist}
          {track.album && ` — ${track.album}`}
        </p>
        <div className="mt-4">
          <Waveform playing={track.playing} />
        </div>
        <a
          href={`${links.github}/music-companion`}
          target="_blank"
          rel="noreferrer"
          className="group mt-3.5 inline-block text-sm text-dz-text-2 transition-colors duration-150 hover:text-dz-text"
        >
          {t.synced}{" "}
          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      </Rise>
    </section>
  );
}
