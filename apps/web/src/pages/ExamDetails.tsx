import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  BookOpen,
  GraduationCap,
  Percent,
  Clock,
  CheckSquare,
  BarChart2,
  Lock,
} from 'lucide-react';
import { useExams } from '../contexts/ExamContext';

export const ExamDetails: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { exams } = useExams();

  const exam = exams.find((e) => e.id === examId);

  // If exam doesn't exist, render an error state
  if (!exam) {
    return (
      <div className="space-y-6 animate-fade-in-up font-sans text-left">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-550 tracking-wide">
          <Link to="/exams" className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors">My Exams</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
          <span className="text-zinc-650 dark:text-zinc-300" aria-current="page">Error</span>
        </nav>
        <div className="border border-dashed border-red-200 dark:border-red-950/40 rounded-2xl bg-white dark:bg-[#121215] p-8 md:p-12 flex flex-col items-center justify-center text-center">
          <h3 className="text-base font-bold text-red-655 dark:text-red-400">Exam Track Not Found</h3>
          <p className="mt-2 text-xs text-zinc-500 max-w-sm">
            The exam track you are trying to view does not exist or has been deleted.
          </p>
          <Link
            to="/exams"
            className="mt-6 px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm"
          >
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  // Calculate days remaining
  const getDaysRemainingInfo = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const positiveDays = Math.abs(diffDays);
      return { text: `${positiveDays} day${positiveDays > 1 ? 's' : ''} ago`, isOverdue: true };
    }
    if (diffDays === 0) {
      return { text: 'Today', isOverdue: false };
    }
    return { text: `${diffDays} day${diffDays > 1 ? 's' : ''} left`, isOverdue: false };
  };

  const daysInfo = getDaysRemainingInfo(exam.targetDate);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up font-sans text-left">
      {/* Navigation & Breadcrumbs */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/exams')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 px-2 py-1 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Exams</span>
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-505 tracking-wide">
          <Link to="/dashboard" className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
          <Link to="/exams" className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors">My Exams</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
          <span className="text-zinc-650 dark:text-zinc-300 truncate" aria-current="page">{exam.name}</span>
        </nav>
      </div>

      {/* Hero Overview Header */}
      <header className="relative border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-6 md:p-8 overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/[0.015] via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                {exam.type}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                daysInfo.isOverdue
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                  : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 border-zinc-250 dark:border-zinc-800'
              }`}>
                {daysInfo.text}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              {exam.name}
            </h1>

            {exam.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {exam.description}
              </p>
            )}

            {exam.preparationGoal && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 px-3 py-1.5 rounded-xl max-w-fit">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span><strong>Target:</strong> {exam.preparationGoal}</span>
              </div>
            )}
          </div>

          {/* Date info box */}
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/40 px-4 py-3 rounded-xl self-start">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div className="text-left">
              <span className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-505 block tracking-wider leading-none mb-1">Target Date</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-none">{formatDate(exam.targetDate)}</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar in Hero */}
        <div className="mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold tracking-wide uppercase">
            <span className="text-zinc-500 dark:text-zinc-400">Track Course Coverage</span>
            <span className="text-indigo-650 dark:text-indigo-400">{exam.progressPercentage}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${exam.progressPercentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Placeholders for Future Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Preparation Overview
          </h2>
          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 text-zinc-500 dark:text-zinc-400 font-semibold text-[10px] uppercase tracking-wide">
            Module Previews
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Overall Progress Placeholder */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
              <Lock className="w-2.5 h-2.5" /> Locked
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Overall Progress</h4>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-250">Syllabus breakdown</p>
              </div>
            </div>
            <div className="space-y-2 mt-2 blur-[1.5px] select-none opacity-40">
              <div className="flex justify-between text-xs">
                <span>Completed Topics</span>
                <span className="font-bold">12 / 45</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-850 rounded-full">
                <div className="h-full w-[26%] bg-indigo-500 rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-zinc-400 pt-1">
                <span>15 In Progress</span>
                <span>18 Unstarted</span>
              </div>
            </div>
          </div>

          {/* 2. Subjects Placeholder */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
              <Lock className="w-2.5 h-2.5" /> Locked
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Subjects</h4>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-250">Track list</p>
              </div>
            </div>
            <div className="space-y-2 mt-2 blur-[1.5px] select-none opacity-40">
              <div className="flex items-center justify-between text-xs border-b border-zinc-100 pb-1.5">
                <span>Core Mathematics</span>
                <span className="font-semibold text-indigo-500">45% cover</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-zinc-100 pb-1.5">
                <span>Technical Concepts</span>
                <span className="font-semibold text-indigo-500">20% cover</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>General Aptitude</span>
                <span className="font-semibold text-zinc-400">0% cover</span>
              </div>
            </div>
          </div>

          {/* 3. Syllabus Placeholder */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
              <Lock className="w-2.5 h-2.5" /> Locked
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Syllabus</h4>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-250">Chapters & modules</p>
              </div>
            </div>
            <div className="space-y-2 mt-2 blur-[1.5px] select-none opacity-40 text-xs">
              <div className="flex justify-between items-center text-[10px] bg-zinc-50 p-1.5 rounded">
                <span>Section A: Quantitative</span>
                <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-bold">Done</span>
              </div>
              <div className="flex justify-between items-center text-[10px] bg-zinc-50 p-1.5 rounded">
                <span>Section B: Computer Systems</span>
                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded font-bold">Active</span>
              </div>
            </div>
          </div>

          {/* 4. Study Time Placeholder */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
              <Lock className="w-2.5 h-2.5" /> Locked
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Study Time</h4>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-250">Focus hours metrics</p>
              </div>
            </div>
            <div className="space-y-1 mt-2 blur-[1.5px] select-none opacity-40 text-left">
              <div className="text-xl font-extrabold text-zinc-900">0.0 Hours</div>
              <p className="text-[10px] text-zinc-400">No active focus sessions logged for this track yet.</p>
            </div>
          </div>

          {/* 5. Upcoming Tasks Placeholder */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
              <Lock className="w-2.5 h-2.5" /> Locked
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Upcoming Tasks</h4>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-250">Planner scheduler</p>
              </div>
            </div>
            <div className="space-y-2 mt-2 blur-[1.5px] select-none opacity-40 text-xs">
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled checked className="rounded" />
                <span className="line-through">Create formulas cheat sheet</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled className="rounded" />
                <span>Resolve discrete maths questions</span>
              </div>
            </div>
          </div>

          {/* 6. Recent Tests Placeholder */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800">
              <Lock className="w-2.5 h-2.5" /> Locked
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Recent Tests</h4>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-250">Mock papers & scores</p>
              </div>
            </div>
            <div className="space-y-1.5 mt-2 blur-[1.5px] select-none opacity-40 text-xs">
              <div className="flex justify-between border-b pb-1">
                <span>Mock Paper #01</span>
                <span className="font-bold text-emerald-650">84%</span>
              </div>
              <div className="flex justify-between">
                <span>Weekly Quiz #04</span>
                <span className="font-bold text-indigo-650">72%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
