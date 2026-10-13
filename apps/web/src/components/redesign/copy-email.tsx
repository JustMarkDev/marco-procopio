"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { links } from "@/lib/content";

/** The email address as a mailto link, with a button that copies it and morphs into a tick. */
export function CopyEmail({ copy, copied: copiedLabel }: { copy: string; copied: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex flex-col items-start gap-3 border-b border-white/18 pb-[18px] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <a
        href={links.email}
        className="group relative min-w-0 font-display text-[clamp(1.25rem,5vw,1.75rem)] font-medium tracking-[-0.025em] wrap-anywhere transition-colors duration-150 hover:text-dz-accent"
      >
        {links.emailAddress}
        <span className="absolute inset-x-0 -bottom-1 h-px origin-right scale-x-0 bg-dz-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100" />
      </a>
      <motion.button
        type="button"
        layout
        onClick={() =>
          navigator.clipboard.writeText(links.emailAddress).then(() => setCopied(true))
        }
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`flex h-10 shrink-0 items-center gap-2 overflow-hidden rounded-lg border px-3.5 text-sm transition-colors duration-200 ${
          copied
            ? "border-dz-accent/60 bg-dz-accent/10 text-dz-accent"
            : "border-white/20 hover:border-white/40 hover:bg-white/5"
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "tick" : "copy"}
            className="flex items-center gap-2"
            initial={{ y: 14, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -14, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.25 }}
          >
            <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={16} />
            <span aria-live="polite">{copied ? copiedLabel : copy}</span>
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
