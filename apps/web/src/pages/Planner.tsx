/* eslint-disable no-undef */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  Filter,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StatsCard } from '../components/StatsCard';
import { getLocalDateKey, formatDuration } from '@studyos/utils';
import type { StudyTask, StudyTaskStatus } from '@studyos/types';
import { createTask, deleteTask, getStudySummary, updateTask } from '../lib/studyApi';

type TaskFilter = 'today' | 'upcoming' | 'completed' | 'all';

const TASK_STATUS_OPTIONS: StudyTaskStatus[] = ['Pending', 'In Progress', 'Completed'];

const defaultTaskForm = (scheduledDate: string) => ({
  subjectId: '',
  title: '',
  description: '',
  scheduledDate,
  durationMinutes: 30,
  status: 'Pending' as StudyTaskStatus,
});

const statusTone: Record<StudyTaskStatus, string> = {
  Pending: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-400',
  'In Progress': 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  Completed: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
};

const formatDateLabel = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

export const Planner: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const todayKey = useMemo(() => getLocalDateKey(), []);

  const [filter, setFilter] = useState<TaskFilter>('today');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState(() => defaultTaskForm(todayKey));
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskDeletingId, setTaskDeletingId] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: ['study-summary', todayKey],
    queryFn: () => getStudySummary(todayKey),
  });

  const summary = summaryQuery.data;
  const subjects = summary?.subjects ?? [];
  const tasks = summary?.tasks ?? [];
  const todayTasks = summary?.todayTasks ?? tasks.filter((task) => task.scheduledDate === todayKey);

  useEffect(() => {
    if (editingTaskId) return;
    setTaskForm(defaultTaskForm(todayKey));
  }, [todayKey, editingTaskId]);

  const invalidateStudySummary = async () => {
    await queryClient.invalidateQueries({ queryKey: ['study-summary', todayKey] });
  };

  const resetTaskForm = () => {
    setEditingTaskId(null);
    setTaskForm(defaultTaskForm(todayKey));
  };

  const startTaskEdit = (task: StudyTask) => {
    setEditingTaskId(task.id);
    setTaskForm({
      subjectId: task.subjectId || '',
      title: task.title,
      description: task.description || '',
      scheduledDate: task.scheduledDate,
      durationMinutes: task.durationMinutes,
      status: task.status,
    });
  };

  const handleTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      toast.error('Please enter a task title.');
      return;
    }

    setIsSavingTask(true);
    try {
      const payload = {
        subjectId: taskForm.subjectId || null,
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        scheduledDate: taskForm.scheduledDate,
        durationMinutes: Number(taskForm.durationMinutes),
        status: taskForm.status,
      };

      if (editingTaskId) {
        await updateTask(editingTaskId, payload);
        toast.success('Task updated successfully');
      } else {
        await createTask(payload);
        toast.success('Task created successfully');
      }

      resetTaskForm();
      await invalidateStudySummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleDeleteTask = async (task: StudyTask) => {
    if (!window.confirm(`Delete task ${task.title}?`)) {
      return;
    }

    setTaskDeletingId(task.id);
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      if (editingTaskId === task.id) {
        resetTaskForm();
      }
      await invalidateStudySummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setTaskDeletingId(null);
    }
  };

  const handleTaskStatusChange = async (task: StudyTask, status: StudyTaskStatus) => {
    try {
      await updateTask(task.id, { status });
      toast.success('Task status updated');
      await invalidateStudySummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const filteredTasks = useMemo(() => {
    if (filter === 'today') return todayTasks;
    if (filter === 'completed') return tasks.filter((task) => task.status === 'Completed');
    if (filter === 'upcoming') {
      return tasks.filter((task) => task.scheduledDate > todayKey && task.status !== 'Completed');
    }
    return tasks;
  }, [filter, tasks, todayKey, todayTasks]);

  const totalStudyMinutes = tasks.reduce((total, task) => total + task.durationMinutes, 0);
  const todayCompleted = todayTasks.filter((task) => task.status === 'Completed').length;
  const todayPending = todayTasks.filter((task) => task.status !== 'Completed').length;

  const loading = summaryQuery.isLoading;
  const error = summaryQuery.error;

  return (
    <div className="space-y-6 animate-fade-in-up font-sans text-left">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide"
      >
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors"
        >
          Dashboard
        </button>
        <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-650 dark:text-zinc-300" aria-current="page">
          Daily Study Planner
        </span>
      </nav>

      <div className="border-b border-zinc-200/80 dark:border-zinc-800/60 pb-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 select-none w-fit">
            <Sparkles className="w-3 h-3" />
            Daily planner
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Daily Study Planner
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Plan what to study today, keep a small queue of upcoming sessions, and update task
            status without leaving StudyOS.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/subjects')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
        >
          Manage Subjects
        </button>
      </div>

      <section aria-label="Planner statistics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Today's Tasks"
          value={loading ? '...' : String(todayTasks.length)}
          description="Scheduled for the current day"
          icon={<CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Pending Today"
          value={loading ? '...' : String(todayPending)}
          description="Tasks still to finish"
          icon={<Clock3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Completed Today"
          value={loading ? '...' : String(todayCompleted)}
          description="Tasks marked complete"
          icon={<CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Study Minutes"
          value={loading ? '...' : formatDuration(totalStudyMinutes * 60)}
          description="Planned across all tasks"
          icon={<Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50/70 dark:bg-red-950/10 p-4 text-sm text-red-700 dark:text-red-300">
          Failed to load planner data. Please try again.
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {editingTaskId ? 'Edit Task' : 'Create Task'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Build a daily study plan from your subjects.
                </p>
              </div>
              {editingTaskId && (
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Task Title
                  </label>
                  <input
                    value={taskForm.title}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Revise electrostatics, Practice SQL joins"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    placeholder="Optional notes or a short task goal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Subject
                  </label>
                  <select
                    value={taskForm.subjectId}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, subjectId: event.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">No subject selected</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.scheduledDate}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, scheduledDate: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={720}
                    value={taskForm.durationMinutes}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, durationMinutes: Number(event.target.value) }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(event) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        status: event.target.value as StudyTaskStatus,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {TASK_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSavingTask}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold shadow-sm disabled:opacity-60"
                >
                  {isSavingTask ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {editingTaskId ? 'Update Task' : 'Create Task'}
                    </>
                  )}
                </button>
                {editingTaskId && (
                  <button
                    type="button"
                    onClick={resetTaskForm}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Today's Tasks
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Quick view of what you planned for today.
                </p>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {formatDateLabel(todayKey)}
              </div>
            </div>

            {todayTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No tasks scheduled for today
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Add a task above to start filling today’s study queue.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-[#18181c]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                            {task.title}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusTone[task.status]}`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {task.description || 'No description added.'}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          <span>{task.subjectName || 'No subject linked'}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                          <span>{formatDuration(task.durationMinutes * 60)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={task.status}
                          onChange={(event) =>
                            void handleTaskStatusChange(task, event.target.value as StudyTaskStatus)
                          }
                          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                        >
                          {TASK_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => startTaskEdit(task)}
                          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                          aria-label={`Edit ${task.title}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteTask(task)}
                          disabled={taskDeletingId === task.id}
                          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Planner View
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Switch between today, upcoming, completed, or the full queue.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['today', 'upcoming', 'completed', 'all'] as TaskFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border capitalize ${
                    filter === option
                      ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-950'
                      : 'bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No tasks found for this filter
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Switch the view or add a new task to fill the planner.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-[#18181c]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                            {task.title}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusTone[task.status]}`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {task.description || 'No description added.'}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          <span>{task.subjectName || 'No subject linked'}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                          <span>{formatDateLabel(task.scheduledDate)}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                          <span>{formatDuration(task.durationMinutes * 60)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={task.status}
                          onChange={(event) =>
                            void handleTaskStatusChange(task, event.target.value as StudyTaskStatus)
                          }
                          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                        >
                          {TASK_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => startTaskEdit(task)}
                          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                          aria-label={`Edit ${task.title}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteTask(task)}
                          disabled={taskDeletingId === task.id}
                          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};