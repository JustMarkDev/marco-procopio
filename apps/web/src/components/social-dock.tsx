"use client";

import { Copy01Icon, Linkedin02Icon, NewTwitterIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Liquid } from "liquid-gooey";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { links } from "@/lib/content";

const icon =
  "grid size-11 place-items-center rounded-full text-muted-foreground transition-colors duration-fast hover:text-foreground focus-visible:text-foreground";

/**
 * Footer contact dock: round buttons that sit close enough to merge into one liquid
 * bar (liquid-gooey "morph"). The hovered one lifts and necks away from the rest.
 */
export function SocialDock({ copyLabel, copiedLabel }: { copyLabel: string; copiedLabel: string }) {
  const [lifted, setLifted] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const lift = (key: string) => ({
    onPointerEnter: () => setLifted(key),
    onFocus: () => setLifted(key),
    onBlur: () => setLifted(null),
  });
  const item = (key: string) => ({
    y: lifted === key ? -10 : 0,
    scale: lifted === key ? 1.06 : 1,
    transition: "bouncy" as const,
  });

  const social: { key: string; href: string; label: string; glyph: IconSvgElement }[] = [
    { key: "linkedin", href: links.linkedin, label: "LinkedIn", glyph: Linkedin02Icon },
    { key: "x", href: links.x, label: "X", glyph: NewTwitterIcon },
  ];

  return (
    <Liquid
      fill="var(--pill)"
      blur={8}
      contrast={20}
      shadow="0 10px 30px -14px rgb(24 24 27 / 0.35)"
      onPointerLeave={() => setLifted(null)}
      // Room above for the lift, so the liquid never clips.
      className="flex items-center gap-1 pt-3"
    >
      {social.map((s) => (
        <Liquid.Item key={s.key} {...item(s.key)}>
          <a
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            className={icon}
            {...lift(s.key)}
          >
            <HugeiconsIcon icon={s.glyph} size={18} strokeWidth={1.8} />
          </a>
        </Liquid.Item>
      ))}
      <Liquid.Item {...item("copy")}>
        <button
          type="button"
          aria-label={copyLabel}
          onClick={() =>
            navigator.clipboard.writeText(links.emailAddress).then(() => setCopied(true))
          }
          className={`${icon} overflow-hidden`}
          {...lift("copy")}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={copied ? "done" : "copy"}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="grid place-items-center"
            >
              <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={18} strokeWidth={1.8} />
            </motion.span>
          </AnimatePresence>
          <span role="status" className="sr-only">
            {copied ? copiedLabel : ""}
          </span>
        </button>
      </Liquid.Item>
    </Liquid>
  );
}
