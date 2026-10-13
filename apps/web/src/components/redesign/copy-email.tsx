"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

import { links } from "@/lib/content";

/** The email address as a mailto link, with a button that copies it. */
export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/18 pb-[18px]">
      <a
        href={links.email}
        className="min-w-0 font-display text-[clamp(1.125rem,4.5vw,1.75rem)] wrap-anywhere font-medium tracking-[-0.025em] transition-colors duration-150 hover:text-dz-accent"
      >
        {links.emailAddress}
      </a>
      <button
        type="button"
        onClick={() =>
          navigator.clipboard.writeText(links.emailAddress).then(() => setCopied(true))
        }
        className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3.5 text-sm transition-colors duration-150 hover:border-white/40 hover:bg-white/5"
      >
        <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={16} />
        <span aria-live="polite">{copied ? "copied" : "copy"}</span>
      </button>
    </div>
  );
}
