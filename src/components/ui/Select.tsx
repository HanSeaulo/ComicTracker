import * as React from "react";
import { cn } from "@/lib/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
          className,
        )}
        {...props}
      />
    );
  },
);

Select.displayName = "Select";
