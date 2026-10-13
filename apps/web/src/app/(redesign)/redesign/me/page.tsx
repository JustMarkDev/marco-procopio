import { AudioWave01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { DitherArt } from "@/components/redesign/dither-art";
import { Screen } from "@/components/redesign/screen";
import { TrackProgress } from "@/components/redesign/track-progress";
import { links } from "@/lib/content";

export const metadata: Metadata = { title: "Me" };

const films = [
  { title: "Severance", meta: "watching · S2", src: "/redesign/severance.webp" },
  { title: "Perfect Days", meta: "film · 2023", src: "/redesign/perfect-days.webp" },
  { title: "The Bear", meta: "rewatching · S3", src: "/redesign/the-bear.webp" },
  { title: "Her", meta: "all-time", src: "/redesign/her.webp" },
];

export default function Page() {
  return (
    <Screen
      page="me"
      art={
        <DitherArt
          src="/redesign/me.webp"
          brightness={-0.04}
          mask={{ y0: 0.6, y1: 0.22, top: 0.14 }}
          mobileMask={{ y0: 0.45, y1: 0.15, top: 0.08 }}
          mobileFocus={{ x: 0.62 }}
        />
      }
    >
      <main className="flex flex-1 flex-col justify-end gap-14 pt-[34vh] pb-10 md:flex-row md:items-end md:justify-between md:gap-12 md:pb-[69px]">
        <section aria-labelledby="on-repeat" className="rise max-w-[720px]">
          <p id="on-repeat" className="flex items-center gap-2.5 text-[15px]">
            <HugeiconsIcon icon={AudioWave01Icon} size={18} className="text-dz-accent" />
            on repeat right now
          </p>
          <h1 className="mt-3.5 font-display text-[clamp(3.25rem,7.2vw,6.5rem)] leading-[0.88] font-semibold tracking-[-0.043em]">
            Weird Fishes /
            <br />
            Arpeggi
          </h1>
          <p className="mt-3.5 text-xl">Radiohead — In Rainbows, 2007</p>
          <div className="mt-3.5">
            <TrackProgress start={161} total={318} />
          </div>
          <a
            href={`${links.github}/music-companion`}
            target="_blank"
            rel="noreferrer"
            className="mt-3.5 inline-block text-sm text-dz-text-2 transition-colors duration-150 hover:text-dz-text"
          >
            lyrics synced by music companion, my own overlay ↗
          </a>
        </section>
        <section
          aria-labelledby="films"
          className="rise w-full [animation-delay:120ms] md:mb-16 md:w-[488px] md:shrink-0"
        >
          <h2 id="films" className="text-[15px]">
            Favorite Films
          </h2>
          <ul className="mt-4 grid grid-cols-4 gap-3 md:gap-4">
            {films.map((f) => (
              <li key={f.title} className="min-w-0">
                <div className="relative aspect-[110/162] overflow-hidden bg-white/5">
                  <DitherArt src={f.src} px={2} saturation={1.2} />
                </div>
                <p className="mt-2.5 text-[13px] leading-tight font-semibold sm:text-[15px]">
                  {f.title}
                </p>
                <p className="mt-1.5 text-xs leading-tight text-dz-text-2 sm:mt-2.5 sm:text-[13px]">
                  {f.meta}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Screen>
  );
}
