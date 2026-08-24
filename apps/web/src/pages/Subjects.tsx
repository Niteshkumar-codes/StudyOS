/* eslint-disable no-undef */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Atom,
  BookOpen,
  BrainCircuit,
  Calculator,
  ChevronRight,
  Code2,
  Edit3,
  FlaskConical,
  Languages,
  Plus,
  GraduationCap,
  Palette,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useExams } from '../contexts/ExamContext';
import { StatsCard } from '../components/StatsCard';
import { getLocalDateKey } from '@studyos/utils';
import type { Subject, SyllabusTopic, SyllabusTopicStatus } from '@studyos/types';
import {
  addTopic,
  createSubject,
  deleteSubject,
  deleteTopic,
  getStudySummary,
  updateSubject,
  updateTopic,
} from '../lib/studyApi';

const SUBJECT_ICON_OPTIONS = [
  'BookOpen',
  'Atom',
  'Calculator',
  'FlaskConical',
  'BrainCircuit',
  'Code2',
  'Languages',
  'GraduationCap',
] as const;

type SubjectIconName = (typeof SUBJECT_ICON_OPTIONS)[number];

const SUBJECT_ICON_MAP: Record<SubjectIconName, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Atom,
  Calculator,
  FlaskConical,
  BrainCircuit,
  Code2,
  Languages,
  GraduationCap,
};

const TOPIC_STATUS_OPTIONS: SyllabusTopicStatus[] = ['Not Started', 'In Progress', 'Completed'];

const defaultSubjectForm = {
  name: '',
  description: '',
  examId: '',
  color: '#6366f1',
  icon: 'BookOpen' as SubjectIconName,
};

const defaultTopicForm = {
  title: '',
  status: 'Not Started' as SyllabusTopicStatus,
};

const renderIcon = (iconName?: string, className = 'w-4.5 h-4.5') => {
  const IconComponent =
    iconName && iconName in SUBJECT_ICON_MAP
      ? SUBJECT_ICON_MAP[iconName as SubjectIconName]
      : BookOpen;
  return <IconComponent className={className} />;
};

const statusTone: Record<SyllabusTopicStatus, string> = {
  'Not Started': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-400',
  'In Progress': 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  Completed: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
};

export const Subjects: React.FC = () => {
  const { exams } = useExams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const todayKey = useMemo(() => getLocalDateKey(), []);
  const focusMode = location.pathname.includes('/syllabus');

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState(defaultSubjectForm);
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  const [subjectDeletingId, setSubjectDeletingId] = useState<string | null>(null);

  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicForm, setTopicForm] = useState(defaultTopicForm);
  const [isSavingTopic, setIsSavingTopic] = useState(false);
  const [topicDeletingId, setTopicDeletingId] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: ['study-summary', todayKey],
    queryFn: () => getStudySummary(todayKey),
  });

  const summary = summaryQuery.data;
  const subjects = summary?.subjects ?? [];
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) ?? null;

  useEffect(() => {
    if (subjects.length === 0) {
      setSelectedSubjectId(null);
      return;
    }

    const currentSelectionExists = subjects.some((subject) => subject.id === selectedSubjectId);
    if (!selectedSubjectId || !currentSelectionExists) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    setEditingTopicId(null);
    setTopicForm(defaultTopicForm);
  }, [selectedSubjectId]);

  const invalidateStudySummary = async () => {
    await queryClient.invalidateQueries({ queryKey: ['study-summary', todayKey] });
  };

  const resetSubjectForm = () => {
    setEditingSubjectId(null);
    setSubjectForm(defaultSubjectForm);
  };

  const resetTopicForm = () => {
    setEditingTopicId(null);
    setTopicForm(defaultTopicForm);
  };

  const startSubjectEdit = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectForm({
      name: subject.name,
      description: subject.description || '',
      examId: subject.examId || '',
      color: subject.color || '#6366f1',
      icon: (subject.icon as SubjectIconName) || 'BookOpen',
    });
    setSelectedSubjectId(subject.id);
  };

  const startTopicEdit = (topic: SyllabusTopic) => {
    setEditingTopicId(topic.id);
    setTopicForm({
      title: topic.title,
      status: topic.status,
    });
  };

  const handleSubjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subjectForm.name.trim()) {
      toast.error('Please enter a subject name.');
      return;
    }

    setIsSavingSubject(true);
    try {
      const payload = {
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim() || undefined,
        examId: subjectForm.examId || null,
        color: subjectForm.color || undefined,
        icon: subjectForm.icon || undefined,
      };

      if (editingSubjectId) {
        await updateSubject(editingSubjectId, payload);
        toast.success('Subject updated successfully');
      } else {
        const response = await createSubject(payload);
        toast.success('Subject created successfully');
        setSelectedSubjectId(response.subject.id);
      }

      resetSubjectForm();
      await invalidateStudySummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save subject');
    } finally {
      setIsSavingSubject(false);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!window.confirm(`Delete ${subject.name}? Topics and related planner tasks will be removed.`)) {
      return;
    }

    setSubjectDeletingId(subject.id);
    try {
      await deleteSubject(subject.id);
      toast.success('Subject deleted');
      if (selectedSubjectId === subject.id) {
        setSelectedSubjectId(null);
      }
      if (editingSubjectId === subject.id) {
        resetSubjectForm();
      }
      await invalidateStudySummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    } finally {
      setSubjectDeletingId(null);
    }
  };

  const handleTopicSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSubject) {
      toast.error('Create a subject first to manage topics.');
      return;
    }

    if (!topicForm.title.trim()) {
      toast.error('Please enter a topic title.');
      return;
    }

    setIsSavingTopic(true);
    try {
      const payload = {
        title: topicForm.title.trim(),
        status: topicForm.status,
      };

      if (editingTopicId) {
        await updateTopic(selectedSubject.id, editingTopicId, payload);
        toast.success('Topic updated');
      } else {
        await addTopic(selectedSubject.id, payload);
        toast.success('Topic added');
      }

      resetTopicForm();
      await invalidateStudySummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save topic');
    } finally {
      setIsSavingTopic(false);
    }
  };

  const handleTopicStatusChange = async (topic: SyllabusTopic, status: SyllabusTopicStatus) => {
    if (!selectedSubject) return;

    try {
      await updateTopic(selectedSubject.id, topic.id, { status });
      toast.success('Topic status updated');
      await invalidateStudySummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update topic status');
    }
  };

  const handleDeleteTopic = async (topic: SyllabusTopic) => {
    if (!selectedSubject) return;

    if (!window.confirm(`Delete topic ${topic.title}?`)) {
      return;
    }

    setTopicDeletingId(topic.id);
    try {
      await deleteTopic(selectedSubject.id, topic.id);
      toast.success('Topic deleted');
      if (editingTopicId === topic.id) {
        resetTopicForm();
      }
      await invalidateStudySummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete topic');
    } finally {
      setTopicDeletingId(null);
    }
  };

  const formatExamName = (subject: Subject) => {
    if (!subject.examId) return 'No exam linked';
    return exams.find((exam) => exam.id === subject.examId)?.name || 'Linked exam';
  };

  const totalTopics = summary?.syllabusTotalTopics || 0;
  const completedTopics = summary?.syllabusCompletedTopics || 0;
  const syllabusProgress = summary?.syllabusProgress || 0;

  const loading = summaryQuery.isLoading;
  const error = summaryQuery.error;

  const renderValue = (val: string | number) => {
    return loading ? (
      <span className="inline-block h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-1" />
    ) : (
      String(val)
    );
  };

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
          {focusMode ? 'Syllabus Tracking' : 'Subject Management'}
        </span>
      </nav>

      <div className="border-b border-zinc-200/80 dark:border-zinc-800/60 pb-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 select-none w-fit">
            <Sparkles className="w-3 h-3" />
            Study workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {focusMode ? 'Syllabus Tracking' : 'Subject Management'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Create subjects, organize chapters, and keep your syllabus progress tied to the exam
            tracks you already follow in StudyOS.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              focusMode
                ? 'bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                : 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-950'
            }`}
          >
            Subject Management
          </button>
          <button
            type="button"
            onClick={() => navigate('/syllabus')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              focusMode
                ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-950'
                : 'bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Syllabus Tracking
          </button>
        </div>
      </div>

      <section aria-label="Study overview statistics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Subjects"
          value={renderValue(summary?.subjectCount || 0)}
          description="Managed in your workspace"
          icon={<BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Syllabus Progress"
          value={renderValue(`${syllabusProgress}%`)}
          description="Completed chapters across subjects"
          icon={<GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Topics Completed"
          value={renderValue(`${completedTopics}/${totalTopics}`)}
          description="Syllabus topics checked off"
          icon={<Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Today's Tasks"
          value={renderValue(summary?.todayTaskCount || 0)}
          description="Planner tasks due today"
          icon={<Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50/70 dark:bg-red-950/10 p-4 text-sm text-red-700 dark:text-red-300">
          Failed to load study data. Please try again.
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {editingSubjectId ? 'Edit Subject' : 'Create Subject'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Associate this subject with one of your exam tracks when needed.
                </p>
              </div>
              {editingSubjectId && (
                <button
                  type="button"
                  onClick={resetSubjectForm}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Subject Name
                  </label>
                  <input
                    value={subjectForm.name}
                    onChange={(event) => setSubjectForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Mathematics, Physics, Organic Chemistry"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Description
                  </label>
                  <textarea
                    value={subjectForm.description}
                    onChange={(event) =>
                      setSubjectForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    placeholder="Short description or syllabus notes"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Exam Link
                  </label>
                  <select
                    value={subjectForm.examId}
                    onChange={(event) => setSubjectForm((prev) => ({ ...prev, examId: event.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">No exam selected</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={subjectForm.color}
                    onChange={(event) => setSubjectForm((prev) => ({ ...prev, color: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-1"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Icon
                  </label>
                  <select
                    value={subjectForm.icon}
                    onChange={(event) =>
                      setSubjectForm((prev) => ({ ...prev, icon: event.target.value as SubjectIconName }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {SUBJECT_ICON_OPTIONS.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSavingSubject}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold shadow-sm disabled:opacity-60"
                >
                  {isSavingSubject ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {editingSubjectId ? 'Update Subject' : 'Create Subject'}
                    </>
                  )}
                </button>
                {editingSubjectId && (
                  <button
                    type="button"
                    onClick={resetSubjectForm}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Your Subjects
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Click a subject to manage its syllabus chapters.
                </p>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {subjects.length} total
              </div>
            </div>

            {subjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No subjects yet
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Add your first subject to start tracking chapters and link the subject to an exam.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {subjects.map((subject) => {
                  const examName = formatExamName(subject);
                  const isSelected = subject.id === selectedSubjectId;

                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: subject.color || '#6366f1',
                              backgroundColor: `${subject.color || '#6366f1'}0f`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 text-white shadow-sm"
                            style={{ backgroundColor: subject.color || '#6366f1', borderColor: subject.color || '#6366f1' }}
                          >
                            {renderIcon(subject.icon, 'w-4.5 h-4.5')}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                                {subject.name}
                              </h3>
                              {subject.examId && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                                  Linked
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                              {subject.description || 'No description added yet.'}
                            </p>
                            <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                              {examName}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              startSubjectEdit(subject);
                            }}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800/60"
                            aria-label={`Edit ${subject.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeleteSubject(subject);
                            }}
                            disabled={subjectDeletingId === subject.id}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                            aria-label={`Delete ${subject.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          <span>Progress</span>
                          <span>{subject.progressPercentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${subject.progressPercentage}%`, backgroundColor: subject.color || '#6366f1' }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                          <span>{subject.completedTopics} completed</span>
                          <span>{subject.totalTopics} topics</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Syllabus Tracking
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                  Add chapters, update their progress state, and watch the selected subject move
                  closer to completion.
                </p>
              </div>

              {selectedSubject && (
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Selected Subject
                  </div>
                  <div className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {selectedSubject.name}
                  </div>
                </div>
              )}
            </div>

            {!selectedSubject ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Select a subject to track syllabus topics
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Once you choose a subject, you can add chapters and mark them as not started, in
                  progress, or completed.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                      Topics
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                      {selectedSubject.totalTopics}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                      Completed
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                      {selectedSubject.completedTopics}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                      Progress
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                      {selectedSubject.progressPercentage}%
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
                        {editingTopicId ? 'Edit Topic' : 'Add Topic'}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Keep the chapter list clean and MVP-simple.
                      </p>
                    </div>
                    {editingTopicId && (
                      <button
                        type="button"
                        onClick={resetTopicForm}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleTopicSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Topic Title
                      </label>
                      <input
                        value={topicForm.title}
                        onChange={(event) => setTopicForm((prev) => ({ ...prev, title: event.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="e.g. Polynomial equations, Cell biology, OOP basics"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Status
                      </label>
                      <select
                        value={topicForm.status}
                        onChange={(event) =>
                          setTopicForm((prev) => ({
                            ...prev,
                            status: event.target.value as SyllabusTopicStatus,
                          }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {TOPIC_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingTopic}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold shadow-sm disabled:opacity-60"
                    >
                      {isSavingTopic ? 'Saving...' : editingTopicId ? 'Update Topic' : 'Add Topic'}
                    </button>
                  </form>
                </div>

                <div className="space-y-3">
                  {selectedSubject.topics.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        No topics added yet
                      </h4>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Add your first chapter to start tracking progress.
                      </p>
                    </div>
                  ) : (
                    selectedSubject.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-[#18181c]"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                                {topic.title}
                              </h4>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusTone[topic.status]}`}
                              >
                                {topic.status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              Last updated {new Date(topic.updatedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={topic.status}
                              onChange={(event) =>
                                void handleTopicStatusChange(
                                  topic,
                                  event.target.value as SyllabusTopicStatus,
                                )
                              }
                              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                            >
                              {TOPIC_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => startTopicEdit(topic)}
                              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                              aria-label={`Edit ${topic.title}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteTopic(topic)}
                              disabled={topicDeletingId === topic.id}
                              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                              aria-label={`Delete ${topic.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};