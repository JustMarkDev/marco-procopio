import Link from "next/link";
import type { ComponentProps } from "react";

import { pagePath, type Page } from "@/lib/redesign/copy";

/** A link to another redesign page by name. */
export function PageLink({
  to,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { to: Page }) {
  return <Link href={pagePath(to)} {...props} />;
}
