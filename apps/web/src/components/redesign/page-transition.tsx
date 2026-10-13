import { ViewTransition } from "react";

const directional = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

/**
 * Wraps a page's content: on in-app navigation the old page slides out in the direction
 * of travel while the new one builds itself in with Motion. Browser back/forward and
 * first loads carry no transition type, so nothing slides.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition exit={directional} enter="none" default="none">
      {children}
    </ViewTransition>
  );
}
