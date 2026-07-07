import React from 'react';
import { ChevronRight, BookOpen, Sparkles } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Breadcrumbs (Dashboard / Exams style) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide">
        <span className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer">Dashboard</span>
        <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-650 dark:text-zinc-300 capitalize" aria-current="page">
          {title}
        </span>
      </nav>

      {/* Header Container with Title & Description */}
      <div className="border-b border-zinc-200/80 dark:border-zinc-800/60 pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>

      {/* Main Content Area Placeholder with 'Coming in next sprint' indicator */}
      <div className="relative border border-dashed border-zinc-200 dark:border-zinc-800/85 rounded-2xl bg-white dark:bg-[#121215] p-8 md:p-12 flex flex-col items-center justify-center text-center overflow-hidden min-h-[350px]">
        {/* Subtle radial light indicator */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none" />

        {/* Coming in next sprint Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 mb-6 animate-pulse select-none">
          <Sparkles className="w-3 h-3" />
          Coming in next sprint
        </div>

        {/* Icon wrapper */}
        <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-550 mb-4 shadow-sm group hover:scale-105 transition-transform duration-300">
          <BookOpen className="w-5 h-5 text-zinc-450 dark:text-zinc-400" />
        </div>

        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
          Module is ready for development
        </h3>
        <p className="mt-2 text-xs text-zinc-450 dark:text-zinc-500 max-w-sm leading-relaxed">
          This page represents the application shell for the <strong>{title}</strong> features. Code for widgets, tables, and API integrations can be dropped into this reusable content container.
        </p>

        {/* Action buttons with focus states */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-offset-zinc-950 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-100"
          >
            Create first entry
          </button>
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-[#1c1c24] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
