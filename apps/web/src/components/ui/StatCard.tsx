import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <div className={`glass p-6 flex flex-col gap-4 relative overflow-hidden group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 z-10">
          <p className="text-sm font-medium text-brand-500 dark:text-brand-400">{title}</p>
          <p className="text-3xl font-display font-bold text-brand-900 dark:text-white tracking-tight">
            {value}
          </p>
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-brand-100/50 dark:bg-brand-800/50 flex items-center justify-center text-accent-500 z-10">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2 mt-2 z-10">
          <span
            className={`text-sm font-medium flex items-center gap-0.5 ${
              trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-sm text-brand-400 dark:text-brand-500">{trend.label}</span>
        </div>
      )}

      {/* Decorative gradient blob */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl group-hover:bg-accent-500/20 transition-all duration-500" />
    </div>
  );
}
