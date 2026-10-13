import { AudioWave01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { DitherArt } from "@/components/redesign/dither-art";
import { Screen } from "@/components/redesign/screen";

export default function Page() {
  return (
    <Screen
      page="index"
      art={
        <DitherArt
          src="/redesign/index.webp"
          brightness={-0.04}
          mask={{ x0: 0.42, x1: 0.7, top: 0.16 }}
          mobileMask={{ y0: 0.62, y1: 0.25, top: 0.08 }}
        />
      }
    >
      <main className="flex flex-1 flex-col justify-end pt-16 md:justify-center md:pt-0">
        <h1 className="rise font-display text-[clamp(4.5rem,12vw,10.75rem)] leading-[0.82] font-semibold tracking-[-0.047em]">
          Marco
          <br />
          Procopio
        </h1>
        <p className="rise mt-8 max-w-[520px] text-xl leading-[1.4] [animation-delay:80ms] md:text-2xl">
          CS student at Milano-Bicocca and junior developer. I build desktop apps, websites and
          tools, with AI agents as my everyday workflow.
        </p>
      </main>
      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-12 pb-10 md:pb-20">
        <HugeiconsIcon icon={AudioWave01Icon} size={18} className="text-dz-accent" />
        <p>Weird Fishes / Arpeggi — Radiohead</p>
        <Link
          href="/redesign/me"
          className="text-white/80 transition-colors duration-150 hover:text-dz-text"
        >
          more of what I&apos;m into →
        </Link>
      </footer>
    </Screen>
  );
}
