import * as React from "react"
import { cn } from "@/core/lib/utils"
import { X } from "lucide-react"

export interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SlideOver({ isOpen, onClose, title, description, children }: SlideOverProps) {
  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="relative z-50" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-brand-950/20 backdrop-blur-sm transition-opacity opacity-100" 
        onClick={onClose}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            {/* Slide-over panel */}
            <div className="pointer-events-auto w-screen max-w-md h-full transform transition ease-in-out duration-500 sm:duration-700 translate-x-0">
              <div className="flex h-full flex-col bg-white dark:bg-brand-950 shadow-xl border-l border-brand-200 dark:border-brand-800">
                <div className="px-4 py-6 sm:px-6 border-b border-brand-200 dark:border-brand-800">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-semibold leading-6 text-brand-900 dark:text-brand-100" id="slide-over-title">
                      {title}
                    </h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="relative rounded-md text-brand-400 hover:text-brand-500 focus:outline-none"
                        onClick={onClose}
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {description && (
                    <div className="mt-1">
                      <p className="text-sm text-brand-500 dark:text-brand-400">
                        {description}
                      </p>
                    </div>
                  )}
                </div>
                <div className="relative flex-1 min-h-0 px-4 py-6 sm:px-6 overflow-y-auto">
                  {/* Content */}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
