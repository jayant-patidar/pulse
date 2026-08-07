import { Search } from "lucide-react";

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;
}

export function FilterBar({ searchPlaceholder = "Search...", onSearchChange, children }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-4 mb-4 border-b border-brand-100 dark:border-brand-800">
      {onSearchChange && (
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-400 dark:text-brand-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="input-base pl-10 py-2"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
        {children}
      </div>
    </div>
  );
}
