import api from './api';
import type {
  StudyAnalyticsResponse,
  StudyDashboardSummary,
  StudySession,
  StudyTask,
  StudyTaskStatus,
  Subject,
  SyllabusTopicStatus,
} from '@studyos/types';

export interface SubjectInput {
  name: string;
  description?: string;
  examId?: string | null;
  color?: string;
  icon?: string;
}

export interface TopicInput {
  title: string;
  status?: SyllabusTopicStatus;
}

export interface TaskInput {
  subjectId?: string | null;
  title: string;
  description?: string | null;
  scheduledDate: string;
  durationMinutes: number;
  status?: StudyTaskStatus;
}

export interface StudySessionInput {
  subjectId: string;
  title?: string | null;
  note?: string | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export interface StudySessionsResponse {
  sessions: StudySession[];
  totalCount: number;
  totalStudySeconds: number;
  todayStudySeconds: number;
  weeklyStudySeconds: number;
}

export const getStudySummary = async (date?: string) => {
  const response = await api.get('/study/summary', {
    params: date ? { date } : undefined,
  });
  return response.data as StudyDashboardSummary;
};

export const createSubject = async (input: SubjectInput) => {
  const response = await api.post('/study/subjects', input);
  return response.data as { message: string; subject: Subject };
};

export const updateSubject = async (subjectId: string, input: Partial<SubjectInput>) => {
  const response = await api.put(`/study/subjects/${subjectId}`, input);
  return response.data as { message: string; subject: Subject };
};

export const deleteSubject = async (subjectId: string) => {
  const response = await api.delete(`/study/subjects/${subjectId}`);
  return response.data as { message: string };
};

export const addTopic = async (subjectId: string, input: TopicInput) => {
  const response = await api.post(`/study/subjects/${subjectId}/topics`, input);
  return response.data as { message: string; topic: { id: string }; subject: Subject };
};

export const updateTopic = async (
  subjectId: string,
  topicId: string,
  input: Partial<TopicInput>,
) => {
  const response = await api.put(`/study/subjects/${subjectId}/topics/${topicId}`, input);
  return response.data as { message: string; topic: { id: string }; subject: Subject };
};

export const deleteTopic = async (subjectId: string, topicId: string) => {
  const response = await api.delete(`/study/subjects/${subjectId}/topics/${topicId}`);
  return response.data as { message: string; subject: Subject };
};

export const createTask = async (input: TaskInput) => {
  const response = await api.post('/study/tasks', input);
  return response.data as { message: string; task: StudyTask };
};

export const updateTask = async (taskId: string, input: Partial<TaskInput>) => {
  const response = await api.put(`/study/tasks/${taskId}`, input);
  return response.data as { message: string; task: StudyTask };
};

export const deleteTask = async (taskId: string) => {
  const response = await api.delete(`/study/tasks/${taskId}`);
  return response.data as { message: string };
};

export const getStudySessions = async (params?: { subjectId?: string; limit?: number; offset?: number }) => {
  const response = await api.get('/study/sessions', {
    params: params || undefined,
  });
  return response.data as StudySessionsResponse;
};

export const createStudySession = async (input: StudySessionInput) => {
  const response = await api.post('/study/sessions', input);
  return response.data as { message: string; session: StudySession };
};

export const deleteStudySession = async (sessionId: string) => {
  const response = await api.delete(`/study/sessions/${sessionId}`);
  return response.data as { message: string };
};

export const getStudyAnalytics = async (days = 7) => {
  const response = await api.get('/study/analytics', {
    params: { days },
  });
  return response.data as StudyAnalyticsResponse;
};