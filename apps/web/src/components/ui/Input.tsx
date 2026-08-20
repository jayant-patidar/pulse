import * as React from "react"
import { cn } from "@/core/lib/utils"
import { Calendar, Clock } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    const isDate = type === 'date' || type === 'datetime-local';
    const isTime = type === 'time';
    const hasIcon = isDate || isTime;

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border bg-white dark:bg-brand-900 px-3 py-2 text-sm text-brand-900 dark:text-brand-100 placeholder:text-brand-400 dark:placeholder:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error ? "border-red-500 focus-visible:ring-red-500/50" : "border-brand-200 dark:border-brand-800",
            hasIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {hasIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {isDate ? (
              <Calendar className="h-4 w-4 text-brand-500 dark:text-brand-400" />
            ) : (
              <Clock className="h-4 w-4 text-brand-500 dark:text-brand-400" />
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
