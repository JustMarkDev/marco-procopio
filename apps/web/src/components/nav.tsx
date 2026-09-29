"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { home, type Dict, type Lang } from "@/lib/content";

const spring = { type: "spring", stiffness: 420, damping: 22 } as const;

export function Nav({ lang, t }: { lang: Lang; t: Dict }) {
  const { resolvedTheme, setTheme } = useTheme();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const onHome = pathname === home(lang);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [detached, setDetached] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const sections = [
    { id: "work", label: t.nav.work },
    { id: "about", label: t.nav.about },
    { id: "contact", label: t.nav.contact },
  ];
  const otherLang =
    lang === "en"
      ? pathname === "/"
        ? "/it"
        : `/it${pathname}`
      : pathname.replace(/^\/it/, "") || "/";

  // Docked at the top of the page, detached (floating pill) once the page scrolls.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setDetached(v > 12));

  // Detaching: the pill drops on a bouncy spring while a glass "neck" stretches
  // from the top edge and pinches off, like a drop of glue letting go.
  const offset = useSpring(0, { stiffness: 380, damping: 14, mass: 0.7 });
  const neck = useMotionValue(0);
  const neckPath = useTransform(neck, (n) => {
    const top = 34 * n;
    const bottom = 46 * n;
    const waist = 12 * n;
    return `M ${50 - top} 0 L ${50 + top} 0 C ${50 + waist} 45, ${50 + bottom} 60, ${50 + bottom} 100 L ${50 - bottom} 100 C ${50 - bottom} 60, ${50 - waist} 45, ${50 - top} 0 Z`;
  });

  useEffect(() => {
    offset.set(detached ? 12 : 0);
    if (reduce || !navRef.current) return;
    if (detached) {
      animate(neck, [1, 0], { duration: 0.55, ease: [0.55, 0, 0.25, 1] });
      animate(
        navRef.current,
        { scaleY: [1, 1.1, 0.96, 1], scaleX: [1, 0.97, 1.01, 1] },
        { duration: 0.65, ease: "easeOut" },
      );
    } else {
      neck.set(0);
    }
  }, [detached, reduce, offset, neck]);

  // Highlight the section crossing a line 30% down the viewport.
  useEffect(() => {
    if (!onHome) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? null : cur));
        }
      },
      { rootMargin: "-30% 0px -69% 0px" },
    );
    // Observe every section (hero included) so the line is always inside one of them.
    for (const el of document.querySelectorAll("main > section")) io.observe(el);
    return () => io.disconnect();
  }, [onHome]);

  const toggleTheme = (e: React.MouseEvent) => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const apply = () => {
      // Flip the class now so the view transition snapshots the new theme.
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      setTheme(next);
    };
    if (reduce || !document.startViewTransition) return apply();

    const { clientX: x, clientY: y } = e;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(apply);
    // `ready` rejects if the transition is skipped (e.g. interrupted); the theme still applies.
    transition.ready.then(
      () => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          {
            duration: 600,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      },
      () => {},
    );
  };

  const highlight = hovered ?? active;
  const linkBase = onHome ? "" : home(lang);

  return (
    <>
      <div aria-hidden className="progressive-blur z-40">
        <div />
        <div />
        <div />
      </div>
      {/* CSS entrance, so the nav paints before JavaScript loads. */}
      <header className="reveal fixed inset-x-0 top-0 z-50 px-1">
        <motion.div style={{ y: offset }} className="relative mx-auto max-w-[42.5rem]">
          <motion.svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ height: offset }}
            className="absolute bottom-full left-0 w-full fill-[var(--glass-fill)]"
          >
            <motion.path d={neckPath} />
          </motion.svg>
          {/* Pill bleeds 24px past the column (like project cards) so the name lines up with page text. */}
          <motion.nav
            ref={navRef}
            initial={false}
            animate={{ borderRadius: detached ? "24px 24px 24px 24px" : "0px 0px 24px 24px" }}
            transition={spring}
            style={{ transformOrigin: "50% 0%" }}
            className="glass flex h-12 items-center pr-1.5 pl-4 md:pl-6"
          >
            <Link
              href={home(lang) as Route}
              className="mr-auto text-sm font-semibold tracking-tight"
            >
              <span className="sm:hidden">MP</span>
              <span className="hidden sm:inline">Marco Procopio</span>
            </Link>
            <ul className="flex items-center" onPointerLeave={() => setHovered(null)}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`${linkBase}#${s.id}`}
                    onPointerEnter={() => setHovered(s.id)}
                    aria-current={active === s.id ? "location" : undefined}
                    className={`relative isolate block rounded-full px-3 py-1.5 text-sm transition-colors duration-fast ${
                      highlight === s.id || active === s.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {highlight === s.id && (
                      <motion.span
                        layoutId="nav-highlight"
                        className="absolute inset-0 -z-10 rounded-full bg-foreground/[0.07]"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href={otherLang as Route}
              hrefLang={lang === "en" ? "it" : "en"}
              aria-label={t.otherLang.name}
              className="ml-1 grid h-9 place-items-center rounded-full px-2 font-mono text-xs text-muted-foreground transition-colors duration-fast hover:bg-foreground/[0.07] hover:text-foreground"
            >
              {t.otherLang.label}
            </Link>
            {/* Both icons and labels render; the `dark` class picks one, so there is no flash before hydration. */}
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="relative grid size-9 place-items-center overflow-hidden rounded-full text-muted-foreground transition-colors duration-fast hover:bg-foreground/[0.07] hover:text-foreground"
            >
              <span className="sr-only dark:hidden">{t.toDark}</span>
              <span className="sr-only hidden dark:inline">{t.toLight}</span>
              <HugeiconsIcon
                icon={Sun03Icon}
                size={18}
                strokeWidth={1.8}
                aria-hidden
                className="col-start-1 row-start-1 transition-[opacity,translate,rotate] duration-300 ease-out-expo dark:-translate-y-4 dark:rotate-60 dark:opacity-0"
              />
              <HugeiconsIcon
                icon={Moon02Icon}
                size={18}
                strokeWidth={1.8}
                aria-hidden
                className="col-start-1 row-start-1 translate-y-4 -rotate-60 opacity-0 transition-[opacity,translate,rotate] duration-300 ease-out-expo dark:translate-y-0 dark:rotate-0 dark:opacity-100"
              />
            </motion.button>
          </motion.nav>
        </motion.div>
      </header>
    </>
  );
}
