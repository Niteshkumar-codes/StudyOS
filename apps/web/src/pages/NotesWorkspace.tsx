import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronRight,
  Edit3,
  FolderOpen,
  Plus,
  Search,
  Tag,
  Trash2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getLocalDateKey } from '@studyos/utils';
import { StatsCard } from '../components/StatsCard';
import { createNote, deleteNote, getNote, getNotes, updateNote } from '../lib/notesApi';
import { getStudySummary } from '../lib/studyApi';
import type { Note, Subject } from '@studyos/types';

const splitTags = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);

const snippet = (content: string) =>
  content.length > 180 ? `${content.slice(0, 180).trim()}...` : content;

export const NotesWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const todayKey = useMemo(() => getLocalDateKey(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: ['study-summary', todayKey],
    queryFn: () => getStudySummary(todayKey),
  });

  const subjects = summaryQuery.data?.subjects ?? [];

  const notesQuery = useQuery({
    queryKey: ['notes', searchTerm, subjectFilter],
    queryFn: () =>
      getNotes({
        q: searchTerm.trim() || undefined,
        subjectId: subjectFilter === 'all' ? undefined : subjectFilter,
        limit: 100,
      }),
  });

  const notes = notesQuery.data?.notes ?? [];

  const selectedNoteQuery = useQuery({
    queryKey: ['note', selectedNoteId],
    queryFn: () => getNote(selectedNoteId as string),
    enabled: !!selectedNoteId,
  });

  const selectedNote = selectedNoteQuery.data?.note ?? null;

  useEffect(() => {
    if (isDraftMode || selectedNoteId || notes.length === 0) {
      return;
    }

    setSelectedNoteId(notes[0].id);
  }, [isDraftMode, notes, selectedNoteId]);

  useEffect(() => {
    if (!selectedNote) {
      if (isDraftMode || selectedNoteId === null) {
        return;
      }
      return;
    }

    setIsDraftMode(false);
    setTitle(selectedNote.title);
    setContent(selectedNote.content);
    setSubjectId(selectedNote.subjectId || '');
    setTagsText((selectedNote.tags || []).join(', '));
  }, [selectedNote, selectedNoteId, isDraftMode]);

  useEffect(() => {
    if (summaryQuery.data?.subjects && subjectId && !subjects.some((subject) => subject.id === subjectId)) {
      setSubjectId('');
    }
  }, [subjectId, subjects, summaryQuery.data?.subjects]);

  const resetEditor = () => {
    setIsDraftMode(true);
    setSelectedNoteId(null);
    setTitle('');
    setContent('');
    setSubjectId('');
    setTagsText('');
  };

  const openNote = (note: Note) => {
    setIsDraftMode(false);
    setSelectedNoteId(note.id);
  };

  const invalidateNotes = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['notes'] }),
      queryClient.invalidateQueries({ queryKey: ['study-summary', todayKey] }),
    ]);
  };

  const handleSaveNote = async () => {
    if (!title.trim()) {
      toast.error('Please add a note title.');
      return;
    }

    if (!content.trim()) {
      toast.error('Please add note content.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        subjectId: subjectId || null,
        title: title.trim(),
        content: content.trim(),
        tags: splitTags(tagsText),
      };

      if (selectedNoteId) {
        const response = await updateNote(selectedNoteId, payload);
        toast.success('Note updated successfully');
        setSelectedNoteId(response.note.id);
        queryClient.setQueryData(['note', response.note.id], { note: response.note });
      } else {
        const response = await createNote(payload);
        toast.success('Note created successfully');
        setSelectedNoteId(response.note.id);
        queryClient.setQueryData(['note', response.note.id], { note: response.note });
      }

      setIsDraftMode(false);
      await invalidateNotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    if (!window.confirm(`Delete note "${note.title}"?`)) {
      return;
    }

    setDeletingNoteId(note.id);
    try {
      await deleteNote(note.id);
      toast.success('Note deleted');
      if (selectedNoteId === note.id) {
        resetEditor();
      }
      await invalidateNotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const noteCount = summaryQuery.data?.noteCount ?? notesQuery.data?.totalCount ?? 0;
  const recentNotes = summaryQuery.data?.recentNotes ?? notes.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in-up font-sans text-left">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide">
        <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors">
          Dashboard
        </button>
        <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-650 dark:text-zinc-300" aria-current="page">
          Notes Workspace
        </span>
      </nav>

      <div className="border-b border-zinc-200/80 dark:border-zinc-800/60 pb-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 select-none w-fit">
            <Sparkles className="w-3 h-3" />
            Notes workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Notes Workspace
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Capture, search, organize, and edit study notes with real MongoDB storage.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetEditor}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border bg-white dark:bg-[#121215] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            Create Note
          </button>
          <button
            type="button"
            onClick={() => navigate('/subjects')}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-950"
          >
            Manage Subjects
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatsCard
          title="Total Notes"
          value={notesQuery.isLoading ? '...' : String(noteCount)}
          description="Saved in your workspace"
          icon={<BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Filtered Notes"
          value={notesQuery.isLoading ? '...' : String(notes.length)}
          description="Matches the current search and subject filter"
          icon={<Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <StatsCard
          title="Subjects"
          value={summaryQuery.isLoading ? '...' : String(subjects.length)}
          description="Available to link with notes"
          icon={<FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Notes Library
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Search by title or content and filter by subject.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Search</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search notes by title or content"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] pl-10 pr-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Subject Filter</span>
                <select
                  value={subjectFilter}
                  onChange={(event) => setSubjectFilter(event.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="all">All subjects</option>
                  {subjects.map((subject: Subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {notesQuery.isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
                <div className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
              </div>
            ) : notesQuery.error ? (
              <div className="rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50/70 dark:bg-red-950/10 p-4 text-sm text-red-700 dark:text-red-300">
                Failed to load notes. Please try again.
              </div>
            ) : notes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#1c1c24] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No notes found
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Create your first note or widen the current search.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                {notes.map((note) => {
                  const isActive = note.id === selectedNoteId;
                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => openNote(note)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${
                        isActive
                          ? 'border-indigo-500/40 bg-indigo-50/60 dark:bg-indigo-950/20 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-[#18181c] hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                            {note.title}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                            {snippet(note.content)}
                          </p>
                        </div>
                        <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        <span>{note.subjectName || 'No subject'}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>

                      {note.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Recently Updated
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                The latest updated notes are shown here for quick access.
              </p>
            </div>

            <div className="space-y-3">
              {recentNotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-6 text-center bg-zinc-50/50 dark:bg-zinc-900/20 text-sm text-zinc-500 dark:text-zinc-400">
                  No recent notes yet.
                </div>
              ) : (
                recentNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => openNote(note)}
                    className="w-full text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-[#18181c] hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                          {note.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {note.subjectName || 'No subject'}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {selectedNoteId ? 'Edit Note' : 'Create Note'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Clean textarea editing for fast study capture.
                </p>
              </div>

              {selectedNoteId && (
                <button
                  type="button"
                  onClick={() => selectedNote && handleDeleteNote(selectedNote)}
                  disabled={deletingNoteId === selectedNoteId || !selectedNote}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-500/5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <label className="space-y-1.5 block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Note title"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Subject</span>
                <select
                  value={subjectId}
                  onChange={(event) => setSubjectId(event.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">No subject linked</option>
                  {subjects.map((subject: Subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-1.5 block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Tags</span>
              <input
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="comma-separated tags e.g. formulas, revision, proofs"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>

            <label className="space-y-1.5 block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Content</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={18}
                placeholder="Write your note content here..."
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d0d11] px-3 py-3 text-sm leading-6 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {isSaving ? 'Saving...' : selectedNoteId ? 'Update Note' : 'Save Note'}
              </button>
              <button
                type="button"
                onClick={resetEditor}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                New Note
              </button>
            </div>
          </div>

          {selectedNote && (
            <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Read Mode
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    The current note content is shown below for quick review.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/20 p-4 space-y-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {selectedNote.title}
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {selectedNote.content}
                </p>
                {selectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
