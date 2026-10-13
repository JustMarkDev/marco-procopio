import {
  ArrowDown02Icon,
  ArrowUpRight01Icon,
  File01Icon,
  GithubIcon,
  Linkedin02Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";

import { CopyEmail } from "@/components/redesign/copy-email";
import { DitherArt } from "@/components/redesign/dither-art";
import { Screen } from "@/components/redesign/screen";
import { links } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

const elsewhere = [
  { label: "JustMarkDev", href: links.github, icon: GithubIcon },
  { label: "@Just_Mark_2", href: links.x, icon: NewTwitterIcon },
  { label: "Marco Procopio", href: links.linkedin, icon: Linkedin02Icon },
];

const tile = "flex h-14 items-center justify-between gap-3 rounded-lg px-4 font-medium";

export default function Page() {
  return (
    <Screen
      page="about"
      art={
        <DitherArt
          src="/redesign/about.webp"
          brightness={0.02}
          mask={{ y0: 0.5, y1: 0.7 }}
          mobileMask={{ y0: 0.72, y1: 0.88 }}
        />
      }
    >
      <main className="flex flex-col gap-14 pt-14 pb-[42vh] md:flex-row md:justify-between md:gap-12 md:pt-[53px] md:pb-[46vh]">
        <section className="rise max-w-[560px]">
          <h1 className="font-display text-[clamp(3.5rem,6.7vw,6rem)] leading-[0.9] font-semibold tracking-[-0.042em]">
            say ciao.
          </h1>
          <p className="mt-6 max-w-[520px] text-lg leading-[1.55]">
            I&apos;m Marco, a computer science student at Milano-Bicocca and a junior fullstack
            developer. AI agents are my default workflow, and I take testing seriously: 400+ tests
            in my biggest project.
          </p>
          <p className="mt-6 max-w-[520px] text-lg leading-[1.55] text-dz-text-2">
            Since 2021 I&apos;ve also run sound and lights at Teatro Procopio, about 50 shows a
            year. Looking for a junior product or fullstack role, in Milan or remote across the EU.
          </p>
        </section>
        <section className="rise flex w-full flex-col gap-[60px] [animation-delay:120ms] md:w-[540px] md:shrink-0">
          <div>
            <h2 className="text-sm text-dz-text-3">email</h2>
            <div className="mt-3">
              <CopyEmail />
            </div>
          </div>
          <div>
            <h2 className="text-sm text-dz-text-3">elsewhere</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {elsewhere.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${tile} group border border-white/20 transition-colors duration-150 hover:border-white/40 hover:bg-white/5`}
                  >
                    <span className="flex items-center gap-3">
                      <HugeiconsIcon icon={l.icon} size={22} />
                      {l.label}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={18}
                      className="text-dz-text-3 transition-colors duration-150 group-hover:text-dz-text"
                    />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={links.cv}
                  download
                  className={`${tile} bg-dz-text font-semibold text-dz-bg transition-opacity duration-150 hover:opacity-90`}
                >
                  <span className="flex items-center gap-3">
                    <HugeiconsIcon icon={File01Icon} size={22} />
                    Download CV
                  </span>
                  <HugeiconsIcon icon={ArrowDown02Icon} size={18} />
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </Screen>
  );
}
