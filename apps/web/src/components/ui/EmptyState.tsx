import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-800 mb-4 text-brand-500 dark:text-brand-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-brand-900 dark:text-brand-100">{title}</h3>
      <p className="mt-1 text-sm text-brand-500 dark:text-brand-400 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
