import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, type = "button", ...props }: ComponentProps<"button">) {
  return (
    <button data-slot="button" type={type} className={cn("icon-button", className)} {...props} />
  );
}
