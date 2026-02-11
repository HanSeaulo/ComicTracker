import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Label({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}
