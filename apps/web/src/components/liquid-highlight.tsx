"use client";

import { Liquid } from "liquid-gooey";
import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

type Box = { x: number; y: number; width: number; height: number };

/**
 * A pill that slides to the child marked `data-highlight={active}` and trails liquid
 * like a droplet (liquid-gooey "move" effect). It shrinks away when `active` is null.
 * Renders the container div itself, so pass layout classes and ARIA props here.
 */
export function LiquidHighlight({
  active,
  children,
  ...props
}: { active: string | null } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  // Separate from `box`, so a hidden pill shrinks in place instead of jumping.
  const [found, setFound] = useState(false);
  const visible = active !== null && found;

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || active === null) return;
    const measure = () => {
      const el = root.querySelector<HTMLElement>(`[data-highlight="${active}"]`);
      setFound(!!el);
      // offset* ignores transforms, so hover scale effects never skew the pill.
      if (el)
        setBox({
          x: el.offsetLeft,
          y: el.offsetTop,
          width: el.offsetWidth,
          height: el.offsetHeight,
        });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    return () => resize.disconnect();
  }, [active]);

  return (
    <Liquid ref={ref} fill="var(--pill)" blur={6} contrast={20} {...props}>
      <Liquid.Item effect="move" move={{ springiness: 0.55, trail: 0.5, wobble: 0.4 }}>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 rounded-full"
          initial={false}
          animate={box ? { ...box, scale: visible ? 1 : 0 } : { scale: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      </Liquid.Item>
      {children}
    </Liquid>
  );
}
