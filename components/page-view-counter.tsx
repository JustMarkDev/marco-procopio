"use client";

import { ViewIcon } from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import type { Locale } from "@/lib/site";

type PageViewCounterProps = {
  label: string;
  locale: Locale;
};

export function PageViewCounter({ label, locale }: PageViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);
  const visitId = useRef<string>(undefined);

  if (!visitId.current) visitId.current = crypto.randomUUID();

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitId: visitId.current }),
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to record page view");
        return response.json() as Promise<{ count: number }>;
      })
      .then(({ count: nextCount }) => setCount(nextCount))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(error);
      });

    return () => controller.abort();
  }, []);

  const formattedCount = count === null ? "—" : new Intl.NumberFormat(locale).format(count);

  return (
    <div className="profile-views" aria-label={`${formattedCount} ${label}`} aria-live="polite">
      <Icon icon={ViewIcon} size={14} />
      <span>{formattedCount}</span>
    </div>
  );
}
