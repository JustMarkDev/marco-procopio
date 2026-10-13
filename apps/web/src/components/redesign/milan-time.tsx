"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Current time in Milan, ticking on the minute. */
export function MilanTime() {
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

  return (
    <p className="text-white/80 tabular-nums">
      milan, <time dateTime={now?.toISOString()}>{now ? format.format(now) : "--:--"}</time>
    </p>
  );
}
