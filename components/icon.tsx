import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";

type IconProps = Omit<HugeiconsIconProps, "size" | "strokeWidth"> & {
  size?: number;
  label?: string;
};

export function Icon({ size = 18, label, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      size={size}
      strokeWidth={1.8}
      {...props}
    />
  );
}
