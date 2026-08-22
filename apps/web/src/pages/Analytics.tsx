import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDuration, getLocalDateKey } from '@studyos/utils';
import { StatsCard } from '../components/StatsCard';
import { getStudyAnalytics } from '../lib/studyApi';

const renderBarWidth = (value: number, max: number) => (max === 0 ? '0%' : `${Math.max((value / max) * 100, 4)}%`);

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const todayKey = useMemo(() => getLocalDateKey(), []);

  const analyticsQuery = useQuery({
    queryKey: ['study-analytics', todayKey],
    queryFn: () => getStudyAnalytics(),
  });

  const analytics = analyticsQuery.data;
  const totalStudySeconds = analytics?.totalStudySeconds ?? 0;
  const todayStudySeconds = analytics?.todayStudySeconds ?? 0;
  const weeklyStudySeconds = analytics?.weeklyStudySeconds ?? 0;
  const completedSessionCount = analytics?.completedStudySessionCount ?? 0;
  const subjectStudyTime = analytics?.subjectStudyTime ?? [];
  const dailyActivity = analytics?.dailyActivity ?? [];
  const recentSessions = analytics?.recentSessions ?? [];
  const syllabus = analytics?.syllabus;
  const highestSubjectSeconds = subjectStudyTime[0]?.studySeconds ?? 0;
  const highestDaySeconds = dailyActivity.reduce((max, day) => Math.max(max, day.studySeconds), 0);

  return (
    <div className="space-y-6 animate-fade-in-up font-sans text-left">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide">
        <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors">
          Dashboard
        </button>
        <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-650 dark:text-zinc-300" aria-current="page">
          Analytics
        </span>
      </nav>

      <div className="border-b border-zinc-200/80 dark:border-zinc-800/60 pb-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 select-none w-fit">
            <Sparkles className="w-3 h-3" />
            Study performance
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Progress Analytics
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Real MongoDB session data, subject usage, daily activity, and syllabus completion in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/timer')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
        >
          Open Timer
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Total Study"
          value={formatDuration(totalStudySeconds)}
          description="All saved study sessions"
          icon={<Clock3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Today"
          value={formatDuration(todayStudySeconds)}
          description="Time logged in the current day"
          icon={<CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="This Week"
          value={formatDuration(weeklyStudySeconds)}
          description="Study time recorded this week"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Completed Sessions"
          value={String(completedSessionCount)}
          description="Sessions stored in history"
          icon={<BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Daily Activity
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Study minutes recorded for the most recent days.
                </p>
              </div>
              <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                Active days: {analytics?.activeDays ?? 0}
              </div>
            </div>

            {analyticsQuery.isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
                <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
                <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
              </div>
            ) : dailyActivity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No activity captured yet
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Start logging study sessions to unlock the daily chart.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyActivity.map((day) => (
                  <div key={day.date} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c]">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <span>{day.label}</span>
                      <span>{formatDuration(day.studySeconds)}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                        style={{ width: renderBarWidth(day.studySeconds, highestDaySeconds) }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <span>{day.sessionCount} sessions</span>
                      <span>{day.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Recent Sessions
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                The latest completed study blocks, sorted newest first.
              </p>
            </div>

            {recentSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Clock3 className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No recent sessions yet
                </h3>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c] flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                          {session.title || 'Study session'}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                          {session.subjectName || 'Subject'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {session.note || 'No note added.'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <span>{formatDuration(session.durationSeconds)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Subject Study Time
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Time spent per subject, ranked by total duration.
              </p>
            </div>

            {subjectStudyTime.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No subject breakdown yet
                </h3>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectStudyTime.map((subject) => (
                  <div key={subject.subjectId} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c]">
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      <span className="truncate">{subject.subjectName}</span>
                      <span>{formatDuration(subject.studySeconds)}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                        style={{ width: renderBarWidth(subject.studySeconds, highestSubjectSeconds) }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <span>{subject.sessionCount} sessions</span>
                      <span>{subject.progressPercentage}% syllabus done</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Syllabus Progress
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Progress is derived from existing subject topic completion data.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c]">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  <span>Overall syllabus</span>
                  <span>{syllabus?.progressPercentage ?? 0}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${syllabus?.progressPercentage ?? 0}%` }}
                  />
                </div>
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {syllabus?.completedTopics ?? 0} / {syllabus?.totalTopics ?? 0} topics completed
                </div>
              </div>

              {(syllabus?.subjectProgress ?? []).map((item) => (
                <div key={item.subjectId} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c]">
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    <span className="truncate">{item.subjectName}</span>
                    <span>{item.progressPercentage}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Consistency Snapshot
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                A compact look at recent study behavior.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c]">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Average</div>
                <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {formatDuration(analytics?.averageSessionSeconds ?? 0)}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c]">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Longest</div>
                <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {formatDuration(analytics?.longestSessionSeconds ?? 0)}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c]">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Current streak</div>
                <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {analytics?.currentStreakDays ?? 0}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c]">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">Consistency</div>
                <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {analytics?.consistencyPercentage ?? 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
