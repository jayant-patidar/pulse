import { ReactNode } from 'react';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'DELAYED';
  icon?: ReactNode;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  const getStatusColor = (status: TimelineItem['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500 border-emerald-500';
      case 'IN_PROGRESS': return 'bg-amber-500 border-amber-500 animate-pulse';
      case 'DELAYED': return 'bg-rose-500 border-rose-500';
      case 'UPCOMING': return 'bg-brand-200 dark:bg-brand-800 border-brand-300 dark:border-brand-700';
    }
  };

  return (
    <div className="relative border-l-2 border-brand-200 dark:border-brand-800 ml-4 space-y-8 my-6">
      {items.map((item) => (
        <div key={item.id} className="relative pl-8">
          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-brand-950 ${getStatusColor(item.status)}`} />
          <div className="glass p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
                {item.icon && <span className="text-brand-500">{item.icon}</span>}
                {item.title}
              </h4>
              <span className="text-xs font-medium text-brand-500 bg-brand-100 dark:bg-brand-900 px-2 py-1 rounded-md">
                {item.date}
              </span>
            </div>
            {item.description && (
              <p className="text-sm text-brand-600 dark:text-brand-400">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
