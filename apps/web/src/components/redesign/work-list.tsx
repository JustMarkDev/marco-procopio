"use client";

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { EASE, ENTER } from "./reveal";

export type Row = {
  name: string;
  what: string;
  meta: string;
  href: string;
  preview?: { src: string; width: number; height: number };
};

/** Project rows. With a mouse, a screenshot of the hovered project trails the cursor. */
export function WorkList({ rows }: { rows: Row[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });
  // Tilt with horizontal speed, like a card being dragged.
  const rotate = useTransform(useVelocity(sx), [-1500, 1500], [-9, 9], { clamp: true });
  const preview = hovered === null ? undefined : rows[hovered]?.preview;

  return (
    <>
      <ul
        className="mt-10"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          x.set(e.clientX);
          y.set(e.clientY);
        }}
        onPointerLeave={() => setHovered(null)}
      >
        {rows.map((r, i) => {
          const external = r.href.startsWith("https://");
          return (
            <motion.li
              key={r.name}
              className="relative"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: ENTER + 0.2 + i * 0.07 }}
            >
              <motion.span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left bg-white/15"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, ease: EASE, delay: ENTER + 0.2 + i * 0.07 }}
              />
              <a
                href={r.href}
                {...(external && { target: "_blank", rel: "noreferrer" })}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
                onFocus={() => setHovered(null)}
                className="group grid grid-cols-[1fr_auto_20px] items-center gap-x-6 gap-y-1 py-[18px] md:grid-cols-[330px_1fr_64px_20px]"
              >
                <span className="font-display text-2xl font-medium tracking-[-0.033em] transition-[color,translate] duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-dz-accent group-focus-visible:text-dz-accent md:text-[30px]">
                  {r.name}
                </span>
                <span className="col-span-3 row-start-2 text-dz-text-2 transition-colors duration-150 group-hover:text-dz-text md:col-span-1 md:row-start-auto">
                  {r.what}
                </span>
                <span className="text-sm text-dz-text-3">{r.meta}</span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={20}
                  className="text-dz-text-3 transition-[color,rotate,scale] duration-300 ease-out group-hover:scale-110 group-hover:rotate-45 group-hover:text-dz-accent"
                />
              </a>
            </motion.li>
          );
        })}
      </ul>

      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-20 hidden md:block"
        style={{ x: sx, y: sy, rotate }}
      >
        <AnimatePresence>
          {preview && (
            <motion.div
              key={preview.src}
              className="absolute -top-24 left-8 w-[280px] overflow-hidden rounded-md shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/15"
              initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <Image
                src={preview.src}
                alt=""
                width={preview.width}
                height={preview.height}
                sizes="280px"
                className="h-auto w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
