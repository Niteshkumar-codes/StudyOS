import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronRight,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sparkles,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDuration, getLocalDateKey } from '@studyos/utils';
import { StatsCard } from '../components/StatsCard';
import { useNavigate } from 'react-router-dom';
import type { StudySession, Subject } from '@studyos/types';
import { createStudySession, deleteStudySession, getStudySessions, getStudySummary } from '../lib/studyApi';

type TimerStatus = 'idle' | 'running' | 'paused';

const formatSessionDate = (timestamp: string) =>
  new Date(timestamp).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const StudyTimer: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const todayKey = useMemo(() => getLocalDateKey(), []);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionNote, setSessionNote] = useState('');
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [historySubjectId, setHistorySubjectId] = useState('all');
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const startedAtRef = useRef<number | null>(null);
  const currentRunStartedAtRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef(0);

  const summaryQuery = useQuery({
    queryKey: ['study-summary', todayKey],
    queryFn: () => getStudySummary(todayKey),
  });

  const subjects = summaryQuery.data?.subjects ?? [];

  useEffect(() => {
    if (selectedSubjectId || subjects.length === 0) {
      return;
    }
    setSelectedSubjectId(subjects[0].id);
  }, [selectedSubjectId, subjects]);

  useEffect(() => {
    if (subjects.length === 0) {
      setHistorySubjectId('all');
    }
  }, [subjects.length]);

  const sessionsQuery = useQuery({
    queryKey: ['study-sessions', historySubjectId],
    queryFn: () =>
      getStudySessions(historySubjectId === 'all' ? undefined : { subjectId: historySubjectId, limit: 20 }),
  });

  const historySessions = sessionsQuery.data?.sessions ?? [];

  const readElapsedSeconds = () => {
    if (timerStatus === 'running' && currentRunStartedAtRef.current !== null) {
      return accumulatedSecondsRef.current + Math.floor((Date.now() - currentRunStartedAtRef.current) / 1000);
    }
    return accumulatedSecondsRef.current;
  };

  useEffect(() => {
    if (timerStatus !== 'running') {
      setElapsedSeconds(accumulatedSecondsRef.current);
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds(readElapsedSeconds());
    }, 1000);

    setElapsedSeconds(readElapsedSeconds());
    return () => window.clearInterval(interval);
  }, [timerStatus]);

  const resetTimer = () => {
    startedAtRef.current = null;
    currentRunStartedAtRef.current = null;
    accumulatedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setTimerStatus('idle');
  };

  const startTimer = () => {
    if (!selectedSubjectId) {
      toast.error('Choose a subject before starting the timer.');
      return;
    }

    if (timerStatus !== 'idle') {
      return;
    }

    const now = Date.now();
    startedAtRef.current = now;
    currentRunStartedAtRef.current = now;
    accumulatedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setTimerStatus('running');
  };

  const pauseTimer = () => {
    if (timerStatus !== 'running') {
      return;
    }

    accumulatedSecondsRef.current = readElapsedSeconds();
    currentRunStartedAtRef.current = null;
    setElapsedSeconds(accumulatedSecondsRef.current);
    setTimerStatus('paused');
  };

  const resumeTimer = () => {
    if (timerStatus !== 'paused') {
      return;
    }

    currentRunStartedAtRef.current = Date.now();
    setTimerStatus('running');
  };

  const stopAndSaveSession = async () => {
    const totalElapsed = readElapsedSeconds();

    if (!selectedSubjectId) {
      toast.error('Choose a subject before saving a session.');
      return;
    }

    if (!startedAtRef.current || totalElapsed <= 0) {
      toast.error('Start the timer before stopping it.');
      return;
    }

    setIsSavingSession(true);
    try {
      const endedAt = new Date();
      const response = await createStudySession({
        subjectId: selectedSubjectId,
        title: sessionTitle.trim() || undefined,
        note: sessionNote.trim() || undefined,
        startedAt: new Date(startedAtRef.current).toISOString(),
        endedAt: endedAt.toISOString(),
        durationSeconds: totalElapsed,
      });

      toast.success(`Saved ${formatDuration(response.session.durationSeconds)} study session.`);
      setSessionTitle('');
      setSessionNote('');
      resetTimer();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['study-summary', todayKey] }),
        queryClient.invalidateQueries({ queryKey: ['study-sessions'] }),
      ]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save study session');
    } finally {
      setIsSavingSession(false);
    }
  };

  const cancelTimer = () => {
    if (timerStatus === 'running' || timerStatus === 'paused') {
      const confirmDiscard = window.confirm('Discard the current timer session?');
      if (!confirmDiscard) {
        return;
      }
    }

    setSessionTitle('');
    setSessionNote('');
    resetTimer();
  };

  const handleDeleteSession = async (session: StudySession) => {
    if (!window.confirm(`Delete this session from ${session.subjectName || 'your history'}?`)) {
      return;
    }

    setDeletingSessionId(session.id);
    try {
      await deleteStudySession(session.id);
      toast.success('Study session deleted');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['study-summary', todayKey] }),
        queryClient.invalidateQueries({ queryKey: ['study-sessions'] }),
      ]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete study session');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const summary = summaryQuery.data;
  const totalStudySeconds = summary?.totalStudySeconds || sessionsQuery.data?.totalStudySeconds || 0;
  const todayStudySeconds = summary?.todayStudySeconds || sessionsQuery.data?.todayStudySeconds || 0;
  const weeklyStudySeconds = summary?.weeklyStudySeconds || sessionsQuery.data?.weeklyStudySeconds || 0;
  const completedSessionCount = summary?.completedStudySessionCount || sessionsQuery.data?.totalCount || 0;
  const latestSession = summary?.recentStudySessions?.[0] ?? historySessions[0] ?? null;

  return (
    <div className="space-y-6 animate-fade-in-up font-sans text-left">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide">
        <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors">
          Dashboard
        </button>
        <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-650 dark:text-zinc-300" aria-current="page">
          Study Timer
        </span>
      </nav>

      <div className="border-b border-zinc-200/80 dark:border-zinc-800/60 pb-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 select-none w-fit">
            <Sparkles className="w-3 h-3" />
            Active study session
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Study Timer
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Pick a subject, start a focused session, then save the completed study block to your MongoDB history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/analytics')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
        >
          View Analytics
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Today's Study"
          value={formatDuration(todayStudySeconds)}
          description="Completed sessions logged today"
          icon={<Clock3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="This Week"
          value={formatDuration(weeklyStudySeconds)}
          description="Study time recorded this week"
          icon={<Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Sessions"
          value={String(completedSessionCount)}
          description="Completed study blocks"
          icon={<BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Total Study"
          value={formatDuration(totalStudySeconds)}
          description="All study time captured in history"
          icon={<Clock3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Timer Controls
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  The timer stays in sync with pause and resume while this page remains open.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                Status: {timerStatus}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Subject
                </span>
                <select
                  value={selectedSubjectId}
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject: Subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Session title
                </span>
                <input
                  value={sessionTitle}
                  onChange={(event) => setSessionTitle(event.target.value)}
                  placeholder="Optional title or focus block name"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </label>
            </div>

            <label className="space-y-1.5 block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Session note
              </span>
              <textarea
                value={sessionNote}
                onChange={(event) => setSessionNote(event.target.value)}
                rows={3}
                placeholder="Optional note for the completed session"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/30 p-6 md:p-8 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-500">
                Elapsed Time
              </div>
              <div className="mt-4 text-5xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {formatDuration(elapsedSeconds)}
              </div>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                {timerStatus === 'running'
                  ? 'Focused study is in progress.'
                  : timerStatus === 'paused'
                    ? 'Timer paused. Resume when you are ready.'
                    : 'Choose a subject and start your next session.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startTimer}
                  disabled={timerStatus !== 'idle' || !selectedSubjectId}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
                <button
                  type="button"
                  onClick={pauseTimer}
                  disabled={timerStatus !== 'running'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button
                  type="button"
                  onClick={resumeTimer}
                  disabled={timerStatus !== 'paused'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
                <button
                  type="button"
                  onClick={stopAndSaveSession}
                  disabled={timerStatus === 'idle' || isSavingSession}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="w-4 h-4" />
                  {isSavingSession ? 'Saving...' : 'Stop & Save'}
                </button>
                <button
                  type="button"
                  onClick={cancelTimer}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Recent Sessions
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Filter by subject, review the history, or delete an entry if needed.
                </p>
              </div>

              <select
                value={historySubjectId}
                onChange={(event) => setHistorySubjectId(event.target.value)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="all">All subjects</option>
                {subjects.map((subject: Subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {sessionsQuery.isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
                <div className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
              </div>
            ) : historySessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Clock3 className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No study sessions yet
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Start a timer session to begin building your study history.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historySessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c] flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-4">
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
                          {session.note || 'No note added for this session.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session)}
                        disabled={deletingSessionId === session.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-500/5 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingSessionId === session.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <span>{formatSessionDate(session.startedAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span>{formatDuration(session.durationSeconds)}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span>{session.status}</span>
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
                Session Snapshot
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                A quick view of the current active session and your latest saved block.
              </p>
            </div>

            {latestSession ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-zinc-900/20 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                      Latest saved session
                    </div>
                    <h3 className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {latestSession.title || 'Study session'}
                    </h3>
                  </div>
                  <Clock3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <div>{latestSession.subjectName || 'Subject'}</div>
                  <div>{formatSessionDate(latestSession.startedAt)}</div>
                  <div>{formatDuration(latestSession.durationSeconds)}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-6 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No saved session yet
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Finish a timer block to store it in your history.
                </p>
              </div>
            )}
          </div>

          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Timer Rules
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                The session will only save after you stop it manually.
              </p>
            </div>

            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• Select a subject before starting a session.</li>
              <li>• Pause and resume preserve elapsed time correctly.</li>
              <li>• Stop and save stores a completed MongoDB session.</li>
              <li>• Reset discards the active timer without saving it.</li>
            </ul>

            {!subjects.length && (
              <button
                type="button"
                onClick={() => navigate('/subjects')}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                Create Your First Subject
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
