/* eslint-disable no-undef */
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Exam {
  id: string;
  name: string;
  type: string;
  targetDate: string;
  description?: string;
  preparationGoal?: string;
  progressPercentage: number;
  subjectCount: number;
  createdAt: string;
}

interface ExamContextType {
  exams: Exam[];
  addExam: (
    examData: Omit<Exam, 'id' | 'createdAt' | 'progressPercentage' | 'subjectCount'> & {
      progressPercentage?: number;
      subjectCount?: number;
    }
  ) => void;
  updateExam: (id: string, examData: Partial<Omit<Exam, 'id' | 'createdAt'>>) => void;
  deleteExam: (id: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('studyos_exams');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('studyos_exams', JSON.stringify(exams));
  }, [exams]);

  const addExam = (
    examData: Omit<Exam, 'id' | 'createdAt' | 'progressPercentage' | 'subjectCount'> & {
      progressPercentage?: number;
      subjectCount?: number;
    }
  ) => {
    const newExam: Exam = {
      ...examData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9),
      progressPercentage: examData.progressPercentage ?? 0,
      subjectCount: examData.subjectCount ?? 0,
      createdAt: new Date().toISOString(),
    };
    setExams((prev) => [newExam, ...prev]);
  };

  const updateExam = (id: string, examData: Partial<Omit<Exam, 'id' | 'createdAt'>>) => {
    setExams((prev) =>
      prev.map((exam) => (exam.id === id ? { ...exam, ...examData } : exam))
    );
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((exam) => exam.id !== id));
  };

  return (
    <ExamContext.Provider value={{ exams, addExam, updateExam, deleteExam }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExams = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExams must be used within an ExamProvider');
  }
  return context;
};
