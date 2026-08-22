import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useExams } from '../contexts/ExamContext';
import { StatsCard } from '../components/StatsCard';
import {
  Calendar,
  Clock,
  Flame,
  Award,
  Target,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Sparkles,
  CircleDot,
} from 'lucide-react';
import { formatDuration, getLocalDateKey } from '@studyos/utils';
import { getStudySummary } from '../lib/studyApi';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { exams } = useExams();
  const navigate = useNavigate();
  const todayKey = getLocalDateKey();

  const summaryQuery = useQuery({
    queryKey: ['study-summary', todayKey],
    queryFn: () => getStudySummary(todayKey),
  });

  const summary = summaryQuery.data;
  const todayTasks = summary?.todayTasks ?? [];

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
          title="Subjects"
          value={summaryQuery.isLoading ? '...' : String(summary?.subjectCount || 0)}
          description="Created in your workspace"
          icon={<Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Syllabus Progress"
          value={summaryQuery.isLoading ? '...' : `${summary?.syllabusProgress || 0}%`}
          description="Topics completed across subjects"
          icon={<Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Today's Tasks"
          value={summaryQuery.isLoading ? '...' : String(summary?.todayTaskCount || 0)}
          description="Planned for today"
          icon={<Flame className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Completed Today"
          value={summaryQuery.isLoading ? '...' : String(summary?.todayCompletedTasks || 0)}
          description="Marked as done"
          icon={<Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Pending Today"
          value={summaryQuery.isLoading ? '...' : String(summary?.todayPendingTasks || 0)}
          description="Still waiting in your queue"
          icon={<Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Active Exams"
          value={String(exams.length)}
          description="Preparation tracks"
          icon={<GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          onClick={() => navigate('/exams')}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatsCard
            title="Study Today"
            value={formatDuration(summary?.todayStudySeconds || 0)}
            description="Completed study time for the day"
            icon={<Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          />
          <StatsCard
            title="Study This Week"
            value={formatDuration(summary?.weeklyStudySeconds || 0)}
            description="Study time captured this week"
            icon={<Flame className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          />
          <StatsCard
            title="Study Sessions"
            value={String(summary?.completedStudySessionCount || 0)}
            description="Completed timer sessions"
            icon={<CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          />
        </div>

        <div className="xl:col-span-2 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Latest Study Session
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Most recent completed session saved in MongoDB.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/timer')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Open Timer
            </button>
          </div>

          {summary?.recentStudySessions?.[0] ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-zinc-900/20 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                    {summary.recentStudySessions[0].subjectName || 'Subject'}
                  </div>
                  <h3 className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {summary.recentStudySessions[0].title || 'Study session'}
                  </h3>
                </div>
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <div>{new Date(summary.recentStudySessions[0].startedAt).toLocaleString()}</div>
                <div>{formatDuration(summary.recentStudySessions[0].durationSeconds)}</div>
                <div>{summary.recentStudySessions[0].note || 'No note saved.'}</div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No study sessions saved yet
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Use the timer to record your first completed study block.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Today&apos;s Focus
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                The tasks currently on your daily study plan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/planner')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Open Planner
            </button>
          </div>

          {summaryQuery.isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
              <div className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No tasks planned for today
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Add a few planner tasks to keep your subject work moving every day.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c] flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                        {task.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {task.description || 'No description added.'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <span>{task.subjectName || 'No subject linked'}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span>{task.durationMinutes} min</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <CircleDot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-2 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Syllabus Snapshot
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Completion overview for the subject library.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/subjects')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Open Subjects
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <span>Overall Progress</span>
              <span>{summary?.syllabusProgress || 0}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                style={{ width: `${summary?.syllabusProgress || 0}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-zinc-900/20">
              <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                Topics
              </div>
              <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {summary?.syllabusTotalTopics || 0}
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-zinc-900/20">
              <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                Completed
              </div>
              <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {summary?.syllabusCompletedTopics || 0}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-4 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20">
            StudyOS now tracks subjects, chapters, and planner tasks in MongoDB while your exam
            tracks remain intact in the current local exam module.
          </div>
        </div>
      </section>
    </div>
  );
};
