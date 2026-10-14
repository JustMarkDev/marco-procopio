import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        background: "#09090b",
        color: "#ff6a1a",
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: -1,
      }}
    >
      MP
    </div>,
    size,
  );
}
