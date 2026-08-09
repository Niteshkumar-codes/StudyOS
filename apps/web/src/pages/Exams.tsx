import React, { useState } from 'react';
import { ChevronRight, GraduationCap, Plus, BookOpen, Sparkles } from 'lucide-react';
import { useExams } from '../contexts/ExamContext';
import { ExamCard } from '../components/ExamCard';
import { CreateExamDialog } from '../components/CreateExamDialog';
import toast from 'react-hot-toast';

export const Exams: React.FC = () => {
  const { exams, deleteExam } = useExams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editExamId, setEditExamId] = useState<string | null>(null);

  const handleCreateClick = () => {
    setEditExamId(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (id: string) => {
    setEditExamId(id);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const examToDelete = exams.find((e) => e.id === id);
    if (
      examToDelete &&
      window.confirm(`Are you sure you want to delete the exam track "${examToDelete.name}"?`)
    ) {
      deleteExam(id);
      toast.success('Exam track deleted.');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditExamId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-505 tracking-wide text-left"
      >
        <span className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer">
          Dashboard
        </span>
        <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-650 dark:text-zinc-300" aria-current="page">
          My Exams
        </span>
      </nav>

      {/* Header Container */}
      <div className="border-b border-zinc-200/80 dark:border-zinc-800/60 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            My Exams
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
            Manage every preparation track from one place.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleCreateClick}
          className="sm:self-end inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-offset-zinc-950 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-100 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Main Content Area */}
      {exams.length === 0 ? (
        /* Empty State Layout */
        <div className="relative border border-dashed border-zinc-200 dark:border-zinc-800/85 rounded-2xl bg-white dark:bg-[#121215] p-8 md:p-12 flex flex-col items-center justify-center text-center overflow-hidden min-h-[380px]">
          {/* Light flare indicator background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none" />

          {/* Quick info tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 mb-6 animate-pulse select-none">
            <Sparkles className="w-3 h-3" />
            Get Started
          </div>

          {/* Icon frame */}
          <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-4 shadow-sm">
            <GraduationCap className="w-5 h-5 text-zinc-500 dark:text-indigo-400" />
          </div>

          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            No exam tracks added yet
          </h3>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500 max-w-sm leading-relaxed">
            Create your first preparation track to start organizing your syllabus, planner and progress.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreateClick}
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Create Your First Exam
            </button>
          </div>
        </div>
      ) : (
        /* Exams Grid Layout (Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="h-full">
              <ExamCard exam={exam} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <CreateExamDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        editExamId={editExamId}
      />
    </div>
  );
};
