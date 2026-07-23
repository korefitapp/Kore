import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  isError?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  isError = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div 
        className={`w-16 h-16 rounded-3xl grid place-items-center mb-4 ring-1 shadow-sm ${
          isError 
            ? "bg-rose-50 text-rose-500 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-500/30"
            : "bg-kore-bg text-kore-muted ring-kore-border"
        }`}
      >
        <Icon strokeWidth={1.5} size={32} />
      </div>
      
      <h3 className={`text-lg font-bold mb-1 ${isError ? "text-rose-600 dark:text-rose-400" : "text-kore-ink"}`}>
        {title}
      </h3>
      
      <p className="text-sm text-kore-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                isError 
                  ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/30"
                  : "bg-kore-emerald text-white hover:brightness-110 shadow-kore-emerald/30"
              }`}
            >
              {action.icon && <action.icon size={16} />}
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-kore-subink bg-kore-bg border border-kore-border hover:bg-kore-card transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
