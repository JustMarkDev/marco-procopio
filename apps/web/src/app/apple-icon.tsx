import { mark } from "./icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Square corners: iOS applies its own mask.
export default function AppleIcon() {
  return mark(180, 0);
}
