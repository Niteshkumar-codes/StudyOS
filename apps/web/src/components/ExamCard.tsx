/* eslint-disable no-undef */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Calendar,
  BookOpen,
  Target,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Exam } from '../contexts/ExamContext';

interface ExamCardProps {
  exam: Exam;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      return {
        text: `${positiveDays} day${positiveDays > 1 ? 's' : ''} ago`,
        isOverdue: true,
      };
    }
    if (diffDays === 0) {
      return {
        text: 'Today',
        isOverdue: false,
      };
    }
    return {
      text: `${diffDays} day${diffDays > 1 ? 's' : ''} left`,
      isOverdue: false,
    };
  };

  const daysInfo = getDaysRemainingInfo(exam.targetDate);

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOpen = () => {
    navigate(`/exams/${exam.id}`);
  };

  return (
    <div
      role="article"
      aria-label={`Exam track for ${exam.name}`}
      className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full select-none"
    >
      {/* Upper Section */}
      <div className="space-y-4">
        {/* Title and Action Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 mb-1.5">
              {exam.type}
            </span>
            <h3
              onClick={handleOpen}
              className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            >
              {exam.name}
            </h3>
          </div>

          {/* More Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              aria-label="More actions"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-55 dark:hover:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-36 rounded-xl bg-white dark:bg-[#18181c] border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg py-1.5 z-10 animate-fade-in text-left focus:outline-none"
                role="menu"
                aria-orientation="vertical"
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(exam.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  role="menuitem"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Track
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(exam.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-650 dark:text-red-450 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
                  role="menuitem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Track
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description / Prep Goal */}
        {exam.preparationGoal ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed flex items-start gap-1.5">
            <Target className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-550 shrink-0 mt-0.5" />
            <span>Goal: {exam.preparationGoal}</span>
          </p>
        ) : (
          exam.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {exam.description}
            </p>
          )
        )}

        {/* Date & Countdown Info */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-450">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{formatDate(exam.targetDate)}</span>
          </div>

          <span
            className={`font-semibold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide ${
              daysInfo.isOverdue
                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-900/30'
                : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-650 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-800/40'
            }`}
          >
            {daysInfo.text}
          </span>
        </div>
      </div>

      {/* Lower Section (Progress and Open Button) */}
      <div className="mt-5 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-4">
        {/* Progress & Subject Info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wide uppercase">
            <span className="text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>{exam.subjectCount} Subject{exam.subjectCount !== 1 ? 's' : ''}</span>
            </span>
            <span className="text-indigo-650 dark:text-indigo-400">
              {exam.progressPercentage}% Cover
            </span>
          </div>

          {/* Progress Bar container */}
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${exam.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOpen}
          className="w-full py-2 bg-zinc-50 dark:bg-zinc-900/55 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800/80 transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <span>Open Exam</span>
          <ExternalLink className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
        </button>
      </div>
    </div>
  );
};
