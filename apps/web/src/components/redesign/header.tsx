import Link from "next/link";
import { Fragment } from "react";

import { MilanTime } from "./milan-time";

export const pages = [
  { key: "index", href: "/redesign" },
  { key: "work", href: "/redesign/work" },
  { key: "me", href: "/redesign/me" },
  { key: "about", href: "/redesign/about" },
] as const;

export type Page = (typeof pages)[number]["key"];

/** Breadcrumb-style page switcher on the left, Milan local time on the right. */
export function Header({ current }: { current: Page }) {
  return (
    <header className="relative z-10 flex items-center justify-between gap-6 text-base">
      <nav aria-label="Pages" className="flex items-center gap-2.5">
        {pages.map((p, i) => (
          <Fragment key={p.key}>
            {i > 0 && (
              <span aria-hidden className="text-white/50">
                /
              </span>
            )}
            <Link
              href={p.href}
              aria-current={p.key === current ? "page" : undefined}
              className={
                p.key === current
                  ? "font-semibold text-dz-text"
                  : "text-white/80 transition-colors duration-150 hover:text-dz-text"
              }
            >
              {p.key}
            </Link>
          </Fragment>
        ))}
      </nav>
      <MilanTime />
    </header>
  );
}
