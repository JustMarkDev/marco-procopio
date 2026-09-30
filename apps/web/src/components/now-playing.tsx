"use client";

import { ArrowUpRight01Icon, MusicNote03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
      load();
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
      <div className="panel mb-12 flex items-center gap-4 rounded-3xl p-3 md:-mx-6">
        <div className="placeholder-dots grid size-16 shrink-0 place-items-center rounded-2xl text-muted-foreground">
          <HugeiconsIcon icon={MusicNote03Icon} size={22} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bars playing={false} />
            {t.listeningNow}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
      </div>
    );
  }
  if (track === null) return null;

  return (
    <div className="panel mb-12 rounded-3xl p-2 md:-mx-6" aria-live="polite">
      {track === undefined ? (
        // Skeleton in the loaded shape, so nothing shifts when the track arrives.
        <div className="flex items-center gap-4 p-1">
          <div className="size-16 shrink-0 animate-pulse rounded-2xl bg-foreground/5" />
          <div className="grid flex-1 gap-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-foreground/5" />
            <div className="h-4 w-48 animate-pulse rounded-full bg-foreground/5" />
          </div>
        </div>
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
            className="group flex items-center gap-4 rounded-2xl p-1 pr-4"
          >
            <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-foreground/5 text-muted-foreground">
              {track.image ? (
                <Image
                  src={track.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                />
              ) : (
                <HugeiconsIcon icon={MusicNote03Icon} size={22} strokeWidth={1.8} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bars playing={track.playing} />
                {track.playing ? t.listeningNow : `${t.lastPlayed} ${ago(track.playedAt, lang)}`}
              </p>
              <p className="mt-1 truncate font-medium">{track.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {track.artist}
                {track.album && ` · ${track.album}`}
              </p>
            </div>
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={18}
              strokeWidth={1.8}
              className="shrink-0 text-muted-foreground transition-transform duration-fast ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </motion.a>
        </AnimatePresence>
      )}
    </div>
  );
}

/** Equaliser: bounces while a track plays, rests flat otherwise. */
function Bars({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="flex h-3 items-end gap-0.5">
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}s` }}
          className={`w-0.5 origin-bottom rounded-full bg-ring ${playing ? "eq h-3" : "h-1"}`}
        />
      ))}
    </span>
  );
}

function ago(ms: number | undefined, lang: Lang) {
  if (!ms) return "";
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const minutes = Math.round((ms - Date.now()) / 60_000);
  if (minutes > -60) return rtf.format(minutes, "minute");
  if (minutes > -60 * 24) return rtf.format(Math.round(minutes / 60), "hour");
  return rtf.format(Math.round(minutes / 60 / 24), "day");
}
