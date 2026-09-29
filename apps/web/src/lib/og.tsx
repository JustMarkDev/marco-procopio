import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { ui, type Lang } from "@/lib/content";

export const ogSize = { width: 1200, height: 630 };

/** Share card: the dithered portrait (pre-rendered in src/assets) next to name and role. */
export async function ogImage(lang: Lang) {
  const t = ui[lang];
  const portrait = await readFile(join(process.cwd(), "src/assets/og-portrait.png"));
  const src = `data:image/png;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: 64,
        background: "#0c0c0e",
        color: "#f4f4f5",
      }}
    >
      <img src={src} width={400} height={500} style={{ borderRadius: 32 }} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3 }}>{t.title}</div>
        <div style={{ fontSize: 36, color: "#a1a1aa" }}>{t.role}</div>
        <div
          style={{ marginTop: 32, width: 96, height: 8, borderRadius: 4, background: "#fb923c" }}
        />
      </div>
    </div>,
    ogSize,
  );
}
