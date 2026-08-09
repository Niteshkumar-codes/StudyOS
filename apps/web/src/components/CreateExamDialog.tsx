/* eslint-disable no-undef */
import React, { useEffect, useState, useRef } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { useExams, Exam } from '../contexts/ExamContext';
import toast from 'react-hot-toast';

interface CreateExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editExamId?: string | null;
}

const EXAM_TYPES = [
  'GATE',
  'Placement',
  'College / University',
  'Competitive Exam',
  'Certification',
  'Other',
];

export const CreateExamDialog: React.FC<CreateExamDialogProps> = ({
  isOpen,
  onClose,
  editExamId,
}) => {
  const { exams, addExam, updateExam } = useExams();
  const editingExam = editExamId ? exams.find((e) => e.id === editExamId) : null;

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('GATE');
  const [customType, setCustomType] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [preparationGoal, setPreparationGoal] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ref for focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Load editing exam values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingExam) {
        setName(editingExam.name);
        if (EXAM_TYPES.includes(editingExam.type)) {
          setType(editingExam.type);
          setCustomType('');
        } else {
          setType('Other');
          setCustomType(editingExam.type);
        }
        // Format target date to YYYY-MM-DD
        const d = new Date(editingExam.targetDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setTargetDate(`${yyyy}-${mm}-${dd}`);
        setDescription(editingExam.description || '');
        setPreparationGoal(editingExam.preparationGoal || '');
        setProgressPercentage(editingExam.progressPercentage);
        setSubjectCount(editingExam.subjectCount);
      } else {
        // Reset to defaults for new exam
        setName('');
        setType('GATE');
        setCustomType('');
        setTargetDate('');
        setDescription('');
        setPreparationGoal('');
        setProgressPercentage(0);
        setSubjectCount(0);
      }
      setErrors({});

      // Set focus to the first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editingExam]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Exam Name is required';
    } else if (name.length > 50) {
      newErrors.name = 'Exam Name must be under 50 characters';
    }

    if (!type) {
      newErrors.type = 'Exam Type is required';
    }

    if (type === 'Other' && !customType.trim()) {
      newErrors.customType = 'Custom Exam Type is required';
    }

    if (!targetDate) {
      newErrors.targetDate = 'Target Date is required';
    } else {
      const parsedDate = new Date(targetDate);
      if (isNaN(parsedDate.getTime())) {
        newErrors.targetDate = 'Please select a valid date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    const finalType = type === 'Other' ? customType.trim() : type;

    if (editingExam) {
      updateExam(editingExam.id, {
        name: name.trim(),
        type: finalType,
        targetDate: new Date(targetDate).toISOString(),
        description: description.trim() || undefined,
        preparationGoal: preparationGoal.trim() || undefined,
        progressPercentage,
        subjectCount,
      });
      toast.success('Exam track updated successfully!');
    } else {
      addExam({
        name: name.trim(),
        type: finalType,
        targetDate: new Date(targetDate).toISOString(),
        description: description.trim() || undefined,
        preparationGoal: preparationGoal.trim() || undefined,
        progressPercentage,
        subjectCount,
      });
      toast.success('New exam track created successfully!');
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl w-full max-w-lg max-h-[90vh] md:max-h-[85vh] shadow-2xl overflow-y-auto animate-scale-up text-left flex flex-col focus-visible:outline-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/60 shrink-0">
          <h2
            id="dialog-title"
            className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight"
          >
            {editingExam ? 'Edit Exam Track' : 'Create Exam Track'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Exam Name */}
          <div>
            <label
              htmlFor="exam-name"
              className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
            >
              Exam Name <span className="text-red-500">*</span>
            </label>
            <input
              id="exam-name"
              ref={firstInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 ${
                errors.name
                  ? 'border-red-500 dark:border-red-900/50 focus:border-red-500'
                  : 'border-zinc-200 dark:border-zinc-800/80'
              }`}
              placeholder="e.g. GATE 2027, Fall Semesters"
            />
            {errors.name && (
              <p
                id="name-error"
                role="alert"
                className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-fade-in"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Exam Type & Custom Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Exam Type Dropdown */}
            <div>
              <label
                htmlFor="exam-type"
                className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
              >
                Exam Type <span className="text-red-500">*</span>
              </label>
              <select
                id="exam-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-sm bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Date */}
            <div>
              <label
                htmlFor="target-date"
                className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
              >
                Target Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  aria-invalid={!!errors.targetDate}
                  aria-describedby={errors.targetDate ? 'date-error' : undefined}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 ${
                    errors.targetDate
                      ? 'border-red-500 dark:border-red-900/50 focus:border-red-500'
                      : 'border-zinc-200 dark:border-zinc-800/80'
                  }`}
                />
              </div>
              {errors.targetDate && (
                <p
                  id="date-error"
                  role="alert"
                  className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-fade-in"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.targetDate}
                </p>
              )}
            </div>
          </div>

          {/* Conditional Custom Type Input */}
          {type === 'Other' && (
            <div className="animate-fade-in">
              <label
                htmlFor="custom-type"
                className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
              >
                Enter Exam Type <span className="text-red-500">*</span>
              </label>
              <input
                id="custom-type"
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                aria-invalid={!!errors.customType}
                aria-describedby={errors.customType ? 'custom-type-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 ${
                  errors.customType
                    ? 'border-red-500 dark:border-red-900/50 focus:border-red-500'
                    : 'border-zinc-200 dark:border-zinc-800/80'
                }`}
                placeholder="e.g. TOEFL, UPSC CSE, SAT"
              />
              {errors.customType && (
                <p
                  id="custom-type-error"
                  role="alert"
                  className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-fade-in"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.customType}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
            >
              Description <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-sm bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none"
              placeholder="Give a brief summary of what this track is about."
            />
          </div>

          {/* Preparation Goal */}
          <div>
            <label
              htmlFor="prep-goal"
              className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
            >
              Preparation Goal <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="prep-goal"
              value={preparationGoal}
              onChange={(e) => setPreparationGoal(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-sm bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none"
              placeholder="e.g. Secure a rank in Top 100, Complete syllabus by December"
            />
          </div>

          {/* Edit-only fields (Progress & Subject count) */}
          {editingExam && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 space-y-4">
              <span className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider block">
                Progress & Scale Settings
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="subject-count"
                    className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
                  >
                    Subjects
                  </label>
                  <input
                    id="subject-count"
                    type="number"
                    min="0"
                    max="100"
                    value={subjectCount}
                    onChange={(e) => setSubjectCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-sm bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="progress-range"
                    className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
                  >
                    Progress ({progressPercentage}%)
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="progress-range"
                      type="range"
                      min="0"
                      max="100"
                      value={progressPercentage}
                      onChange={(e) => setProgressPercentage(parseInt(e.target.value) || 0)}
                      className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-[#1c1c24] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {editingExam ? 'Save Changes' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
