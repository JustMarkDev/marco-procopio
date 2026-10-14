"use client";

import { motion } from "motion/react";

import type { Track } from "@/lib/lastfm";

import { Equalizer, useTrack } from "./live-track";
import { PageLink } from "./page-link";
import { EASE, ENTER } from "./reveal";

/** Index footer: the live track and a way into the "me" page. */
export function TrackLine({ initial, more }: { initial: Track | null; more: string }) {
  const track = useTrack(initial);

  return (
    <motion.footer
      className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-12 pb-10 md:pb-20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: ENTER + 0.55 }}
    >
      <Equalizer playing={track.playing} />
      <a
        href={track.url}
        target="_blank"
        rel="noreferrer"
        className="transition-colors duration-150 hover:text-dz-accent"
      >
        {track.name} — {track.artist}
      </a>
      <PageLink
        to="me"
        className="group text-white/80 transition-colors duration-150 hover:text-dz-text"
      >
        {more}{" "}
        <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">
          →
        </span>
      </PageLink>
    </motion.footer>
  );
}
