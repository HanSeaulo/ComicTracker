import * as React from "react";
import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
