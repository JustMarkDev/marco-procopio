"use client";

import {
  ArrowDown02Icon,
  GithubIcon,
  Linkedin02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

import { links } from "@/lib/content";

import { after } from "./reveal";

const button =
  "flex h-11 items-center gap-2.5 rounded-lg text-sm font-medium transition-colors duration-200";
const outline = `${button} border border-white/20 hover:border-white/45 hover:bg-white/[0.04]`;
const press = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
} as const;

/** Quick contact row for the home page: CV download, email and the two profiles. */
export function QuickLinks({ cv, cvHref }: { cv: string; cvHref: string }) {
  return (
    <div
      className="enter mt-8 flex flex-wrap gap-3 [--enter-dur:0.7s] [--enter-y:12px]"
      style={after(0.45)}
    >
      <motion.a
        href={cvHref}
        download
        {...press}
        className={`${button} group bg-dz-text px-4 font-semibold text-dz-bg hover:bg-white`}
      >
        {cv}
        <HugeiconsIcon
          icon={ArrowDown02Icon}
          size={16}
          className="group-hover:motion-safe:animate-[drop_0.9s_ease-in-out_infinite]"
        />
      </motion.a>
      <motion.a href={links.email} {...press} className={`${outline} px-4`}>
        <HugeiconsIcon icon={Mail01Icon} size={18} />
        Email
      </motion.a>
      <motion.a
        href={links.github}
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
        {...press}
        className={`${outline} w-11 justify-center`}
      >
        <HugeiconsIcon icon={GithubIcon} size={20} />
      </motion.a>
      <motion.a
        href={links.linkedin}
        target="_blank"
        rel="noreferrer"
        aria-label="LinkedIn"
        {...press}
        className={`${outline} w-11 justify-center`}
      >
        <HugeiconsIcon icon={Linkedin02Icon} size={20} />
      </motion.a>
    </div>
  );
}
