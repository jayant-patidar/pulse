import { cn } from "@/core/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500/50 disabled:opacity-50 disabled:pointer-events-none rounded-xl",
        {
          // Variants
          "bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-md shadow-accent-500/20 hover:shadow-lg hover:shadow-accent-500/30 hover:from-accent-500 hover:to-accent-400 active:scale-[0.98]": variant === "primary",
          "bg-white dark:bg-brand-900 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-sm hover:bg-brand-50 dark:hover:bg-brand-800 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-900 dark:hover:text-white active:scale-[0.98]": variant === "outline" || variant === "secondary",
          "text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-800 hover:text-brand-900 dark:hover:text-brand-100": variant === "ghost",
          "bg-red-500 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:bg-red-400 active:scale-[0.98]": variant === "danger",
          // Sizes
          "h-8 px-4 text-xs": size === "sm",
          "h-10 px-5 text-sm": size === "md",
          "h-12 px-8 text-base": size === "lg",
          "h-10 w-10 p-0": size === "icon",
        },
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
