"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: "spring", stiffness: 400, damping: 25 } as const;

const pill = "inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium";

export function Reveal({
  children,
  delay = 0,
  className,
  onLoad = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Above-the-fold content: animate with CSS so it shows before JavaScript loads (LCP). */
  onLoad?: boolean;
}) {
  if (onLoad) {
    return (
      <div className={`reveal ${className ?? ""}`} style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function GlassButton({
  href,
  icon,
  children,
  label,
  primary = false,
  download = false,
}: {
  href: string;
  icon: IconSvgElement;
  children?: React.ReactNode;
  /** Accessible name when the button shows only an icon. */
  label?: string;
  primary?: boolean;
  download?: boolean;
}) {
  const external = href.startsWith("http");
  return (
    <motion.a
      href={href}
      aria-label={label}
      download={download || undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      initial="rest"
      whileHover="hover"
      whileTap="press"
      variants={{ rest: { scale: 1 }, hover: { scale: 1.04 }, press: { scale: 0.97 } }}
      transition={spring}
      className={`glass ${primary ? "glass-primary" : ""} ${pill} ${children ? "px-5" : "w-11"}`}
    >
      <motion.span
        variants={{ rest: { rotate: 0 }, hover: { rotate: -8 }, press: { rotate: 0 } }}
        transition={spring}
        className="grid place-items-center"
      >
        <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
      </motion.span>
      {children}
    </motion.a>
  );
}

export function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true))}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      className={`glass ${pill} w-11 overflow-hidden`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "done" : "copy"}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={spring}
          className="grid place-items-center"
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={18} strokeWidth={1.8} />
        </motion.span>
      </AnimatePresence>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </motion.button>
  );
}
