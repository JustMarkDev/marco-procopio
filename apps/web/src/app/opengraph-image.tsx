import { ImageResponse } from "next/og";

export const alt = "Marco Procopio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Equalizer bar heights, echoing the now-playing mark on the site.
const bars = [0.55, 1, 0.7, 0.85];

/** Share card in the site's palette: name, role and the accent equalizer. */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 80,
        background: "#09090b",
        color: "#f4f4f5",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 56, marginBottom: 40 }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{ width: 14, height: `${h * 100}%`, borderRadius: 7, background: "#ff6a1a" }}
          />
        ))}
      </div>
      <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: -6, lineHeight: 0.9 }}>
        Marco Procopio
      </div>
      <div style={{ marginTop: 28, fontSize: 40, color: "#b4b4bb" }}>
        Fullstack and product engineer · Milan
      </div>
    </div>,
    size,
  );
}
