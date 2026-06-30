import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 transition-colors duration-500 bg-[#fafafa] dark:bg-[#111827] overflow-hidden">
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/[0.04] dark:bg-indigo-500/[0.07] blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/[0.04] dark:bg-purple-500/[0.07] blur-[100px] pointer-events-none animate-pulse"></div>

      {/* Floating Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl border border-slate-200 dark:border-[#374151] bg-white/80 dark:bg-[#1f2937]/85 backdrop-blur-md text-zinc-700 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-[#1f2937]/85 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm z-20"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-4.5 h-4.5 text-amber-400" />
        ) : (
          <Moon className="w-4.5 h-4.5 text-indigo-650" />
        )}
      </button>

      {/* Card container */}
      <div className="w-full max-w-[520px] z-10 animate-fade-in my-8">
        {/* Logo header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-[11px] font-bold tracking-wider uppercase mb-3.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            StudyOS Auth
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Study<span className="text-indigo-600 dark:text-[#6366f1]">OS</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 text-center max-w-sm">
            Your Complete Preparation Operating System
          </p>
        </div>

        {/* Content Outlet (Refined Card) */}
        <div className="bg-white dark:bg-[#1f2937] border border-slate-200/80 dark:border-[#374151] p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/30 dark:shadow-black/70 transition-all duration-300 text-zinc-900 dark:text-[#f9fafb]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
