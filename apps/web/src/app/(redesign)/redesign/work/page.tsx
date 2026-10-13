import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { DitherArt } from "@/components/redesign/dither-art";
import { Screen } from "@/components/redesign/screen";
import { links, projects, workPath } from "@/lib/content";

export const metadata: Metadata = { title: "Work" };

const repo = (slug: string) => {
  const p = projects.find((p) => p.slug === slug);
  return p?.site ?? `${links.github}/${p?.repo ?? ""}`;
};

/** The meta column names where the arrow goes: a case study, the repo, the live site or merged PRs. */
const rows = [
  {
    name: "Database Contatti",
    what: "335k AI-enriched contacts, 6.6 ms search",
    meta: "private",
    href: workPath("en", "database-contatti"),
  },
  {
    name: "Music Companion",
    what: "word-by-word synced lyrics overlay",
    meta: "github",
    href: repo("music-companion"),
  },
  {
    name: "sergioprocopio.it",
    what: "theatre actor's site, 100/100 PageSpeed",
    meta: "live",
    href: repo("sergio-procopio"),
  },
  {
    name: "Satisfactory Optimizer",
    what: "best start on a 9k-node map in 16 ms",
    meta: "github",
    href: repo("satisfactory-start-optimizer"),
  },
  {
    name: "T3 Code & Raycast",
    what: "merged PRs to tools I use daily",
    meta: "oss",
    href: "https://github.com/pulls?q=is%3Apr+is%3Amerged+author%3AJustMarkDev",
  },
];

export default function Page() {
  return (
    <Screen
      page="work"
      art={
        <DitherArt
          src="/redesign/work.webp"
          brightness={-0.04}
          mask={{ x0: 0.45, x1: 0.7, top: 0.12 }}
          mobileMask={{ y0: 0.3, y1: 0.1, top: 0.05 }}
          mobileFocus={{ x: 0.78 }}
        />
      }
    >
      <main className="flex flex-1 flex-col pt-[30vh] pb-16 md:pt-[124px] md:pb-20">
        <div className="max-w-[820px]">
          <h1 className="rise font-display text-[clamp(3.5rem,6.7vw,6rem)] leading-[0.9] font-semibold tracking-[-0.042em]">
            Work
          </h1>
          <p className="rise mt-3 text-lg text-dz-text-2 [animation-delay:60ms]">
            Things I&apos;ve built and shipped. Rust when it has to be fast, TypeScript when it has
            to be seen.
          </p>
          <ul className="rise mt-10 [animation-delay:120ms]">
            {rows.map((r) => {
              const external = r.href.startsWith("https://");
              return (
                <li key={r.name} className="border-t border-white/15">
                  <a
                    href={r.href}
                    {...(external && { target: "_blank", rel: "noreferrer" })}
                    className="group grid grid-cols-[1fr_auto_20px] items-center gap-x-6 gap-y-1 py-[18px] md:grid-cols-[330px_1fr_64px_20px]"
                  >
                    <span className="font-display text-2xl font-medium tracking-[-0.033em] transition-colors duration-150 group-hover:text-dz-accent group-focus-visible:text-dz-accent md:text-[30px]">
                      {r.name}
                    </span>
                    <span className="col-span-3 row-start-2 text-dz-text-2 transition-colors duration-150 group-hover:text-dz-text md:col-span-1 md:row-start-auto">
                      {r.what}
                    </span>
                    <span className="text-sm text-dz-text-3">{r.meta}</span>
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={20}
                      className="text-dz-text-3 transition-[color,translate] duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-dz-accent"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </Screen>
  );
}
