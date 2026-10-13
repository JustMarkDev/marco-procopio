"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

import { pageFromPath, pagePath, pages, type Page } from "@/lib/redesign/copy";

/** A link to another redesign page, tagged forward or back so the page slides the right way. */
export function PageLink({
  to,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { to: Page }) {
  const from = pageFromPath(usePathname());
  const forward = pages.indexOf(to) >= pages.indexOf(from);
  return (
    <Link href={pagePath(to)} transitionTypes={[forward ? "nav-forward" : "nav-back"]} {...props} />
  );
}
