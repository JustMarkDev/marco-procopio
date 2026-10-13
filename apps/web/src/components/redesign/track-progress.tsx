"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** A playback bar that keeps playing from `start`, looping at the end of the track. */
export function TrackProgress({ start, total }: { start: number; total: number }) {
  const [elapsed, setElapsed] = useState(start);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => setElapsed((s) => (s + 1) % (total + 1)), 1000);
    return () => clearInterval(timer);
  }, [reduce, total]);

  return (
    <div className="flex max-w-[420px] items-center gap-3.5 pt-2.5 text-[13px] text-dz-text-2 tabular-nums">
      <span>{clock(elapsed)}</span>
      <div
        role="progressbar"
        aria-label="Track progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={elapsed}
        aria-valuetext={`${clock(elapsed)} of ${clock(total)}`}
        className="h-[3px] flex-1 bg-white/20"
      >
        <div
          className="h-full origin-left bg-dz-text transition-transform duration-1000 ease-linear"
          style={{ transform: `scaleX(${elapsed / total})` }}
        />
      </div>
      <span>{clock(total)}</span>
    </div>
  );
}
