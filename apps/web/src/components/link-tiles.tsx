"use client";

import {
  ArrowDown02Icon,
  ArrowUpRight01Icon,
  File01Icon,
  GithubIcon,
  Linkedin02Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

import { links } from "@/lib/content";

import { EASE, ENTER } from "./reveal";

const elsewhere = [
  { label: "JustMarkDev", href: links.github, icon: GithubIcon },
  { label: "@Just_Mark_2", href: links.x, icon: NewTwitterIcon },
  { label: "Marco Procopio", href: links.linkedin, icon: Linkedin02Icon },
];

const tile = "flex h-14 items-center justify-between gap-3 rounded-lg px-4 font-medium";
const press = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
} as const;

const enter = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay: ENTER + 0.35 + i * 0.06 },
});

/** Social links and the CV download, as a 2x2 grid of tiles. */
export function LinkTiles({ cv }: { cv: string }) {
  return (
    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
      {elsewhere.map((l, i) => (
        <motion.li key={l.label} {...enter(i)}>
          <motion.a
            href={l.href}
            target="_blank"
            rel="noreferrer"
            {...press}
            className={`${tile} group border border-white/20 transition-colors duration-200 hover:border-white/45 hover:bg-white/[0.04]`}
          >
            <span className="flex items-center gap-3">
              <HugeiconsIcon icon={l.icon} size={22} />
              {l.label}
            </span>
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={18}
              className="text-dz-text-3 transition-[color,translate] duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-dz-accent"
            />
          </motion.a>
        </motion.li>
      ))}
      <motion.li {...enter(3)}>
        <motion.a
          href={links.cv}
          download
          {...press}
          className={`${tile} group bg-dz-text font-semibold text-dz-bg transition-[background-color,box-shadow] duration-300 hover:bg-white hover:shadow-[0_12px_32px_-12px_rgb(255_106_26/0.6)]`}
        >
          <span className="flex items-center gap-3">
            <HugeiconsIcon icon={File01Icon} size={22} />
            {cv}
          </span>
          <HugeiconsIcon
            icon={ArrowDown02Icon}
            size={18}
            className="group-hover:motion-safe:animate-[drop_0.9s_ease-in-out_infinite]"
          />
        </motion.a>
      </motion.li>
    </ul>
  );
}
