import { cn } from "@/core/lib/utils";
import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border bg-white dark:bg-brand-900 px-3 py-2 text-sm text-brand-900 dark:text-brand-100 placeholder:text-brand-400 dark:placeholder:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          error ? "border-red-500 focus-visible:ring-red-500/50" : "border-brand-200 dark:border-brand-800",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea };
