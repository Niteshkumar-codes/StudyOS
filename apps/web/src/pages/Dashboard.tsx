import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StatsCard } from '../components/StatsCard';
import {
  Calendar,
  Clock,
  Flame,
  Award,
  Target,
  GraduationCap,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 animate-fade-in-up font-sans text-left">
      {/* 1. HERO HEADER */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800/60 pb-6">
        <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider block mb-1">
          {getGreeting()}, {user?.name || 'User'}
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back to StudyOS
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Your Complete Preparation Operating System
        </p>
      </header>

      {/* 2. STATISTICS CARDS GRID */}
      <section
        aria-label="Overview statistics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <StatsCard
          title="Preparing Since"
          value="--"
          description="Preparation journey"
          icon={<Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Total Study Time"
          value="0 Hours"
          description="Across all study sessions"
          icon={<Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Current Streak"
          value="0 Days"
          description="Current consecutive study days"
          icon={<Flame className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Longest Streak"
          value="0 Days"
          description="Best performance"
          icon={<Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Today's Goal"
          value="0%"
          description="Daily target progress"
          icon={<Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Active Exams"
          value="0"
          description="Preparation tracks"
          icon={<GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
      </section>
    </div>
  );
};
