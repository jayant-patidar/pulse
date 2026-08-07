import { cn } from "@/core/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", className)}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="p-3 bg-white dark:bg-brand-900 text-accent-500 rounded-xl shadow-sm border border-brand-200 dark:border-brand-800">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-900 dark:text-brand-100 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm font-medium text-brand-500 dark:text-brand-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
