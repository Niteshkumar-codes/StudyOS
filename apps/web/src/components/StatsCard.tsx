import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  ariaLabel?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  ariaLabel,
}) => {
  return (
    <div
      tabIndex={0}
      role="article"
      aria-label={ariaLabel || `${title}: ${value}. ${description}`}
      className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all duration-200 ease-out select-none flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-center text-zinc-500 dark:text-indigo-400 shrink-0">
        {icon}
      </div>
      <div className="space-y-1 text-left">
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase block">
          {title}
        </span>
        <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
          {value}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">
          {description}
        </p>
      </div>
    </div>
  );
};
