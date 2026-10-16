import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// A 16x16 ordered dither of fire rising from below, like the site art. Bright red at
// the base, ember red at the tips; each column reaches its own height so they flicker.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const LICK = [0, 0.22, 0.08, 0.35, 0.12, 0.02, 0.28, 0.4, 0.18, 0.04, 0.3, 0.1, 0.36, 0.06, 0.2, 0];
const cells = Array.from({ length: 256 }, (_, i) => {
  const x = i % 16;
  const y = Math.floor(i / 16);
  const heat = Math.min(1, Math.max(0, ((y + 0.5) / 16 - 0.5 + LICK[x]!) / 0.5));
  const t = BAYER[y % 4]![x % 4]!;
  const color = (heat - 0.5) * 32 > t ? "#ff3b2f" : heat * 16 > t ? "#8f1117" : null;
  return color && { x, y, color };
}).filter((c) => c !== null);

// Bricolage Grotesque ExtraBold "M" (opsz 12), flipped into SVG coordinates.
const M = "M0 660V0H241L414 475H419L588 0H818V660H665L675 164H663L471 660H340L152 164H140L150 660Z";

/** The fire tile with a white M, scaled to `px`. */
export function mark(px: number, radius: number) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        borderRadius: radius,
        background: "#09090b",
      }}
    >
      {cells.map(({ x, y, color }) => (
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: `${x * 6.25}%`,
            top: `${y * 6.25}%`,
            // A hair over 1/16 so non-integer cell sizes don't leave seams.
            width: "6.4%",
            height: "6.4%",
            background: color,
          }}
        />
      ))}
      <svg width={px * 0.51} height={px * 0.41} viewBox="0 0 818 660">
        <path d={M} fill="#f4f4f5" />
      </svg>
    </div>,
    { width: px, height: px },
  );
}

export default function Icon() {
  return mark(64, 16);
}
