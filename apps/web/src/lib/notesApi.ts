import api from './api';
import type { Note, Subject } from '@studyos/types';

export interface NoteInput {
  subjectId?: string | null;
  title: string;
  content: string;
  tags?: string[];
}

export interface NotesListResponse {
  notes: Note[];
  totalCount: number;
}

export const getNotes = async (params?: { q?: string; subjectId?: string; limit?: number; offset?: number }) => {
  const response = await api.get('/notes', {
    params: params || undefined,
  });
  return response.data as NotesListResponse;
};

export const getNote = async (noteId: string) => {
  const response = await api.get(`/notes/${noteId}`);
  return response.data as { note: Note };
};

export const createNote = async (input: NoteInput) => {
  const response = await api.post('/notes', input);
  return response.data as { message: string; note: Note };
};

export const updateNote = async (noteId: string, input: Partial<NoteInput>) => {
  const response = await api.put(`/notes/${noteId}`, input);
  return response.data as { message: string; note: Note };
};

export const deleteNote = async (noteId: string) => {
  const response = await api.delete(`/notes/${noteId}`);
  return response.data as { message: string };
};
