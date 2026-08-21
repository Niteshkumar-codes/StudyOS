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

export type SyllabusTopicStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface SyllabusTopic {
  id: string;
  title: string;
  status: SyllabusTopicStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  examId?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  topics: SyllabusTopic[];
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export type StudyTaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface StudyTask {
  id: string;
  subjectId?: string;
  subjectName?: string;
  subjectColor?: string;
  title: string;
  description?: string;
  scheduledDate: string;
  durationMinutes: number;
  status: StudyTaskStatus;
  createdAt: string;
  updatedAt: string;
}

export type Topic = SyllabusTopic;

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

export type PlannerTask = StudyTask;

export interface StudyDashboardSummary {
  subjectCount: number;
  totalTaskCount: number;
  todayTaskCount: number;
  todayPendingTasks: number;
  todayCompletedTasks: number;
  syllabusProgress: number;
  syllabusCompletedTopics: number;
  syllabusTotalTopics: number;
  subjects: Subject[];
  todayTasks: StudyTask[];
  tasks: StudyTask[];
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
