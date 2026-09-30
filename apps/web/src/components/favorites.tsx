"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { DitherImage } from "@/components/dither-image";
import { LiquidHighlight } from "@/components/liquid-highlight";
import type { Dict } from "@/lib/content";
import { shelves, type Favorite, type Favorites as Data, type Shelf } from "@/lib/favorites";

const grid =
  "-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-x-5 md:gap-y-8 md:overflow-visible md:px-0";

/** Shelves temporarily hidden from the UI. Their data still loads, so unhiding is one line. */
const HIDDEN: ReadonlySet<Shelf> = new Set(["anime", "manga"]);

/**
 * Tabbed shelves of posters. Empty shelves are skipped, unless there is a `hint`
 * (development only), which shows placeholder slots and what the source needs.
 */
export function Favorites({
  data,
  label,
  labels,
  hints,
}: {
  data: Data;
  label: string;
  labels: Dict["shelves"];
  hints: Partial<Record<Shelf, string>>;
}) {
  const tabs = shelves.filter(
    (shelf) => !HIDDEN.has(shelf) && (data[shelf].length > 0 || hints[shelf]),
  );
  const [active, setActive] = useState<Shelf | undefined>(tabs[0]);
  if (!active) return null;

  // Arrow keys move between tabs, as in the WAI-ARIA tabs pattern.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = tabs[(tabs.indexOf(active) + step + tabs.length) % tabs.length]!;
    setActive(next);
    document.getElementById(`shelf-tab-${next}`)?.focus();
  };

  return (
    <div>
      <LiquidHighlight
        active={active}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="-mx-3 mb-8 flex gap-1 overflow-x-auto px-3 py-1 [scrollbar-width:none]"
      >
        {tabs.map((shelf) => (
          <button
            key={shelf}
            id={`shelf-tab-${shelf}`}
            type="button"
            role="tab"
            aria-selected={active === shelf}
            aria-controls="shelf-panel"
            tabIndex={active === shelf ? 0 : -1}
            data-highlight={shelf}
            onClick={() => setActive(shelf)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-fast ${
              active === shelf ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {labels[shelf]}
          </button>
        ))}
      </LiquidHighlight>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          id="shelf-panel"
          role="tabpanel"
          aria-labelledby={`shelf-tab-${active}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          {data[active].length > 0 ? (
            // Scroll-snap row on phones, a 5 x 2 grid from md up.
            <ul className={grid}>
              {data[active].map((item, i) => (
                <li key={item.href} className="w-36 shrink-0 snap-start md:w-auto">
                  <Poster item={item} index={i} />
                </li>
              ))}
            </ul>
          ) : (
            <Placeholder hint={hints[active]} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Ten empty slots in the shelf's shape, with what the source still needs on top. */
function Placeholder({ hint }: { hint?: string }) {
  return (
    <div className="relative">
      <ul aria-hidden className={grid}>
        {Array.from({ length: 10 }, (_, i) => (
          <li key={i} className="w-36 shrink-0 md:w-auto">
            <div className="placeholder-dots aspect-[2/3] rounded-2xl" />
            <div className="mt-3 h-3 w-3/4 rounded-full bg-foreground/5" />
            <div className="mt-2 h-2.5 w-10 rounded-full bg-foreground/5" />
          </li>
        ))}
      </ul>
      <p className="absolute inset-0 grid place-items-center p-4 text-center">
        <span className="glass rounded-full px-5 py-2.5 text-sm">{hint}</span>
      </p>
    </div>
  );
}

function Poster({ item, index }: { item: Favorite; index: number }) {
  const [revealed, setRevealed] = useState(false);
  const on = () => setRevealed(true);
  const off = () => setRevealed(false);

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      onPointerEnter={on}
      onPointerLeave={off}
      onFocus={on}
      onBlur={off}
      className="group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-foreground/[0.04] ring-1 ring-foreground/5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-1">
        {item.image && (
          <DitherImage
            src={item.image}
            alt={item.title}
            sizes="(min-width: 768px) 180px, 144px"
            revealed={revealed}
            delay={index * 0.04}
          />
        )}
      </div>
      <p className="mt-3 truncate text-sm font-medium" title={item.title}>
        {item.title}
      </p>
      <p className="font-mono text-xs text-ring">{item.meta}</p>
    </a>
  );
}
