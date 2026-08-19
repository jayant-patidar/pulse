import { cn } from "@/core/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Project & Common Statuses
  DRAFT: "bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800",
  ACTIVE: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
  ON_HOLD: "bg-accent-100 dark:bg-accent-900/50 text-accent-800 dark:text-accent-400 border-accent-300 dark:border-accent-800",
  COMPLETED: "bg-brand-800 dark:bg-brand-700 text-brand-100 border-brand-900 dark:border-brand-600",
  ARCHIVED: "bg-brand-100 dark:bg-brand-800 dark:bg-gray-800/50 text-brand-500 dark:text-brand-400 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  
  // Tasks
  TODO: "bg-white dark:bg-brand-900 text-brand-600 dark:text-brand-300 border-brand-200 dark:border-brand-800 shadow-sm",
  IN_PROGRESS: "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-800",
  BLOCKED: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800 font-semibold",
  CANCELLED: "bg-brand-100 dark:bg-brand-800 dark:bg-gray-800/50 text-brand-500 dark:text-brand-400 dark:text-gray-400 border-gray-200 dark:border-gray-700",

  // Reports & Documents
  SUBMITTED: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-800",
  UNDER_REVIEW: "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-800",
  APPROVED: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
  REJECTED: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800",
  NONE: "bg-brand-50 dark:bg-brand-900/50 text-brand-500 dark:text-brand-400 border-brand-200 dark:border-brand-800",
  PENDING: "bg-accent-100 dark:bg-accent-900/50 text-accent-800 dark:text-accent-400 border-accent-300 dark:border-accent-800",

  // Equipment
  AVAILABLE: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
  IN_USE: "bg-brand-100 dark:bg-brand-900/50 text-brand-800 dark:text-brand-300 border-brand-300 dark:border-brand-700",
  UNDER_MAINTENANCE: "bg-accent-100 dark:bg-accent-900/50 text-accent-800 dark:text-accent-400 border-accent-300 dark:border-accent-800",
  OUT_OF_SERVICE: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800",
  RETIRED: "bg-brand-100 dark:bg-brand-800 dark:bg-gray-800/50 text-brand-500 dark:text-brand-400 dark:text-gray-400 border-gray-200 dark:border-gray-700",

  // Priority
  LOW: "bg-brand-50 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800",
  MEDIUM: "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-800",
  HIGH: "bg-accent-100 dark:bg-accent-900/50 text-accent-800 dark:text-accent-400 border-accent-300 dark:border-accent-800 font-semibold",
  URGENT: "bg-red-600 text-white border-red-700 font-bold shadow-sm shadow-red-500/30",
  CRITICAL: "bg-red-600 text-white border-red-700 font-bold shadow-sm shadow-red-500/30 animate-pulse",

  // Agriculture - Inventory
  IN_STOCK: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
  LOW_STOCK: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800",
  OUT_OF_STOCK: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800",

  // Agriculture - Crop Cycles
  PLANNED: "bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800",
  PLANTED: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800",
  GROWING: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
  HARVESTING: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-800",
  ABANDONED: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800",

  // Agriculture - Scouting
  TREATED: "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-800",
  RESOLVED: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toUpperCase() || "";
  const style = statusStyles[normalizedStatus] || "bg-brand-50 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        style,
        className
      )}
    >
      {normalizedStatus.replace(/_/g, " ")}
    </span>
  );
}
