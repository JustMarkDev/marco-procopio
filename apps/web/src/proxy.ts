import { NextResponse, type NextRequest } from "next/server";

/** Italian if the browser ranks it above English, otherwise English. */
function pickLang(header: string | null): "en" | "it" {
  const ranked = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag, q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .toSorted((a, b) => b.q - a.q);
  const first = ranked.find(({ tag }) => tag.startsWith("it") || tag.startsWith("en"));
  return first?.tag.startsWith("it") ? "it" : "en";
}

/**
 * There is no language switcher: each page request is rewritten to the hidden [lang]
 * segment picked from Accept-Language. Typing a language into the URL only nests it
 * again and 404s, so the browser setting always wins.
 */
export function proxy(request: NextRequest) {
  const lang = pickLang(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${url.pathname === "/" ? "" : url.pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  // Pages only: not API routes, Next internals, metadata images or files with an extension.
  matcher: ["/((?!api|_next|icon|opengraph-image|twitter-image|.*\\.\\w+$).*)"],
};
