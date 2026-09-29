import { ogImage, ogSize } from "@/lib/og";

export const alt = "Marco Procopio";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage("en");
}
