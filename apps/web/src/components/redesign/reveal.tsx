"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { Fragment } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;
/** Entrances wait for the outgoing page's view transition to clear. */
export const ENTER = 0.18;

/** Text that rises word by word out of a mask. Wraps like plain text. */
export function Words({
  text,
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            {i > 0 && " "}
            {/* Bottom padding keeps descenders inside the mask; the negative margin gives the space back. */}
            <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: ENTER + delay + i * stagger }}
              >
                {word}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}

/** Fades up out of a slight blur. */
export function Rise({ delay = 0, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: EASE, delay: ENTER + delay }}
      {...props}
    />
  );
}
