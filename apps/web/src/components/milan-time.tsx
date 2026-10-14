"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** One digit that rolls up when it changes. */
function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-block overflow-hidden align-top">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="inline-block"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Current time in Milan with rolling digits and a ticking colon. */
export function MilanTime({ city }: { city: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const date = new Date();
      setNow(date);
      timer = setTimeout(tick, 60_000 - (date.getTime() % 60_000));
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const [hh = "--", mm = "--"] = now ? format.format(now).split(":") : [];

  return (
    <p className="text-white/80 tabular-nums">
      {city},{" "}
      <time dateTime={now?.toISOString()} aria-label={now ? `${hh}:${mm}` : undefined}>
        {hh.split("").map((d, i) => (
          <Digit key={`h${i}`} value={d} />
        ))}
        <span className="motion-safe:animate-[blink_2s_steps(1)_infinite]">:</span>
        {mm.split("").map((d, i) => (
          <Digit key={`m${i}`} value={d} />
        ))}
      </time>
    </p>
  );
}
