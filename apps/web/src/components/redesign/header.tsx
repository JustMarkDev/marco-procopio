"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { pageFromPath, pages, type Copy } from "@/lib/redesign/copy";

import { MilanTime } from "./milan-time";
import { PageLink } from "./page-link";

/** Breadcrumb-style page switcher on the left, Milan local time on the right. Stays put between pages. */
export function Header({ t }: { t: Pick<Copy, "nav" | "city"> }) {
  const current = pageFromPath(usePathname());

  return (
    <header className="relative z-10 flex items-center justify-between gap-6 [view-transition-name:site-header]">
      <nav aria-label="Pages" className="flex items-center gap-2.5">
        {pages.map((p, i) => {
          const active = p === current;
          return (
            <Fragment key={p}>
              {i > 0 && (
                <span aria-hidden className="text-white/50">
                  /
                </span>
              )}
              <PageLink
                to={p}
                aria-current={active ? "page" : undefined}
                className={`group relative py-1 transition-colors duration-150 ${
                  active ? "font-semibold text-dz-text" : "text-white/80 hover:text-dz-text"
                }`}
              >
                {t.nav[p]}
                {active ? (
                  <motion.span
                    layoutId="nav-marker"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-dz-accent"
                  />
                ) : (
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-white/50 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                )}
              </PageLink>
            </Fragment>
          );
        })}
      </nav>
      <MilanTime city={t.city} />
    </header>
  );
}
