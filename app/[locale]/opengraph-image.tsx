import { ImageResponse } from "next/og";

export const alt = "Marco Procopio — Engineer & Maker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#060607",
        color: "#f4f4f5",
        display: "flex",
        fontFamily: "monospace",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 850 }}>
        <span style={{ color: "#22c55e", fontSize: 28 }}>● OPEN TO WORK</span>
        <strong style={{ fontSize: 84, letterSpacing: -5 }}>Marco Procopio</strong>
        <span style={{ color: "#a1a1aa", fontSize: 34 }}>Engineer · Maker · AI explorer</span>
      </div>
    </div>,
    size,
  );
}
