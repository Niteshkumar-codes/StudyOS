export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streakCount: number;
  lastStudyDate?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  userId: string;
  name: string;
  targetDate: string;
  isCustom: boolean;
  dailyTargetMinutes: number;
  createdAt: string;
}

export interface Subject {
  id: string;
  examId: string;
  name: string;
  weightage: number;
  color: string;
  createdAt: string;
}

export type TopicDifficulty = 'Easy' | 'Medium' | 'Hard';
export type TopicImportance = 'Low' | 'Medium' | 'High';
export type TopicStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Mastered';

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  difficulty: TopicDifficulty;
  importance: TopicImportance;
  status: TopicStatus;
  revisionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: string;
  type: 'Pomodoro' | 'Stopwatch';
  linkedTopicId?: string;
  status: 'Active' | 'Completed' | 'Aborted';
}

export interface StudyLog {
  id: string;
  userId: string;
  topicId: string;
  durationSeconds: number;
  focusRating: number;
  sessionNote?: string;
  timestamp: string;
}

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface PlannerTask {
  id: string;
  userId: string;
  topicId?: string;
  title: string;
  startTime: string;
  endTime: string;
  priority: TaskPriority;
  isCompleted: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  topicId?: string;
  title: string;
  content: string;
  interlinkedNoteIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'Reminder' | 'System' | 'Achievement';
  message: string;
  isRead: boolean;
  triggerTime: string;
}

export interface RevisionCard {
  id: string;
  userId: string;
  topicId: string;
  noteId?: string;
  repetitionNumber: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
}

export interface MockTestSection {
  name: string;
  marks: number;
  incorrectCount: number;
}

export interface MockTest {
  id: string;
  userId: string;
  examId: string;
  title: string;
  marksObtained: number;
  totalMarks: number;
  durationMinutes: number;
  sectionsBreakdown: MockTestSection[];
  dateAttempted: string;
}

export interface Settings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  dailyTargetHours: number;
  emailDigestEnabled: boolean;
  pushNotificationsEnabled: boolean;
}
