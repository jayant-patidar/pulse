import { cn } from "@/core/lib/utils";
import { Card, CardContent } from "./Card";

interface StatItem {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

interface StatsGridProps {
  stats: StatItem[];
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-500 dark:text-brand-400">{stat.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-brand-900 dark:text-brand-100 tracking-tight">
                  {stat.value}
                </span>
                {stat.trend && (
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      stat.trendDirection === 'up' && "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400",
                      stat.trendDirection === 'down' && "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400",
                      stat.trendDirection === 'neutral' && "bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300"
                    )}
                  >
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
            {stat.icon && (
              <div className="p-3 bg-brand-50 dark:bg-brand-900 text-brand-500 dark:text-brand-400 rounded-xl border border-brand-100 dark:border-brand-800 shadow-sm">
                {stat.icon}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
